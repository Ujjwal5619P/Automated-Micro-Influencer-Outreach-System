import os
import re
import json
import sqlite3
import socket
import ipaddress
from html.parser import HTMLParser
from urllib.parse import urljoin, urlparse, urlunparse
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# ------------------------------------------------------------
# Configuration
# ------------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

API_KEY = os.getenv("YOUTUBE_API_KEY")
BASE_URL = "https://www.googleapis.com/youtube/v3"
DB_PATH = Path(os.getenv("DATABASE_PATH", str(BASE_DIR / "influenceai.db"))).expanduser()

app = FastAPI(title="InfluenceAI Backend", version="1.4.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        *[origin.strip().rstrip("/") for origin in os.getenv("FRONTEND_ORIGIN", "").split(",") if origin.strip()],
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class DiscoveryRequest(BaseModel):
    niche: str = "AI & Machine Learning"
    country: str = "India"
    minFollowers: int = Field(default=5000, ge=0)
    maxFollowers: int = Field(default=100000, ge=1)
    minEngagement: float = Field(default=2.0, ge=0)
    keywords: list[str] = Field(default_factory=lambda: ["AI", "Python"])
    maxChannels: int = Field(default=300, ge=1, le=500)


class EnrichmentRequest(BaseModel):
    influencer_id: str = Field(min_length=1)


class LinkCollector(HTMLParser):
    """Collect links from a public HTML page without executing page scripts."""
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.links = []

    def handle_starttag(self, tag, attrs):
        if tag.lower() == "a":
            href = dict(attrs).get("href")
            if href:
                self.links.append(href.strip())


def is_public_http_url(url: str) -> bool:
    """Reject non-web URLs, local hosts, and private/reserved IP destinations."""
    try:
        parsed = urlparse(url)
        if parsed.scheme not in ("http", "https") or not parsed.hostname:
            return False
        host = parsed.hostname.lower().rstrip(".")
        if host in {"localhost", "localhost.localdomain"} or host.endswith((".local", ".internal", ".localhost")):
            return False
        try:
            addresses = [ipaddress.ip_address(host)]
        except ValueError:
            addresses = [
                ipaddress.ip_address(item[4][0])
                for item in socket.getaddrinfo(host, parsed.port or (443 if parsed.scheme == "https" else 80), type=socket.SOCK_STREAM)
            ]
        return bool(addresses) and all(addr.is_global for addr in addresses)
    except (ValueError, OSError, socket.gaierror):
        return False


def extract_public_urls(text: str) -> list[str]:
    found = re.findall(r"https?://[^\s<>\"']+|www\.[^\s<>\"']+", text or "", flags=re.I)
    urls = []
    for raw in found:
        raw = raw.rstrip(".,);]}")
        candidate = raw if raw.lower().startswith(("http://", "https://")) else f"https://{raw}"
        parsed = urlparse(candidate)
        if parsed.hostname and not any(x in parsed.hostname.lower() for x in ("youtube.com", "youtu.be", "instagram.com", "tiktok.com", "facebook.com", "twitter.com", "x.com")):
            if candidate not in urls:
                urls.append(candidate)
    return urls[:3]


def extract_emails_from_html(html: str) -> list[str]:
    # Extract only addresses visibly published in fetched public page source.
    candidates = re.findall(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", html or "")
    output = []
    for email in candidates:
        email = email.strip(".,;:()[]{}<>\"'")
        if email.lower().endswith((".png", ".jpg", ".jpeg", ".webp", ".svg")):
            continue
        if email not in output:
            output.append(email)
    return output


async def fetch_public_contact_pages(client: httpx.AsyncClient, seed_url: str) -> list[dict]:
    """Fetch a small number of explicitly linked public pages; never submit forms."""
    parsed = urlparse(seed_url)
    if not is_public_http_url(seed_url):
        return []

    root = urlunparse((parsed.scheme, parsed.netloc, "/", "", "", ""))
    candidates = [seed_url, urljoin(root, "contact"), urljoin(root, "about")]
    results = []
    visited = set()

    for page_url in candidates:
        normalized = page_url.split("#", 1)[0]
        if normalized in visited or urlparse(normalized).hostname != parsed.hostname:
            continue
        visited.add(normalized)
        if not is_public_http_url(normalized):
            continue
        try:
            response = await client.get(
                normalized,
                headers={"User-Agent": "InfluenceAIContactResearch/1.0 (+public business contact discovery)"},
                follow_redirects=False,
            )
            if response.status_code != 200:
                continue
            content_type = response.headers.get("content-type", "").lower()
            if "text/html" not in content_type:
                continue
            html = response.text[:1_000_000]
            for email in extract_emails_from_html(html):
                results.append({"email": email, "sourceUrl": str(response.url)})
        except (httpx.HTTPError, UnicodeError):
            continue
    return results


COUNTRY_CODES = {
    "india": "IN",
    "bangladesh": "BD",
    "canada": "CA",
    "united states": "US",
    "usa": "US",
    "united kingdom": "GB",
    "uk": "GB",
    "pakistan": "PK",
    "australia": "AU",
}

# Weighted terms used to assess whether the public channel content
# is relevant to the AI/technology niche. This is intentionally
# transparent and is not an ML classification model.
NICHE_TERMS = {
    "artificial intelligence": 3,
    "machine learning": 3,
    "deep learning": 3,
    "generative ai": 3,
    "data science": 3,
    "computer vision": 3,
    "natural language processing": 3,
    "agentic ai": 3,
    "large language model": 3,
    "neural network": 3,
    "python": 2,
    "programming": 2,
    "coding": 2,
    "software development": 2,
    "langchain": 2,
    "tensorflow": 2,
    "pytorch": 2,
    "llm": 2,
    "automation": 1,
    " ai ": 1,
    "technology": 1,
}

# ------------------------------------------------------------
# SQLite persistence
# ------------------------------------------------------------

def get_db_connection():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    with get_db_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS influencers (
                id TEXT PRIMARY KEY,
                data_json TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )
        connection.commit()


initialize_database()


def save_influencers(influencers: list[dict]) -> None:
    if not influencers:
        return

    timestamp = datetime.now(timezone.utc).isoformat()
    with get_db_connection() as connection:
        connection.executemany(
            """
            INSERT INTO influencers (id, data_json, updated_at)
            VALUES (?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                data_json = excluded.data_json,
                updated_at = excluded.updated_at
            """,
            [
                (
                    influencer["id"],
                    json.dumps(influencer, ensure_ascii=False),
                    timestamp,
                )
                for influencer in influencers
            ],
        )
        connection.commit()


def read_saved_influencers() -> list[dict]:
    with get_db_connection() as connection:
        rows = connection.execute(
            "SELECT data_json FROM influencers ORDER BY updated_at DESC"
        ).fetchall()

    output = []
    for row in rows:
        try:
            output.append(json.loads(row["data_json"]))
        except (TypeError, json.JSONDecodeError):
            continue
    return output


# ------------------------------------------------------------
# Helpers
# ------------------------------------------------------------

def get_country_code(country: str) -> Optional[str]:
    return COUNTRY_CODES.get(country.strip().lower())


def extract_email(description: str) -> Optional[str]:
    """Return only an email explicitly published in the channel description."""
    match = re.search(
        r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}",
        description or "",
    )
    return match.group(0) if match else None


def calculate_days_ago(published_at: str, now: datetime) -> Optional[int]:
    """Return None for missing/invalid/future dates instead of treating them as recent."""
    try:
        published = datetime.fromisoformat(
            published_at.replace("Z", "+00:00")
        )
        if published.tzinfo is None:
            published = published.replace(tzinfo=timezone.utc)
        days = (now - published).days
        return days if days >= 0 else None
    except (ValueError, TypeError, AttributeError):
        return None


def calculate_relevance(name: str, description: str, videos: list[dict]) -> int:
    searchable_text = (
        f" {name} {description} "
        + " ".join(video.get("title", "") for video in videos)
    ).lower()

    matched_terms = []
    for term, weight in NICHE_TERMS.items():
        if term == " ai ":
            found = " ai " in searchable_text
        else:
            found = re.search(
                rf"(?<![a-z0-9]){re.escape(term)}(?![a-z0-9])",
                searchable_text,
            ) is not None

        if found:
            matched_terms.append((term, weight))

    points = sum(weight for _, weight in matched_terms)
    # A score of 100 is reached at 10 weighted points.
    return min(100, round(points / 10 * 100))


def calculate_engagement(videos: list[dict]) -> float:
    rates = [
        (video["likes"] + video["comments"]) / video["views"] * 100
        for video in videos
        if video.get("views", 0) > 0
    ]
    return round(sum(rates) / len(rates), 2) if rates else 0.0


def build_qualification(
    *,
    country_matches: bool,
    country_known: bool,
    relevance_score: int,
    engagement: float,
    min_engagement: float,
    recent_uploads: int,
) -> dict:
    engagement_score = min(
        100,
        round(engagement / max(min_engagement * 2, 0.01) * 100),
    )
    activity_score = min(100, round(recent_uploads / 3 * 100))

    # Audience demographics are not available from public YouTube Data API.
    # The score is normalized across the 3 measurable dimensions only.
    overall_score = round(
        (relevance_score * 35 + engagement_score * 25 + activity_score * 20)
        / 80
    )

    reasons = []
    if not country_known:
        reasons.append("Creator country is not publicly specified")
    elif not country_matches:
        reasons.append("Country does not match requested country")

    if relevance_score < 25:
        reasons.append(
            f"Insufficient niche relevance ({relevance_score}/100)"
        )

    if engagement < min_engagement:
        reasons.append(
            f"Engagement {engagement}% is below "
            f"{min_engagement}% threshold"
        )

    if recent_uploads < 3:
        reasons.append(
            "Fewer than 3 of the latest 10 sampled uploads were published in the last 90 days"
        )

    return {
        "relevanceScore": relevance_score,
        "engagementScore": engagement_score,
        "activityScore": activity_score,
        "overallScore": overall_score,
        "passed": len(reasons) == 0,
        "rejectionReasons": reasons,
    }


async def youtube_get(
    client: httpx.AsyncClient,
    endpoint: str,
    params: dict,
) -> dict:
    if not API_KEY:
        raise HTTPException(
            status_code=503,
            detail="YOUTUBE_API_KEY is missing from backend/.env",
        )

    query = {**params, "key": API_KEY}

    try:
        response = await client.get(
            f"{BASE_URL}/{endpoint}",
            params=query,
        )
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail=f"YouTube API timed out while requesting {endpoint}",
        )
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"YouTube API connection failed: {exc}",
        )

    if response.status_code != 200:
        try:
            detail = response.json().get("error", {}).get(
                "message", response.text
            )
        except (ValueError, AttributeError):
            detail = response.text

        raise HTTPException(
            status_code=response.status_code,
            detail=f"YouTube API error: {detail}",
        )

    return response.json()


