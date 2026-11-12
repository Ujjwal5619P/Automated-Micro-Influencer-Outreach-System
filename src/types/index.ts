export type Platform = 'youtube' | 'instagram' | 'linkedin' | 'twitter';

export type QualificationStatus = 'passed' | 'failed' | 'under_review';

export type OutreachStatus = 
  | 'draft' 
  | 'pending_approval' 
  | 'simulated' 
  | 'sent' 
  | 'failed' 
  | 'replied';

export type ViewType = 
  | 'overview' 
  | 'discover' 
  | 'database' 
  | 'filter' 
  | 'enrichment' 
  | 'personalization' 
  | 'campaigns' 
  | 'outreach' 
  | 'tracker' 
  | 'analytics' 
  | 'settings';

export interface CreatorVideo {
  id: string;
  title: string;
  views: number;
  likes: number;
  comments: number;
  publishedDate: string; // ISO format or relative
  daysAgo: number;
  url: string;
}

export interface AudienceDemographics {
  ageRanges: { range: string; percentage: number }[];
  gender: { male: number; female: number; other?: number };
  topCountries: { country: string; percentage: number }[];
  dataAvailable: boolean;
}

export interface QualificationScores {
  relevanceScore: number; // 0 - 100
  engagementScore: number; // 0 - 100
  activityScore: number; // 0 - 100
  overallScore: number; // 0 - 100
  passed: boolean;
  rejectionReasons: string[];
}

export interface Influencer {
  id: string;
  name: string;
  handle: string;
  channelTitle: string;
  platform: Platform;
  avatarUrl: string;
  profileUrl: string;
  subscribers: number;
  engagementRate: number; // e.g. 3.4 for 3.4%
  country: string;
  niche: string;
  secondaryNiches: string[];
  topics: string[];
  bio: string;
  contactEmail: string | null; // null if not publicly found
  emailStatus: 'verified' | 'unverified' | 'unavailable';
  instagramHandle?: string | null;
  website?: string | null;
  recentVideos: CreatorVideo[];
  uploadsLast90Days: number;
  qualification: QualificationScores;
  demographics: AudienceDemographics;
  enrichmentStatus: 'complete' | 'partial' | 'pending';
  missingFields: string[];
  lastUpdated: string;
  notes?: string;
  campaignIds: string[];
}

export interface FilterCriteria {
  minFollowers: number;
  maxFollowers: number;
  minEngagementRate: number;
  minUploads90Days: number;
  requiredKeywords: string[];
  selectedNiche: string;
  selectedPlatform: Platform | 'all';
  selectedCountry: string;
}

export interface Campaign {
  id: string;
  name: string;
  brandName: string;
  brandDescription: string;
  brandPitch: string;
  targetNiche: string;
  targetGeography: string;
  platform: Platform | 'all';
  followerRangeMin: number;
  followerRangeMax: number;
  engagementThreshold: number;
  collaborationType: 'dedicated_video' | 'shoutout' | 'product_review' | 'affiliate' | 'sponsorship';
  objective: 'brand_awareness' | 'developer_signups' | 'community_growth';
  status: 'active' | 'draft' | 'completed' | 'paused';
  createdAt: string;
  influencerCount?: number;
}

export interface OutreachMessage {
  id: string;
  influencerId: string;
  campaignId: string;
  type: 'email' | 'instagram_dm';
  subject?: string;
  body: string;
  wordCount: number;
  status: OutreachStatus;
  sentDate?: string | null;
  createdAt: string;
  updatedAt: string;
  personalizationEvidence?: string;
  generationModel?: string;
  notes?: string;
}

export interface OutreachLog {
  id: string;
  influencerId: string;
  influencerName: string;
  influencerEmail: string | null;
  influencerHandle: string;
  platform: Platform;
  campaignId: string;
  campaignName: string;
  channelType: 'email' | 'instagram_dm';
  subject?: string;
  messagePreview: string;
  status: OutreachStatus;
  date: string;
  deliveryMode: 'simulation' | 'real';
  followUpStatus: 'none' | 'scheduled' | 'overdue' | 'responded';
  followUpDate?: string | null;
}

export interface ActivityEvent {
  id: string;
  type: 'discovery' | 'qualification' | 'message_generated' | 'outreach_simulated' | 'reply_received' | 'campaign_created';
  title: string;
  description: string;
  timestamp: string;
  influencerName?: string;
  badge?: string;
}
