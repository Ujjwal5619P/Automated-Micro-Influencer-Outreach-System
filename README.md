# InfluenceAI — Automated Micro-Influencer Outreach System

## Assignment
EDXSO AI Engineer Intern — Assignment 1

## Overview
InfluenceAI is a prototype that discovers YouTube micro-influencers in the AI and Machine Learning niche, evaluates them against configurable qualification criteria, enriches public profile information, drafts personalized collaboration messages, and records simulated outreach.

The included SQLite database contains records sourced from the YouTube Data API v3. A fresh discovery run requires a valid `YOUTUBE_API_KEY` in `backend/.env`. It does not invent missing emails or audience demographics. Public emails extracted from channel descriptions are marked **unverified** until independently verified.

## Verified prototype results
The included SQLite snapshot was inspected on 12 November 2026. It contains 116 discovered creator records (all carrying YouTube Data API v3 as their source), 10 qualified records, one campaign, and two simulated outreach logs (one email and one Instagram DM).

| Metric | Observed result |
|---|---:|
| Discovered creator records in included database | 116 |
| Qualified creator records | 10 |
| Publicly listed contact emails (unverified) | 11 |
| Campaigns created in test | 1 |
| Simulated email outreach records | 1 |
| Simulated Instagram DM records | 1 |
| Emails actually sent | 0 |

These are accumulated database totals, not the output of one discovery request. Public emails are not verified for deliverability. The two outreach entries are simulations only; no email or Instagram message was actually sent.

## Technology
- Frontend: React, TypeScript, Vite
- Backend: Python, FastAPI
- Discovery source: YouTube Data API v3
- AI message generation: Google Gemini API (configured through a server-side environment variable)
- Persistence: SQLite
- Outreach: simulated/logged; no real messages are sent by the prototype

## Main workflow
1. Search YouTube for channels matching the selected niche and keywords.
2. Retrieve channel metadata and recent video statistics.
3. Calculate engagement from sampled videos: mean of `(likes + comments) / views * 100`.
4. Apply qualification rules, including follower range, country evidence, relevance, engagement, and recent activity.
5. Save discovered records to the local database.
6. Enrich records using publicly available channel information. Missing contact emails are stored as `Not Found`; extracted emails remain unverified.
7. Generate an email pitch and Instagram DM, with local fallback generation when Gemini is unavailable.
8. Save message drafts in browser local storage, create a campaign, and simulate outreach; simulated status is logged for tracking and analytics.

## Qualification configuration used in the demonstrated run
- Niche: AI & Machine Learning
- Country filter: India
- Subscriber range: 5,000–100,000
- Minimum engagement: 2%
- Keywords: AI, Python, Machine Learning
- Discovery cap: 300 search candidates

A channel's country is based on its public YouTube channel profile when available. Search region alone is not treated as proof of creator location. Activity is based on the sampled latest uploads, not the channel's lifetime upload count.

## Message constraints
- Email body: 60–90 words. Server and client validate the range; invalid Gemini output is replaced with a labelled fallback.
- Instagram DM: 15–30 words. Server and client validate the range; invalid Gemini output is replaced with a labelled fallback.
- Message generation is personalized from creator topics and available video information. When Gemini is unavailable, the API returns a clearly labelled `local-fallback` result.
- A fallback response is not a Gemini-generated response. Gemini was configured, but live generation was not confirmed successful during the recorded test because the provider returned temporary 503 high-demand errors.

## Running locally

### Backend
From the `backend` directory:

```powershell
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

Backend health:
```powershell
Invoke-RestMethod http://localhost:8000/api/health
```

API documentation:
`http://localhost:8000/docs`

### Frontend
From the project root:

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite (the project has been run at `http://localhost:3000`).

## Environment variables
Keep secrets out of source control.

`backend/.env`:
```env
YOUTUBE_API_KEY=your_youtube_data_api_key
```