# ------------------------------------------------------------
# API endpoints
# ------------------------------------------------------------

@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "youtubeConfigured": bool(API_KEY),
        "database": "sqlite",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/api/v1/influencers")
async def get_influencers():
    influencers = read_saved_influencers()
    return {
        "influencers": influencers,
        "total": len(influencers),
        "source": "SQLite database",
    }


@app.post("/api/v1/enrichment/run")
async def run_enrichment(request: EnrichmentRequest):
    """Find publicly published business emails from a creator's own linked pages."""
    influencers = read_saved_influencers()
    influencer = next((item for item in influencers if item.get("id") == request.influencer_id), None)
    if influencer is None:
        raise HTTPException(status_code=404, detail="Influencer not found in the saved database")

    now = datetime.now(timezone.utc).isoformat()
    existing_email = influencer.get("contactEmail")
    sources = influencer.get("enrichmentSources", [])
    discovered = []

    # The YouTube channel description is already stored from the official API response.
    if existing_email and existing_email != "Not Found":
        discovered.append({
            "email": existing_email,
            "sourceUrl": influencer.get("profileUrl", ""),
            "sourceType": "YouTube channel description (previously extracted)",
        })

    website_urls = extract_public_urls(influencer.get("bio", ""))
    if influencer.get("website"):
        website_urls = list(dict.fromkeys([influencer["website"], *website_urls]))[:3]

    async with httpx.AsyncClient(timeout=httpx.Timeout(8.0, connect=4.0), limits=httpx.Limits(max_connections=4)) as client:
        for website_url in website_urls:
            pages = await fetch_public_contact_pages(client, website_url)
            for item in pages:
                discovered.append({
                    "email": item["email"],
                    "sourceUrl": item["sourceUrl"],
                    "sourceType": "Public linked website/contact page",
                })

    # Prefer the first email found from an explicitly linked public source.
    unique = []
    seen = set()
    for item in discovered:
        key = item["email"].lower()
        if key not in seen:
            seen.add(key)
            unique.append(item)

    if unique:
        selected = unique[0]
        influencer["contactEmail"] = selected["email"]
        influencer["emailStatus"] = "unverified"
        influencer["emailSource"] = selected["sourceUrl"]
        influencer["emailSourceType"] = selected["sourceType"]
        influencer["emailFoundAt"] = now
        influencer["enrichmentStatus"] = "partial"
        influencer["missingFields"] = [
            field for field in influencer.get("missingFields", [])
            if field != "Public contact email"
        ]
        if "Email verification" not in influencer["missingFields"]:
            influencer["missingFields"].append("Email verification")
    else:
        influencer["contactEmail"] = "Not Found"
        influencer["emailStatus"] = "unavailable"
        influencer["emailSource"] = None
        influencer["emailFoundAt"] = None
        missing = influencer.setdefault("missingFields", [])
        if "Public contact email" not in missing:
            missing.append("Public contact email")

    influencer["enrichmentSources"] = unique
    influencer["website"] = website_urls[0] if website_urls else influencer.get("website")
    influencer["lastUpdated"] = now
    save_influencers([influencer])

    # Return the influencer object directly to match the existing frontend
    # FastAPIServiceClient.runEnrichment() contract.
    influencer["enrichmentResult"] = {
        "emailFound": bool(unique),
        "emailsFound": len(unique),
        "sourcesChecked": len(website_urls),
        "message": (
            "Public email found. It is not independently verified."
            if unique else "No public email found on the channel description or checked linked pages. Kept as Not Found."
        ),
    }
    return influencer


