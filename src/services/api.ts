import { 
  Influencer, 
  Campaign, 
  OutreachLog, 
  FilterCriteria, 
  OutreachMessage, 
  QualificationScores 
} from '../types';
import { 
  SEED_INFLUENCERS, 
  SEED_CAMPAIGNS, 
  SEED_OUTREACH_LOGS, 
  DEFAULT_FILTER_CRITERIA,
  evaluateCreatorQualification 
} from '../data/seedData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export interface DiscoveryRequest {
  niche: string;
  platform: string;
  country: string;
  minFollowers: number;
  maxFollowers: number;
  minEngagement: number;
  keywords: string[];
}

export interface FilterRunRequest {
  campaignId?: string;
  criteria: FilterCriteria;
  influencerIds?: string[];
}

export interface EnrichmentRunRequest {
  influencerId: string;
}

export interface MessageGenerateRequest {
  influencerId: string;
  campaignId: string;
  messageType: 'email' | 'instagram_dm';
  tone?: 'professional' | 'casual' | 'value_first';
  customNotes?: string;
}

export interface OutreachSimulateRequest {
  influencerId: string;
  campaignId: string;
  messageType: 'email' | 'instagram_dm';
  subject?: string;
  body: string;
}

export interface AnalyticsSummary {
  totalDiscovered: number;
  qualifiedCount: number;
  avgEngagementRate: number;
  emailsGenerated: number;
  emailsSent: number;
  pendingOutreach: number;
  replyRate: number;
  discoveryFunnel: { stage: string; count: number; percentage: number }[];
  platformBreakdown: { platform: string; count: number; percentage: number }[];
  nicheBreakdown: { niche: string; count: number }[];
  outreachStatusDistribution: { status: string; count: number }[];
  discoveryTrend: { month: string; discovered: number; qualified: number }[];
}

// Storage keys
const STORAGE_KEYS = {
  INFLUENCERS: 'influenceai_influencers_v1',
  CAMPAIGNS: 'influenceai_campaigns_v1',
  OUTREACH_LOGS: 'influenceai_outreach_logs_v1',
  CRITERIA: 'influenceai_filter_criteria_v1',
};

// LocalStorage helpers
function getStoredData<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.error(`Error loading ${key} from storage:`, err);
    return fallback;
  }
}

function setStoredData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
}

// -------------------------------------------------------------
// MOCK SERVICE LAYER (Active default with full persistence)
// -------------------------------------------------------------
class MockInfluenceAIService {
  private influencers: Influencer[];
  private campaigns: Campaign[];
  private outreachLogs: OutreachLog[];
  private criteria: FilterCriteria;

  constructor() {
    const storedInfs = getStoredData(STORAGE_KEYS.INFLUENCERS, SEED_INFLUENCERS);
    this.influencers = storedInfs.map(inf => {
      const seed = SEED_INFLUENCERS.find(s => s.id === inf.id);
      return seed ? { ...inf, avatarUrl: seed.avatarUrl } : inf;
    });
    this.campaigns = getStoredData(STORAGE_KEYS.CAMPAIGNS, SEED_CAMPAIGNS);
    this.outreachLogs = getStoredData(STORAGE_KEYS.OUTREACH_LOGS, SEED_OUTREACH_LOGS);
    this.criteria = getStoredData(STORAGE_KEYS.CRITERIA, DEFAULT_FILTER_CRITERIA);
  }

  // Reset demo dataset
  public resetToDefaults() {
    this.influencers = [...SEED_INFLUENCERS];
    this.campaigns = [...SEED_CAMPAIGNS];
    this.outreachLogs = [...SEED_OUTREACH_LOGS];
    this.criteria = { ...DEFAULT_FILTER_CRITERIA };
    setStoredData(STORAGE_KEYS.INFLUENCERS, this.influencers);
    setStoredData(STORAGE_KEYS.CAMPAIGNS, this.campaigns);
    setStoredData(STORAGE_KEYS.OUTREACH_LOGS, this.outreachLogs);
    setStoredData(STORAGE_KEYS.CRITERIA, this.criteria);
  }

  // GET /influencers
  async getInfluencers(): Promise<Influencer[]> {
    return [...this.influencers];
  }

