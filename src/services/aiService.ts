import { Influencer, Campaign } from '../types';

export interface GeneratedMessageResult {
  type: 'email' | 'instagram_dm';
  subject?: string;
  body: string;
  wordCount: number;
  reasoning: string;
  modelUsed: string;
  isFallback: boolean;
}

export function countWords(text: string): number {
  return (text || '').trim().split(/\s+/).filter(Boolean).length;
}

function clean(value: unknown, max = 180): string {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

// Channel names often begin with a brand (e.g. 'Unfold AI with Ajay').
// Prefer the person name after 'with' instead of greeting the brand as a person.
function greetingName(influencer: Influencer): string {
  const candidates = [influencer.channelTitle, influencer.name, influencer.handle]
    .map(value => clean(value, 100).replace(/^@/, ''))
    .filter(Boolean);
  for (const candidate of candidates) {
    const match = candidate.match(/\bwith\s+([A-Za-z][A-Za-z.'-]*)\s*$/i);
    if (match?.[1]) return match[1];
  }
  const handle = clean(influencer.handle, 100).replace(/^@/, '');
  const handleMatch = handle.match(/with([a-z][a-z.'-]*)$/i);
  if (handleMatch?.[1]) return handleMatch[1].charAt(0).toUpperCase() + handleMatch[1].slice(1);
  const name = clean(influencer.name || influencer.channelTitle, 100);
  return name.split(/\s+/)[0] || 'there';
}

function emailFallback(influencer: Influencer, campaign: Campaign): GeneratedMessageResult {
  const first = greetingName(influencer);
  const brand = clean(campaign.brandName, 35) || 'our platform';
  const evidence = clean(influencer.topics?.[0] || influencer.niche || 'technology', 35);
  const subject = `Creator partnership with ${brand}`;
  const body = `Hi ${first},

I saw your public content about ${evidence}. Its practical approach may interest developers learning and building with technology.

We are working on ${brand}, ${clean(campaign.brandPitch, 28) || 'practical developer tools'}. A useful walkthrough could help your audience understand the product through a real example, not a generic promotion.

Would you be open to discussing a paid tutorial, sponsorship, or hands-on review? I can share the brief, access details, deliverables, and proposed timeline for your consideration.

Best regards,
Partnerships Team`;
  return { type: 'email', subject, body, wordCount: countWords(body), reasoning: `Local fallback grounded in the creator's public topic: ${evidence}.`, modelUsed: 'InfluenceAI deterministic fallback', isFallback: true };
}

function dmFallback(influencer: Influencer, campaign: Campaign): GeneratedMessageResult {
  const first = greetingName(influencer);
  const evidence = clean(influencer.topics?.[0] || influencer.niche || 'technology', 30);
  const brand = clean(campaign.brandName, 30) || 'our platform';
  const body = `Hi ${first}, I liked your practical ${evidence} content. We are building ${brand} and would love to explore a useful paid creator collaboration. Open to details?`;
  return { type: 'instagram_dm', body, wordCount: countWords(body), reasoning: `Local fallback grounded in the creator's public topic: ${evidence}.`, modelUsed: 'InfluenceAI deterministic fallback', isFallback: true };
}

export async function generateOutreachMessage(params: {
  influencer: Influencer;
  campaign: Campaign;
  messageType: 'email' | 'instagram_dm';
  customNotes?: string;
  tone?: 'professional' | 'casual' | 'value_first';
}): Promise<GeneratedMessageResult> {
  const { influencer, campaign, messageType, customNotes, tone } = params;

  // Draft generation is independent of contact availability. A missing email
  // should block staging/sending, not prevent preparing a sample personalized pitch.
  try {
    const res = await fetch('/api/ai/generate-outreach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ influencer, campaign, messageType, customNotes, tone: tone || 'professional' }),
    });
    if (res.ok) {
      const data = await res.json();
      const body = clean(data.body, 4000);
      const words = countWords(body);
      const valid = messageType === 'email' ? words >= 60 && words <= 90 : words >= 15 && words <= 30;
      if (data.success && valid && (messageType !== 'email' || clean(data.subject, 120))) {
        return {
          type: messageType,
          subject: data.subject,
          body,
          wordCount: words,
          reasoning: data.reasoning || 'Personalized using available public creator information.',
          modelUsed: data.modelUsed || (data.fallback ? 'local-fallback' : 'Gemini (configured model)'),
          isFallback: Boolean(data.fallback),
        };
      }
    }
  } catch (err) {
    console.warn('Gemini generation failed; using deterministic fallback:', err);
  }

  const fallback = messageType === 'instagram_dm'
    ? dmFallback(influencer, campaign)
    : emailFallback(influencer, campaign);
  const valid = messageType === 'email'
    ? fallback.wordCount >= 60 && fallback.wordCount <= 90
    : fallback.wordCount >= 15 && fallback.wordCount <= 30;
  if (!valid) throw new Error(`Generated ${messageType} did not meet the required word count. Please edit the personalization details and retry.`);
  return fallback;
}