@app.post("/api/v1/discovery/run")
async def run_discovery(request: DiscoveryRequest):
    if not API_KEY:
        raise HTTPException(
            status_code=503,
            detail="YOUTUBE_API_KEY is missing from backend/.env",
        )

    if request.minFollowers > request.maxFollowers:
        raise HTTPException(
            status_code=400,
            detail="minFollowers cannot exceed maxFollowers",
        )

    now = datetime.now(timezone.utc)
    country_code = get_country_code(request.country)

    keywords = list(
        dict.fromkeys(
            keyword.strip()
            for keyword in request.keywords
            if keyword and keyword.strip()
        )
    ) or ["AI", "Python"]

    # Search a wider set of relevant phrases. These are discovery queries,
    # not claims that every returned channel is India-based or qualified.
    search_terms = [
        "AI India",
        "artificial intelligence India",
        "AI engineer India",
        "machine learning India",
        "Python programming India",
        "data science India",
        "deep learning India",
        "generative AI India",
        "computer vision India",
        "coding tutorials India",
        "technology education India",
        "LLM developers India",
    ]

    # Include user-provided keywords without duplicating the built-in queries.
    search_terms = list(dict.fromkeys(
        [term for term in keywords if term.strip()] + search_terms
    ))

    channel_ids = []

    async with httpx.AsyncClient(timeout=60) as client:
        # Up to 2 pages per query (max 2 * number_of_search_terms calls).
        # search.list is quota-expensive, so we cap the number of queries.
        for term in search_terms[:12]:
            page_token = None

            for _ in range(2):
                params = {
                    "part": "snippet",
                    "type": "channel",
                    "q": term,
                    "maxResults": 50,
                }

                # Search region is only a discovery hint, not proof of location.
                if country_code:
                    params["regionCode"] = country_code

                if page_token:
                    params["pageToken"] = page_token

                data = await youtube_get(client, "search", params)

                for item in data.get("items", []):
                    channel_id = item.get("id", {}).get("channelId")
                    if channel_id and channel_id not in channel_ids:
                        channel_ids.append(channel_id)

                page_token = data.get("nextPageToken")
                if not page_token or len(channel_ids) >= request.maxChannels:
                    break

            if len(channel_ids) >= request.maxChannels:
                break

        if not channel_ids:
            return {
                "influencers": [],
                "total": 0,
                "qualified": 0,
                "source": "YouTube Data API v3",
                "message": "No channels were returned for these search terms.",
            }

        channel_ids = channel_ids[: request.maxChannels]

        # Fetch channel details in API-supported batches of up to 50 IDs.
        channels = []
        for start in range(0, len(channel_ids), 50):
            batch = channel_ids[start : start + 50]
            data = await youtube_get(
                client,
                "channels",
                {
                    "part": "snippet,statistics,contentDetails",
                    "id": ",".join(batch),
                },
            )
            channels.extend(data.get("items", []))

        results = []

        for channel in channels:
            stats = channel.get("statistics", {})
            snippet = channel.get("snippet", {})
            content = channel.get("contentDetails", {})

            if stats.get("hiddenSubscriberCount"):
                continue

            subscribers = int(stats.get("subscriberCount", 0))
            if not request.minFollowers <= subscribers <= request.maxFollowers:
                continue

            channel_id = channel["id"]
            name = snippet.get("title", "Unknown creator")
            description = snippet.get("description", "")
            creator_country = snippet.get("country")

            # A missing country is not assumed to be India.
            country_known = bool(creator_country)
            country_matches = (
                creator_country == country_code
                if country_code and country_known
                else (not country_code)
            )
            country_display = creator_country or "Not Found"

            # Get up to the latest 10 uploaded videos.
            uploads_playlist = (
                content.get("relatedPlaylists", {}).get("uploads")
            )
            videos = []

            if uploads_playlist:
                # Some channels expose an uploads playlist ID that YouTube
                # later marks unavailable (deleted/restricted/invalid). This
                # is a channel-level data gap, not a reason to abort discovery.
                try:
                    playlist = await youtube_get(
                        client,
                        "playlistItems",
                        {
                            "part": "snippet",
                            "playlistId": uploads_playlist,
                            "maxResults": 10,
                        },
                    )
                except HTTPException as exc:
                    detail = str(exc.detail).lower()
                    playlist_unavailable = (
                        exc.status_code in (400, 404)
                        and "playlist" in detail
                        and ("cannot be found" in detail or "not found" in detail
                             or "invalid" in detail)
                    )
                    if not playlist_unavailable:
                        raise
                    playlist = {"items": []}

                video_ids = [
                    item.get("snippet", {})
                    .get("resourceId", {})
                    .get("videoId")
                    for item in playlist.get("items", [])
                ]
                video_ids = [video_id for video_id in video_ids if video_id]

                if video_ids:
                    video_data = await youtube_get(
                        client,
                        "videos",
                        {
                            "part": "snippet,statistics",
                            "id": ",".join(video_ids),
                        },
                    )

                    for video in video_data.get("items", []):
                        video_stats = video.get("statistics", {})
                        video_snippet = video.get("snippet", {})
                        published = video_snippet.get("publishedAt", "")
                        days_ago = calculate_days_ago(published, now)

                        videos.append(
                            {
                                "id": video["id"],
                                "title": video_snippet.get("title", ""),
                                "views": int(video_stats.get("viewCount", 0)),
                                "likes": int(video_stats.get("likeCount", 0)),
                                "comments": int(video_stats.get("commentCount", 0)),
                                "publishedDate": published,
                                "daysAgo": days_ago,
                                "url": f"https://www.youtube.com/watch?v={video['id']}",
                            }
                        )

            engagement = calculate_engagement(videos)
            recent_uploads = sum(
                1
                for video in videos
                if video["daysAgo"] is not None and video["daysAgo"] <= 90
            )

            relevance_score = calculate_relevance(
                name,
                description,
                videos,
            )

            qualification = build_qualification(
                country_matches=country_matches,
                country_known=country_known,
                relevance_score=relevance_score,
                engagement=engagement,
                min_engagement=request.minEngagement,
                recent_uploads=recent_uploads,
            )

            email = extract_email(description)
            thumbnails = snippet.get("thumbnails", {})
            avatar = (
                thumbnails.get("high", {}).get("url")
                or thumbnails.get("default", {}).get("url", "")
            )

            missing_fields = []
            if not email:
                missing_fields.append("Public contact email")
            missing_fields.append("Audience demographics")
            missing_fields.append("Email verification")

            results.append(
                {
                    "id": channel_id,
                    "name": name,
                    "handle": snippet.get("customUrl") or channel_id,
                    "channelTitle": name,
                    "platform": "youtube",
                    "avatarUrl": avatar,
                    "profileUrl": f"https://www.youtube.com/channel/{channel_id}",
                    "subscribers": subscribers,
                    "engagementRate": engagement,
                    "country": country_display,
                    "niche": request.niche,
                    "secondaryNiches": [],
                    "topics": keywords,
                    "bio": description,
                    "contactEmail": email or "Not Found",
                    "emailStatus": "unverified" if email else "unavailable",
                    "recentVideos": videos,
                    "uploadsLast90Days": recent_uploads,
                    "qualification": qualification,
                    "demographics": {
                        "ageRanges": [],
                        "gender": {},
                        "topCountries": [],
                        "dataAvailable": False,
                    },
                    "enrichmentStatus": "partial",
                    "missingFields": missing_fields,
                    "lastUpdated": now.isoformat(),
                    "campaignIds": [],
                    "dataSource": "YouTube Data API v3",
                    "countrySource": (
                        "YouTube channel profile"
                        if country_known
                        else "Not publicly specified"
                    ),
                    "activitySample": "Latest 10 uploads only",
                }
            )

    # Persist every returned candidate so the database view can load them later.
    save_influencers(results)

    qualified_count = sum(
        1 for influencer in results
        if influencer["qualification"]["passed"]
    )

    saved_dataset = read_saved_influencers()
    return {
        # Return the complete persistent dataset so the UI never replaces prior records.
        "influencers": saved_dataset,
        "newlyDiscovered": len(results),
        "total": len(saved_dataset),
        "qualified": sum(1 for influencer in saved_dataset if influencer.get("qualification", {}).get("passed")),
        "source": "YouTube Data API v3",
        "savedToDatabase": True,
        "searchCandidates": len(channel_ids),
        "note": (
            "Activity is calculated from the latest 10 sampled uploads. "
            "Country is only confirmed when the channel profile publicly "
            "specifies it. Public emails are extracted only from channel "
            "descriptions and are not verified."
        ),
    }


