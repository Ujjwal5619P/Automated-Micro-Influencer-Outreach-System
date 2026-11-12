import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini AI Client
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Deterministic fallback used only when Gemini is temporarily unavailable.
// It is labelled as a fallback and never claims an email was sent.
function countWords(value: string): number {
  return (value.trim().match(/\S+/g) || []).length;
}

function getGreetingName(influencer: any): string {
  const candidates = [influencer?.channelTitle, influencer?.name, influencer?.handle]
    .filter(Boolean).map((value: unknown) => String(value).replace(/^@/, '').replace(/\s+/g, ' ').trim());
  for (const candidate of candidates) {
    const match = candidate.match(/\bwith\s+([A-Za-z][A-Za-z.'-]*)\s*$/i);
    if (match?.[1]) return match[1].slice(0, 24);
  }
  const handle = String(influencer?.handle || '').replace(/^@/, '');
  const handleMatch = handle.match(/with([a-z][a-z.'-]*)$/i);
  if (handleMatch?.[1]) return handleMatch[1].charAt(0).toUpperCase() + handleMatch[1].slice(1, 24);
  return String(influencer?.name || influencer?.channelTitle || 'there').split(/\s+/)[0].slice(0, 24);
}

function buildFallback(messageType: string, influencer: any, campaign: any) {
  const creator = getGreetingName(influencer);
  const brand = String(campaign?.brandName || 'our platform').slice(0, 24);
  const topic = String((influencer.topics || [])[0] || influencer.niche || 'technology').replace(/\s+/g, ' ').slice(0, 28);
  if (messageType === 'instagram_dm') {
    const body = `Hi ${creator}, I liked your practical ${topic} content. We are building ${brand} and would love to explore a useful paid creator collaboration. Open to details?`;
    return { success: true, fallback: true, subject: '', body, wordCount: countWords(body), reasoning: 'Deterministic fallback grounded in public creator topic data.', modelUsed: 'local-fallback' };
  }
  const subject = `${brand} creator partnership`;
  const body = `Hi ${creator},\n\nI saw your public content about ${topic}. Its practical approach may interest developers learning and building with technology.\n\nWe are working on ${brand}, practical developer tools. A useful walkthrough could help your audience understand the product through a real example, not a generic promotion.\n\nWould you be open to discussing a paid tutorial, sponsorship, or hands-on review? I can share the brief, access details, deliverables, and proposed timeline for your consideration.\n\nBest regards,\nPartnerships Team`;
  return { success: true, fallback: true, subject, body, wordCount: countWords(body), reasoning: 'Deterministic fallback grounded in public creator topic data.', modelUsed: 'local-fallback' };
}

// AI Outreach Message Generation Endpoint
app.post('/api/ai/generate-outreach', async (req, res) => {
  try {
    const {
      influencer,
      campaign,
      messageType, // 'email' | 'instagram_dm'
      customNotes,
      tone, // 'professional' | 'casual' | 'value_first'
    } = req.body;

    if (!influencer) {
      return res.status(400).json({ error: 'Influencer data is required' });
    }

    if (!aiClient) {
      return res.status(200).json({
        ...buildFallback(messageType, influencer, campaign),
        fallback: true,
        error: 'GEMINI_API_KEY is not configured; local fallback used.',
      });
    }

    const brandName = campaign?.brandName || 'InfluenceAI / Developer Platform';
    const brandPitch = campaign?.brandPitch || 'an AI developer tooling platform that accelerates LLM pipelines and agent evaluation';
    const creatorName = getGreetingName(influencer);
    const channelDisplayName = influencer.channelTitle || influencer.name || 'Creator';
    const channelName = channelDisplayName;
    const recentVideos = (influencer.recentVideos || [])
      .slice(0, 3)
      .map((v: any) => `"${v.title}" (${v.views?.toLocaleString?.() || 'views'})`)
      .join(', ');
    const topics = (influencer.topics || []).join(', ');

    let prompt = '';

    if (messageType === 'instagram_dm') {
      prompt = `
You are an expert DevRel & creator partnership lead reaching out to a developer/creator on Instagram DM.
Address the person as '${creatorName}' in the greeting. Do not greet them using the first word of their channel/brand name. Channel display name: ${channelName}.
Draft an Instagram Direct Message following these strict rules:
1. Length: STRICTLY 15-30 words.
2. Tone: Natural, conversational, friendly yet professional.
3. Personalization: Mention their specific content focus: ${topics || 'tech tutorials'} or recent work (${recentVideos || 'their coding videos'}).
4. Offer: Ask if they are open to a quick collaboration with ${brandName} (${brandPitch}).
5. No fake enthusiasm or spam vibes. No hashtags.
6. Output format: Return pure text of the DM without quotes, explanations, or subject lines.
      `.trim();
    } else {
      prompt = `
You are an expert DevRel & creator partnership lead reaching out to a developer/creator for a sponsorship/collaboration.
Address the person as '${creatorName}' in the greeting. Do not greet them using the first word of their channel/brand name. Channel display name: ${channelName}.
Draft a personalized collaboration email following these strict rules:
1. Word Count: STRICTLY 60-90 words.
2. Structure:
   - Personalized Subject Line (compelling, no clickbait, 4-7 words)
   - Warm personalized opening acknowledging their specific content: ${recentVideos ? `recent video on ${recentVideos}` : topics}.
   - Clear Brand-fit explanation: Why ${brandName} is uniquely relevant to their audience (${brandPitch}).
   - Concrete collaboration proposal: Paid sponsorship, dedicated tutorial, or tooling review.
   - Low-friction professional call to action.
3. Output strictly valid JSON matching this schema:
{
  "subject": "Personalized Subject Line",
  "body": "Email body text formatted with standard line breaks",
  "reasoning": "1-sentence note explaining the specific personalization angle chosen"
}
      `.trim();
    }

    // Do not let a slow/overloaded Gemini request hold the HTTP response forever.
    // Promise.race returns control to this route after 15 seconds; the catch below
    // then returns the local fallback message.
    const generationPromise = aiClient.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: messageType === 'email' ? {
        responseMimeType: 'application/json',
      } : undefined,
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Gemini request timed out after 15 seconds; local fallback used.')), 15000);
    });

    const response = await Promise.race([generationPromise, timeoutPromise]);

    const rawText = response.text || '';

    if (messageType === 'email') {
      try {
        const parsed = JSON.parse(rawText);
        if (countWords(String(parsed.body || '')) < 60 || countWords(String(parsed.body || '')) > 90 || !String(parsed.subject || '').trim()) {
          return res.json({ ...buildFallback(messageType, influencer, campaign), error: 'Gemini output failed the 60–90 word validation; local fallback used.' });
        }
        return res.json({ success: true, subject: parsed.subject, body: parsed.body, reasoning: parsed.reasoning || 'Personalized using public creator and campaign context.', modelUsed: GEMINI_MODEL, fallback: false });
      } catch (parseErr) {
        // Fallback to text parsing if JSON formatting wasn't clean
        return res.json({
          success: true,
          subject: `Partnership: ${brandName} x ${channelName}`,
          body: rawText,
          reasoning: 'Generated by the configured Gemini model.',
          modelUsed: GEMINI_MODEL,
        });
      }
    } else {
      const dmBody = rawText.trim().replace(/^"|"$/g, '');
      if (countWords(dmBody) < 15 || countWords(dmBody) > 30) {
        return res.json({ ...buildFallback(messageType, influencer, campaign), error: 'Gemini output failed the 15–30 word validation; local fallback used.' });
      }
      return res.json({ success: true, body: dmBody, reasoning: 'Personalized using public creator and campaign context.', modelUsed: GEMINI_MODEL, fallback: false });
    }
  } catch (err: any) {
    console.error('Gemini generation error in server:', err);
    const fallback = buildFallback(req.body?.messageType, req.body?.influencer || {}, req.body?.campaign || {});
    return res.status(200).json({
      ...fallback,
      fallback: true,
      error: err.message || 'Gemini generation failed; local fallback used.',
    });
  }
});

// Setup Vite middleware in dev or serve static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`InfluenceAI Server running on port ${PORT}`);
  });
}

startServer();