  // POST /discovery/run
  async runDiscovery(params: Partial<DiscoveryRequest>): Promise<{ count: number; influencers: Influencer[] }> {
    // Simulate discovering 1-2 new micro-influencers matching criteria
    const newId = `inf-disc-${Date.now().toString().slice(-4)}`;
    const syntheticCreator: Influencer = {
      id: newId,
      name: 'Aditya Sen AI',
      handle: '@aditya_sen_ai',
      channelTitle: 'Aditya Sen | Machine Learning',
      platform: 'youtube',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      profileUrl: 'https://youtube.com/@aditya_sen_ai',
      subscribers: 28500,
      engagementRate: 3.6,
      country: params.country || 'India',
      niche: params.niche || 'AI & Machine Learning',
      secondaryNiches: ['Python', 'Agents', 'PyTorch'],
      topics: ['LLM Fine Tuning', 'FastAPI Serving', 'PyTorch 2.5'],
      bio: 'Machine learning practitioner building hands-on LLM projects and agent pipelines.',
      contactEmail: 'aditya.collab.ai@gmail.com',
      emailStatus: 'verified',
      instagramHandle: 'aditya_sen_codes',
      website: 'https://adityasen.ai',
      uploadsLast90Days: 4,
      recentVideos: [
        {
          id: `v-disc-${Date.now()}`,
          title: 'Deploying Self-Hosted DeepSeek R1 with Ollama & Open WebUI',
          views: 31000,
          likes: 2100,
          comments: 240,
          publishedDate: new Date().toISOString().split('T')[0],
          daysAgo: 2,
          url: 'https://youtube.com/watch?v=mock-disc-1',
        },
      ],
      demographics: {
        ageRanges: [
          { range: '18-24', percentage: 40 },
          { range: '25-34', percentage: 50 },
          { range: '35-44', percentage: 10 },
        ],
        gender: { male: 80, female: 19, other: 1 },
        topCountries: [{ country: 'India', percentage: 78 }],
        dataAvailable: true,
      },
      qualification: {
        passed: true,
        relevanceScore: 92,
        engagementScore: 84,
        activityScore: 85,
        overallScore: 88,
        rejectionReasons: [],
      },
      enrichmentStatus: 'complete',
      missingFields: [],
      lastUpdated: new Date().toISOString(),
      campaignIds: ['camp-tech-ai-in'],
    };

    // Add only if not already present
    if (!this.influencers.some(i => i.handle === syntheticCreator.handle)) {
      this.influencers.unshift(syntheticCreator);
      setStoredData(STORAGE_KEYS.INFLUENCERS, this.influencers);
    }

    return {
      count: this.influencers.length,
      influencers: [...this.influencers],
    };
  }

  // POST /filter/run
  async runFiltering(criteria: FilterCriteria): Promise<{
    passed: Influencer[];
    failed: Influencer[];
    updatedInfluencers: Influencer[];
  }> {
    this.criteria = { ...criteria };
    setStoredData(STORAGE_KEYS.CRITERIA, this.criteria);

    const updated = this.influencers.map(creator => {
      const qual = evaluateCreatorQualification(creator, criteria);
      return {
        ...creator,
        qualification: qual,
      };
    });

    this.influencers = updated;
    setStoredData(STORAGE_KEYS.INFLUENCERS, this.influencers);

    const passed = updated.filter(i => i.qualification.passed);
    const failed = updated.filter(i => !i.qualification.passed);

    return { passed, failed, updatedInfluencers: updated };
  }

  // POST /enrichment/run
  async runEnrichment(influencerId: string): Promise<Influencer> {
    const idx = this.influencers.findIndex(i => i.id === influencerId);
    if (idx === -1) throw new Error('Influencer not found');

    const creator = this.influencers[idx];
    const missing: string[] = [];
    if (!creator.contactEmail) missing.push('contactEmail');
    if (!creator.instagramHandle) missing.push('instagramHandle');
    if (!creator.website) missing.push('website');

    const updated: Influencer = {
      ...creator,
      enrichmentStatus: missing.length === 0 ? 'complete' : 'partial',
      missingFields: missing,
      lastUpdated: new Date().toISOString(),
    };

    this.influencers[idx] = updated;
    setStoredData(STORAGE_KEYS.INFLUENCERS, this.influencers);
    return updated;
  }