# ---------------- Campaigns, filtering, simulation and analytics ----------------
from uuid import uuid4
from collections import Counter
from fastapi import Body


def init_outreach_tables():
    with get_db_connection() as db:
        db.execute("CREATE TABLE IF NOT EXISTS campaigns (id TEXT PRIMARY KEY, data_json TEXT NOT NULL)")
        db.execute("CREATE TABLE IF NOT EXISTS outreach_logs (id TEXT PRIMARY KEY, campaign_id TEXT NOT NULL, influencer_id TEXT NOT NULL, channel_type TEXT NOT NULL, data_json TEXT NOT NULL, UNIQUE(campaign_id,influencer_id,channel_type))")

init_outreach_tables()

# Seed one genuine, clearly identified starter campaign when the persistent
# campaign table is empty. This prevents a null active campaign on first run.
with get_db_connection() as _db:
    _campaign_count = _db.execute('SELECT COUNT(*) FROM campaigns').fetchone()[0]
    if _campaign_count == 0:
        _default_campaign = {
            'id': 'camp-tech-ai-in',
            'name': 'Indian Tech & AI Micro-Influencers',
            'brandName': 'AgentScale AI',
            'brandDescription': 'Developer platform for agentic AI workflows and evaluation.',
            'brandPitch': 'AgentScale AI helps developers evaluate and monitor agent workflows.',
            'targetNiche': 'AI, Machine Learning & Software Engineering',
            'targetGeography': 'India',
            'platform': 'youtube',
            'followerRangeMin': 5000,
            'followerRangeMax': 100000,
            'engagementThreshold': 2.0,
            'collaborationType': 'dedicated_video',
            'objective': 'developer_signups',
            'status': 'active',
            'createdAt': datetime.now(timezone.utc).isoformat(),
            'influencerCount': 0,
        }
        _db.execute('INSERT INTO campaigns (id,data_json) VALUES (?,?)', (_default_campaign['id'], json.dumps(_default_campaign)))