Project-root `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

Do not commit either `.env` file. Use `.env.example` with placeholder values if publishing the repository.

## CSV exports
Included exports (generated directly from the included SQLite database):
- `submission/influencers_all.csv` — all 116 discovered candidates with qualification pass/fail and rejection reasons.
- `submission/influencers_qualified.csv` — the 10 qualified candidates.

Missing emails are explicitly `Not Found`; available emails are marked unverified.

## Outreach and safety limitations
- The prototype records simulated outreach only. `emailsSent: 0` in the included database analytics snapshot. Personalization drafts are saved in the current browser local storage; outreach simulation entries are persisted in SQLite.
- Instagram DM sending is not automated; the record is simulated/manual.
- Extracted public emails are not independently verified.
- YouTube Data API does not provide audience demographics for these records; unavailable demographics are left unavailable rather than fabricated.
- Respect YouTube API terms, platform rules, privacy, and applicable anti-spam requirements. Obtain appropriate consent and approval before any real outreach.

## Validation performed on the supplied project
- Python backend modules compile successfully.
- FastAPI smoke checks passed for health, influencer list, campaigns, outreach, and analytics endpoints.
- TypeScript/TSX source parsed with zero syntax diagnostics.
- A full Vite production build was not verified in this environment because dependency installation did not complete before the execution timeout; run `npm ci` and `npm run build` locally before submission.

## Verified API checks
The following endpoints responded successfully in the local test:
- `GET /api/v1/influencers`
- `POST /api/v1/campaigns`
- `GET /api/v1/campaigns`
- `POST /api/v1/outreach/simulate`
- `GET /api/v1/outreach`
- `GET /api/v1/analytics`
- `POST /api/v1/enrichment/run`
- `POST /api/v1/discovery/run`

## Demo walkthrough (2–3 minutes)
1. Open the dashboard and show the discovered and qualified creator totals.
2. Open the influencer database and show the real YouTube channel profile, subscriber count, engagement, recent videos, and public email provenance.
3. Show qualification pass/fail information and explain that unknown country or missing metrics are not guessed.
4. Open AI personalization and show an email and DM with their live word counts. If the provider is unavailable, point out the `local-fallback` label.
5. Open campaigns and show `InfluenceAI AI Creator Pilot`.
6. Open outreach tracker and show one simulated email and one simulated Instagram DM for AI with Thiru.
7. Open analytics and show the included database totals: 116 discovered, 10 qualified, two simulated outreach records, and zero emails actually sent.
8. Show the two CSV exports in the `submission` folder.

## Submission contents
Include:
- Source code (frontend and backend)
- `submission/influencers_all.csv`
- `submission/influencers_qualified.csv`
- This README
- Screenshots of dashboard, database, qualification, personalization, campaign, tracker, and analytics
- Optional short screen recording following the demo walkthrough

## Demo Video

A complete demonstration of InfluenceAI is available here:

[Watch Project Demonstration](https://drive.google.com/file/d/1ohaAlOJXcgOCIQmlPSLtWAcfxxZpPSD4/view?usp=sharing)

## Known limitations / future improvements
- Confirm successful live Gemini generation when provider availability is restored.
- Add exponential retry/backoff for transient Gemini errors (a bounded timeout is already present).
- Add independent email verification with a compliant provider, without guessing addresses.
- Add real email delivery only after explicit user approval and sender authentication.
- Add robust pagination and quota-aware discovery scheduling.
- Add unit/integration tests for campaign and outreach APIs, including duplicate-submission scenarios.

## Campaign management troubleshooting

Campaign create, edit, list, and delete operations are provided by the FastAPI routes under `/api/v1/campaigns`. The frontend now displays the backend error as a toast and keeps the create/edit form open if saving fails, rather than silently closing it. The backend campaign endpoints were smoke-tested with create/list/delete requests.

If a campaign does not save locally, confirm `http://localhost:8000/docs` is reachable, then check the browser DevTools Console/Network tab for the exact `/api/v1/campaigns` response.
"# Automated-Micro-Influencer-Outreach-System" 