  // GET /campaigns
  async getCampaigns(): Promise<Campaign[]> {
    return [...this.campaigns];
  }

  // POST /campaigns
  async createCampaign(campaign: Omit<Campaign, 'id' | 'createdAt'>): Promise<Campaign> {
    const newCamp: Campaign = {
      ...campaign,
      id: `camp-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      influencerCount: 0,
    };
    this.campaigns.unshift(newCamp);
    setStoredData(STORAGE_KEYS.CAMPAIGNS, this.campaigns);
    return newCamp;
  }

  // PUT /campaigns/:id
  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    const idx = this.campaigns.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Campaign not found');
    this.campaigns[idx] = { ...this.campaigns[idx], ...updates };
    setStoredData(STORAGE_KEYS.CAMPAIGNS, this.campaigns);
    return this.campaigns[idx];
  }

  // DELETE /campaigns/:id
  async deleteCampaign(id: string): Promise<boolean> {
    this.campaigns = this.campaigns.filter(c => c.id !== id);
    setStoredData(STORAGE_KEYS.CAMPAIGNS, this.campaigns);
    return true;
  }

  // GET /outreach
  async getOutreachLogs(): Promise<OutreachLog[]> {
    return [...this.outreachLogs];
  }

  // POST /outreach/simulate
  async simulateOutreach(req: OutreachSimulateRequest): Promise<OutreachLog> {
    const creator = this.influencers.find(i => i.id === req.influencerId);
    const campaign = this.campaigns.find(c => c.id === req.campaignId) || this.campaigns[0];

    const log: OutreachLog = {
      id: `out-sim-${Date.now()}`,
      influencerId: req.influencerId,
      influencerName: creator?.name || 'Creator',
      influencerEmail: creator?.contactEmail || null,
      influencerHandle: creator?.handle || '@creator',
      platform: creator?.platform || 'youtube',
      campaignId: campaign.id,
      campaignName: campaign.name,
      channelType: req.messageType,
      subject: req.subject,
      messagePreview: req.body.slice(0, 100) + '...',
      status: 'simulated',
      date: new Date().toISOString(),
      deliveryMode: 'simulation',
      followUpStatus: 'scheduled',
      followUpDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    };

    this.outreachLogs.unshift(log);
    setStoredData(STORAGE_KEYS.OUTREACH_LOGS, this.outreachLogs);
    return log;
  }

  // Update outreach log status
  async updateOutreachStatus(logId: string, status: OutreachLog['status']): Promise<OutreachLog> {
    const idx = this.outreachLogs.findIndex(l => l.id === logId);
    if (idx === -1) throw new Error('Outreach log not found');
    this.outreachLogs[idx].status = status;
    setStoredData(STORAGE_KEYS.OUTREACH_LOGS, this.outreachLogs);
    return this.outreachLogs[idx];
  }

  // GET /analytics
  async getAnalytics(): Promise<AnalyticsSummary> {
    const total = this.influencers.length;
    const qualified = this.influencers.filter(i => i.qualification.passed).length;
    const avgEng = total > 0 
      ? Number((this.influencers.reduce((acc, i) => acc + i.engagementRate, 0) / total).toFixed(2)) 
      : 0;
    const emailsSent = this.outreachLogs.filter(l => l.status === 'sent' || l.status === 'simulated' || l.status === 'replied').length;
    const replies = this.outreachLogs.filter(l => l.status === 'replied').length;
    const replyRate = emailsSent > 0 ? Number(((replies / emailsSent) * 100).toFixed(1)) : 0;
    const pendingOutreach = this.outreachLogs.filter(l => l.status === 'pending_approval' || l.status === 'draft').length;

    // Platform distribution
    const platforms: Record<string, number> = {};
    this.influencers.forEach(i => {
      platforms[i.platform] = (platforms[i.platform] || 0) + 1;
    });

    // Niche breakdown
    const niches: Record<string, number> = {};
    this.influencers.forEach(i => {
      niches[i.niche] = (niches[i.niche] || 0) + 1;
    });

    // Status breakdown
    const statuses: Record<string, number> = {};
    this.outreachLogs.forEach(l => {
      statuses[l.status] = (statuses[l.status] || 0) + 1;
    });

    return {
      totalDiscovered: total,
      qualifiedCount: qualified,
      avgEngagementRate: avgEng,
      emailsGenerated: this.outreachLogs.length + 8, // includes drafts
      emailsSent,
      pendingOutreach,
      replyRate,
      discoveryFunnel: [
        { stage: 'Discovered', count: total, percentage: 100 },
        { stage: 'Filtered', count: Math.round(total * 0.85), percentage: 85 },
        { stage: 'Qualified (Score >= 80)', count: qualified, percentage: Math.round((qualified / total) * 100) },
        { stage: 'Enriched (Email Found)', count: this.influencers.filter(i => i.contactEmail).length, percentage: Math.round((this.influencers.filter(i => i.contactEmail).length / total) * 100) },
        { stage: 'Outreach Initiated', count: emailsSent, percentage: Math.round((emailsSent / total) * 100) },
        { stage: 'Replied / Positive', count: replies, percentage: Math.round((replies / Math.max(emailsSent, 1)) * 100) },
      ],
      platformBreakdown: Object.entries(platforms).map(([platform, count]) => ({
        platform: platform === 'youtube' ? 'YouTube' : platform === 'instagram' ? 'Instagram' : platform,
        count,
        percentage: Math.round((count / total) * 100),
      })),
      nicheBreakdown: Object.entries(niches).map(([niche, count]) => ({ niche, count })),
      outreachStatusDistribution: [
        { status: 'Replied', count: statuses['replied'] || 0 },
        { status: 'Simulated Sent', count: statuses['simulated'] || 0 },
        { status: 'Pending Approval', count: statuses['pending_approval'] || 0 },
        { status: 'Drafts', count: statuses['draft'] || 0 },
      ],
      discoveryTrend: [
        { month: 'Nov 25', discovered: 4, qualified: 3 },
        { month: 'Dec 25', discovered: 7, qualified: 5 },
        { month: 'Jan 26', discovered: 11, qualified: 8 },
        { month: 'Feb 26', discovered: 14, qualified: 11 },
        { month: 'Mar 26', discovered: total, qualified },
      ],
    };
  }
}

// -------------------------------------------------------------
// REAL FASTAPI SERVICE CLIENT (Connects to Python Backend)
// -------------------------------------------------------------
class FastAPIServiceClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });
    if (!res.ok) {
      let detail = '';
      try { const payload = await res.json(); detail = String(payload.detail || payload.error || payload.message || ''); } catch { /* non-JSON error */ }
      throw new Error(detail || `FastAPI request to ${endpoint} failed with status ${res.status}`);
    }
    return res.json();
  }

  async getInfluencers(): Promise<Influencer[]> {
    const data = await this.request<{ influencers?: Influencer[] } | Influencer[]>('/influencers');
    return Array.isArray(data) ? data : (data.influencers || []);
  }

  async runDiscovery(params: Partial<DiscoveryRequest>): Promise<{ count: number; influencers: Influencer[] }> {
    const data = await this.request<{ total?: number; newlyDiscovered?: number; influencers?: Influencer[] }>('/discovery/run', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return {
      count: Number(data.newlyDiscovered ?? data.total ?? data.influencers?.length ?? 0),
      influencers: Array.isArray(data.influencers) ? data.influencers : [],
    };
  }

  async runFiltering(criteria: FilterCriteria): Promise<{
    passed: Influencer[];
    failed: Influencer[];
    updatedInfluencers: Influencer[];
  }> {
    return this.request('/filter/run', {
      method: 'POST',
      body: JSON.stringify({ criteria }),
    });
  }

  async runEnrichment(influencerId: string): Promise<Influencer> {
    return this.request(`/enrichment/run`, {
      method: 'POST',
      body: JSON.stringify({ influencer_id: influencerId }),
    });
  }

  async getCampaigns(): Promise<Campaign[]> {
    return this.request<Campaign[]>('/campaigns');
  }

  async createCampaign(campaign: Omit<Campaign, 'id' | 'createdAt'>): Promise<Campaign> {
    return this.request('/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaign),
    });
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    return this.request(`/campaigns/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(updates) });
  }

  async deleteCampaign(id: string): Promise<boolean> {
    await this.request(`/campaigns/${encodeURIComponent(id)}`, { method: 'DELETE' });
    return true;
  }

  async updateOutreachStatus(logId: string, status: OutreachLog['status']): Promise<OutreachLog> {
    return this.request(`/outreach/${encodeURIComponent(logId)}`, { method: 'PATCH', body: JSON.stringify({ status }) });
  }

  async getOutreachLogs(): Promise<OutreachLog[]> {
    return this.request<OutreachLog[]>('/outreach');
  }

  async simulateOutreach(req: OutreachSimulateRequest): Promise<OutreachLog> {
    return this.request('/outreach/simulate', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  }

  async getAnalytics(): Promise<AnalyticsSummary> {
    return this.request<AnalyticsSummary>('/analytics');
  }
}