def records(table):
    with get_db_connection() as db:
        return [json.loads(row[0]) for row in db.execute(f"SELECT data_json FROM {table}").fetchall()]


def put_record(table, item):
    with get_db_connection() as db:
        db.execute(f"INSERT OR REPLACE INTO {table} (id,data_json) VALUES (?,?)", (item['id'],json.dumps(item,ensure_ascii=False)))


@app.get('/api/v1/campaigns')
def campaigns_list():
    return records('campaigns')


@app.post('/api/v1/campaigns')
def campaigns_create(payload: dict = Body(...)):
    if not str(payload.get('name','')).strip():
        raise HTTPException(422,'Campaign name required')
    item = {**payload,'id':str(uuid4()),'createdAt':datetime.now(timezone.utc).isoformat(),'influencerCount':0}
    put_record('campaigns',item)
    return item


@app.put('/api/v1/campaigns/{campaign_id}')
def campaigns_update(campaign_id: str, payload: dict = Body(...)):
    old=next((x for x in records('campaigns') if x['id']==campaign_id),None)
    if old is None: raise HTTPException(404,'Campaign not found')
    old.update({k:v for k,v in payload.items() if k not in ('id','createdAt')})
    put_record('campaigns',old)
    return old


@app.delete('/api/v1/campaigns/{campaign_id}')
def campaigns_delete(campaign_id: str):
    with get_db_connection() as db:
        cur=db.execute('DELETE FROM campaigns WHERE id=?',(campaign_id,))
    if cur.rowcount==0: raise HTTPException(404,'Campaign not found')
    return {'deleted':True}


@app.post('/api/v1/filter/run')
def filtering_run(payload: dict = Body(...)):
    criteria=payload.get('criteria') or {}
    low=float(criteria.get('minFollowers',criteria.get('minSubscribers',5000)) or 0)
    high=float(criteria.get('maxFollowers',criteria.get('maxSubscribers',100000)) or 100000)
    min_eng=float(criteria.get('minEngagement',criteria.get('minEngagementRate',2)) or 0)
    passed=[];failed=[];updated=[]
    for inf in read_saved_influencers():
        reasons=[]
        n=float(inf.get('subscribers') or 0)
        if not low<=n<=high: reasons.append('Follower range')
        if float(inf.get('engagementRate') or 0)<min_eng: reasons.append('Engagement below minimum')
        if not inf.get('qualification',{}).get('passed'): reasons.extend(inf.get('qualification',{}).get('rejectionReasons') or ['Discovery qualification failed'])
        inf['qualification']={**inf.get('qualification',{}),'passed':not reasons,'rejectionReasons':list(dict.fromkeys(reasons))}
        (passed if not reasons else failed).append(inf)
        updated.append(inf)
    save_influencers(updated)
    return {'passed':passed,'failed':failed,'updatedInfluencers':updated}


@app.get('/api/v1/outreach')
def outreach_list():
    return records('outreach_logs')