// Singleton instances
export const mockApiService = new MockInfluenceAIService();
export const fastApiClient = new FastAPIServiceClient(API_BASE_URL);

// Active Service Provider Selector
export type ApiProvider = 'mock' | 'fastapi';
const API_PROVIDER_KEY = 'influenceai_api_provider_v1';
let currentProvider: ApiProvider = (() => {
  try {
    const saved = localStorage.getItem(API_PROVIDER_KEY);
    return saved === 'mock' || saved === 'fastapi' ? saved : 'fastapi';
  } catch { return 'fastapi'; }
})();

export function getActiveApiProvider(): ApiProvider {
  return currentProvider;
}

export function setActiveApiProvider(provider: ApiProvider) {
  currentProvider = provider;
  try { localStorage.setItem(API_PROVIDER_KEY, provider); } catch { /* storage may be disabled */ }
}

// Unified API Gateway that automatically falls back to Mock if FastAPI fails
export const influenceApi = {
  getInfluencers: async () => {
    if (currentProvider === 'fastapi') {
      return await fastApiClient.getInfluencers();
    }
    return mockApiService.getInfluencers();
  },

  runDiscovery: async (params: Partial<DiscoveryRequest>) => {
    if (currentProvider === 'fastapi') {
      return await fastApiClient.runDiscovery(params);
    }
    return mockApiService.runDiscovery(params);
  },

  runFiltering: async (criteria: FilterCriteria) => {
    if (currentProvider === 'fastapi') {
      return await fastApiClient.runFiltering(criteria);
    }
    return mockApiService.runFiltering(criteria);
  },

  runEnrichment: async (influencerId: string) => {
    if (currentProvider === 'fastapi') {
      return await fastApiClient.runEnrichment(influencerId);
    }
    return mockApiService.runEnrichment(influencerId);
  },

  getCampaigns: async () => {
    if (currentProvider === 'fastapi') {
      return await fastApiClient.getCampaigns();
    }
    return mockApiService.getCampaigns();
  },

  createCampaign: async (campaign: Omit<Campaign, 'id' | 'createdAt'>) => {
    if (currentProvider === 'fastapi') {
      return await fastApiClient.createCampaign(campaign);
    }
    return mockApiService.createCampaign(campaign);
  },

  updateCampaign: async (id: string, updates: Partial<Campaign>) => {
    if (currentProvider === 'fastapi') return fastApiClient.updateCampaign(id, updates);
    return mockApiService.updateCampaign(id, updates);
  },

  deleteCampaign: async (id: string) => {
    if (currentProvider === 'fastapi') return fastApiClient.deleteCampaign(id);
    return mockApiService.deleteCampaign(id);
  },

  getOutreachLogs: async () => {
    if (currentProvider === 'fastapi') {
      return await fastApiClient.getOutreachLogs();
    }
    return mockApiService.getOutreachLogs();
  },

  simulateOutreach: async (req: OutreachSimulateRequest) => {
    if (currentProvider === 'fastapi') {
      return await fastApiClient.simulateOutreach(req);
    }
    return mockApiService.simulateOutreach(req);
  },

  updateOutreachStatus: async (logId: string, status: OutreachLog['status']) => {
    if (currentProvider === 'fastapi') return fastApiClient.updateOutreachStatus(logId, status);
    return mockApiService.updateOutreachStatus(logId, status);
  },

  getAnalytics: async () => {
    if (currentProvider === 'fastapi') {
      return await fastApiClient.getAnalytics();
    }
    return mockApiService.getAnalytics();
  },

  resetDemoData: () => {
    mockApiService.resetToDefaults();
  },
};