@app.post('/api/v1/outreach/simulate')
def outreach_simulate(payload: dict = Body(...)):
    influencer_id=str(payload.get('influencerId') or '')
    campaign_id=str(payload.get('campaignId') or '')
    channel=payload.get('messageType')
    body=str(payload.get('body') or '').strip()
    if channel not in ('email','instagram_dm') or not body:
        raise HTTPException(422,'Valid messageType and body required')
    inf=next((x for x in read_saved_influencers() if x['id']==influencer_id),None)
    camp=next((x for x in records('campaigns') if x['id']==campaign_id),None)
    if not inf or not camp: raise HTTPException(404,'Influencer or campaign not found')
    if not inf.get('qualification',{}).get('passed'): raise HTTPException(422,'Influencer is not qualified')
    if channel=='email' and (not inf.get('contactEmail') or inf['contactEmail']=='Not Found'):
        raise HTTPException(422,'No public contact email found')
    wc=len(body.split())
    if channel=='email' and not 60<=wc<=90: raise HTTPException(422,'Email body must be 60-90 words')
    if channel=='instagram_dm' and not 15<=wc<=30: raise HTTPException(422,'DM must be 15-30 words')
    with get_db_connection() as db:
        exists=db.execute('SELECT id FROM outreach_logs WHERE campaign_id=? AND influencer_id=? AND channel_type=?',(campaign_id,influencer_id,channel)).fetchone()
    if exists: raise HTTPException(409,'Duplicate outreach blocked for this campaign, influencer and channel')
    now=datetime.now(timezone.utc)
    from datetime import timedelta
    log={'id':str(uuid4()),'influencerId':influencer_id,'influencerName':inf.get('name','Creator'),'influencerEmail':inf.get('contactEmail') if channel=='email' else None,'influencerHandle':inf.get('handle',''),'platform':inf.get('platform','youtube'),'campaignId':campaign_id,'campaignName':camp.get('name',''),'channelType':channel,'subject':payload.get('subject') or '', 'messagePreview':body[:100]+('...' if len(body)>100 else ''),'status':'simulated','date':now.isoformat(),'deliveryMode':'simulation','followUpStatus':'scheduled','followUpDate':(now+timedelta(days=5)).date().isoformat()}
    with get_db_connection() as db:
        try:
            db.execute('INSERT INTO outreach_logs (id,campaign_id,influencer_id,channel_type,data_json) VALUES (?,?,?,?,?)',(log['id'],campaign_id,influencer_id,channel,json.dumps(log,ensure_ascii=False)))
        except sqlite3.IntegrityError: raise HTTPException(409,'Duplicate outreach blocked')
    return log


@app.patch('/api/v1/outreach/{log_id}')
def outreach_update(log_id: str, payload: dict = Body(...)):
    allowed={'draft','pending_approval','simulated','sent','replied','failed'}
    status=payload.get('status')
    if status not in allowed: raise HTTPException(422,'Invalid outreach status')
    with get_db_connection() as db:
        row=db.execute('SELECT data_json FROM outreach_logs WHERE id=?',(log_id,)).fetchone()
        if row is None: raise HTTPException(404,'Outreach log not found')
        log=json.loads(row[0]);log['status']=status
        db.execute('UPDATE outreach_logs SET data_json=? WHERE id=?',(json.dumps(log,ensure_ascii=False),log_id))
    return log


@app.get('/api/v1/analytics')
def analytics_summary():
    influencers=read_saved_influencers(); logs=records('outreach_logs'); total=len(influencers)
    qualified=sum(bool(x.get('qualification',{}).get('passed')) for x in influencers)
    enriched=sum(bool(x.get('contactEmail')) and x.get('contactEmail')!='Not Found' for x in influencers)
    statuses=Counter(x.get('status','unknown') for x in logs)
    platforms=Counter(x.get('platform','unknown') for x in influencers)
    niches=Counter(x.get('niche','Unknown') for x in influencers)
    email_logs=[x for x in logs if x.get('channelType')=='email']
    emails_sent=sum(1 for x in email_logs if x.get('status') in ('sent','replied'))
    emails_replied=sum(1 for x in email_logs if x.get('status')=='replied')
    simulated=sum(1 for x in logs if x.get('status')=='simulated')
    def funnel(stage,n):return {'stage':stage,'count':n,'percentage':round(100*n/total) if total else 0}
    return {'totalDiscovered':total,'qualifiedCount':qualified,'avgEngagementRate':round(sum(float(x.get('engagementRate') or 0) for x in influencers)/total,2) if total else 0,'emailsGenerated':len(email_logs),'emailsSent':emails_sent,'pendingOutreach':statuses['pending_approval']+statuses['draft'],'replyRate':round(100*emails_replied/emails_sent,1) if emails_sent else 0,'discoveryFunnel':[funnel('Discovered',total),funnel('Qualified',qualified),funnel('Public email found',enriched),funnel('Outreach simulated',simulated),funnel('Replied',emails_replied)],'platformBreakdown':[{'platform':k.title(),'count':v,'percentage':round(100*v/total) if total else 0} for k,v in platforms.items()],'nicheBreakdown':[{'niche':k,'count':v} for k,v in niches.items()],'outreachStatusDistribution':[{'status':k.replace('_',' ').title(),'count':v} for k,v in statuses.items()],'discoveryTrend':[]}
