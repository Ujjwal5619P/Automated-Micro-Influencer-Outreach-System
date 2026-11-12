import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Mail, 
  Instagram, 
  Globe, 
  Youtube, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Sparkles, 
  Send,
  Video,
  Eye,
  ThumbsUp,
  MessageSquare,
  Users,
  Percent,
  Calendar,
  Share2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Influencer } from '../../types';

export const InfluencerDrawer: React.FC = () => {
  const { 
    selectedInfluencerForDetail, 
    setSelectedInfluencerForDetail,
    navigateToPersonalization,
    simulateOutreach,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'videos' | 'demographics' | 'qualification'>('profile');

  if (!selectedInfluencerForDetail) return null;

  const inf = selectedInfluencerForDetail;

  const handleSimulateQuickEmail = async () => {
    await simulateOutreach(inf.id, 'email', `Partnership Collaboration: AgentScale AI x ${inf.name}`, `Hi ${inf.name.split(' ')[0]}, let's collaborate!`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#18243A]/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl h-full bg-white border-l border-[#DFDCD3] shadow-2xl flex flex-col overflow-hidden text-[#202A38]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-[#EAE7DF] flex items-start justify-between bg-[#FAF8F5]">
          <div className="flex items-start gap-4">
            <img
              src={inf.avatarUrl}
              alt={inf.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white shadow-md shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-extrabold text-[#18243A] tracking-tight truncate font-sans">
                  {inf.name}
                </h2>
                {inf.qualification.passed ? (
                  <span className="text-[11px] font-bold text-[#65A88B] bg-[#65A88B]/15 px-2.5 py-0.5 rounded-full border border-[#65A88B]/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Qualified
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-[#FF805D] bg-[#FF805D]/15 px-2.5 py-0.5 rounded-full border border-[#FF805D]/30 flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> Needs Review
                  </span>
                )}
              </div>
              <p className="text-xs text-[#78818D] flex items-center gap-2 truncate font-medium">
                <span>{inf.handle}</span>
                <span>·</span>
                <span className="text-[#4169E1] font-semibold">{inf.channelTitle}</span>
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs">
                <a
                  href={inf.profileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#78818D] hover:text-[#18243A] flex items-center gap-1 text-[11px] font-semibold transition-colors"
                >
                  <Youtube className="w-3.5 h-3.5 text-[#FF0000]" />
                  YouTube Channel
                  <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                </a>
                {inf.instagramHandle && (
                  <a
                    href={`https://instagram.com/${inf.instagramHandle}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#78818D] hover:text-[#18243A] flex items-center gap-1 text-[11px] font-semibold transition-colors"
                  >
                    <Instagram className="w-3.5 h-3.5 text-[#FF805D]" />
                    @{inf.instagramHandle}
                  </a>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => setSelectedInfluencerForDetail(null)}
            className="p-1.5 rounded-lg text-[#78818D] hover:text-[#18243A] hover:bg-[#EAE7DF] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-4 gap-2 px-6 py-3.5 border-b border-[#EAE7DF] bg-[#FAF8F5]/50 text-center">
          <div className="p-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#78818D]">Subscribers</div>
            <div className="text-sm font-bold font-mono text-[#18243A] tabular-nums mt-0.5">
              {inf.subscribers.toLocaleString()}
            </div>
          </div>
          <div className="p-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#78818D]">Engagement</div>
            <div className="text-sm font-bold font-mono text-[#4169E1] tabular-nums mt-0.5">
              {inf.engagementRate}%
            </div>
          </div>
          <div className="p-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#78818D]">90d Uploads</div>
            <div className="text-sm font-bold font-mono text-[#18243A] tabular-nums mt-0.5">
              {inf.uploadsLast90Days} videos
            </div>
          </div>
          <div className="p-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#78818D]">Qual. Score</div>
            <div className="text-sm font-bold font-mono text-[#65A88B] tabular-nums mt-0.5">
              {inf.qualification.overallScore}/100
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#EAE7DF] px-6 gap-6 text-xs font-semibold">
          {(['profile', 'videos', 'demographics', 'qualification'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 capitalize border-b-2 transition-colors cursor-pointer ${
                activeTab === tab
                  ? 'border-[#4169E1] text-[#4169E1] font-bold'
                  : 'border-transparent text-[#78818D] hover:text-[#18243A]'
              }`}
            >
              {tab === 'profile' ? 'Overview & Bio' : tab === 'videos' ? `Recent Content (${inf.recentVideos.length})` : tab}
            </button>
          ))}
        </div>

        {/* Tab Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Bio & Content Focus */}
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#78818D] mb-2">
                  Creator Profile & Niche
                </h3>
                <p className="text-xs text-[#202A38] leading-relaxed bg-[#F7F5F0] p-3.5 rounded-xl border border-[#DFDCD3]">
                  {inf.bio}
                </p>
              </div>

              {/* Verified Contact Details (Strict No Fabrication) */}
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#78818D] mb-2">
                  Contact & Verification
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#F7F5F0] border border-[#DFDCD3]">
                    <span className="text-[10px] text-[#78818D] font-bold uppercase block mb-1">Public Contact Email</span>
                    {inf.contactEmail ? (
                      <span className="font-mono text-[#18243A] text-xs font-semibold break-all flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#4169E1] shrink-0" />
                        {inf.contactEmail}
                      </span>
                    ) : (
                      <span className="text-[#FF805D] font-semibold text-xs flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Unavailable / Not Found
                      </span>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#F7F5F0] border border-[#DFDCD3]">
                    <span className="text-[10px] text-[#78818D] font-bold uppercase block mb-1">Portfolio / Website</span>
                    {inf.website ? (
                      <a 
                        href={inf.website} 
                        target="_blank" 
                        rel="noreferrer"
                        className="font-mono text-[#4169E1] hover:underline text-xs font-semibold truncate flex items-center gap-1.5"
                      >
                        <Globe className="w-3.5 h-3.5 shrink-0" />
                        {inf.website.replace('https://', '')}
                      </a>
                    ) : (
                      <span className="text-[#78818D] text-xs font-medium">
                        Unavailable
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Topics & Content Tags */}
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#78818D] mb-2">
                  Primary Topics & Technical Stack
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {inf.topics.map((t, idx) => (
                    <span 
                      key={idx} 
                      className="text-xs px-2.5 py-1 rounded-lg bg-[#4169E1]/10 text-[#4169E1] border border-[#4169E1]/20 font-semibold"
                    >
                      {t}
                    </span>
                  ))}
                  {inf.secondaryNiches.map((s, idx) => (
                    <span 
                      key={`sec-${idx}`} 
                      className="text-xs px-2.5 py-1 rounded-lg bg-[#FAF8F5] text-[#5A6675] border border-[#DFDCD3] font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'videos' && (
            <div className="space-y-3">
              <div className="text-xs text-[#78818D] mb-2">
                Actual recent YouTube videos analyzed for qualification and AI outreach personalization:
              </div>
              {inf.recentVideos.map((video) => (
                <div 
                  key={video.id}
                  className="p-3.5 rounded-xl border border-[#DFDCD3] bg-white hover:border-[#4169E1]/40 transition-colors shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h4 className="text-xs font-bold text-[#18243A] leading-snug">
                      {video.title}
                    </h4>
                    <span className="text-[10px] text-[#78818D] shrink-0 font-mono font-medium">
                      {video.publishedDate}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-[#78818D] font-mono">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-[#78818D]" />
                      {video.views.toLocaleString()} views
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3.5 h-3.5 text-[#78818D]" />
                      {video.likes.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-[#78818D]" />
                      {video.comments.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'demographics' && (
            <div className="space-y-6">
              {/* Age Distribution */}
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#78818D] mb-3">
                  Audience Age Breakdown
                </h4>
                <div className="space-y-2.5">
                  {inf.demographics.ageRanges.map((a) => (
                    <div key={a.range} className="space-y-1">
                      <div className="flex justify-between text-xs text-[#202A38] font-mono font-semibold">
                        <span>{a.range} years</span>
                        <span>{a.percentage}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#EAE7DF] overflow-hidden">
                        <div 
                          className="h-full bg-[#4169E1] rounded-full" 
                          style={{ width: `${a.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gender Split */}
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#78818D] mb-3">
                  Gender Distribution
                </h4>
                <div className="flex items-center gap-4 text-xs font-mono bg-[#F7F5F0] p-3.5 rounded-xl border border-[#DFDCD3]">
                  <div className="flex-1 text-center border-r border-[#DFDCD3]">
                    <span className="text-[10px] text-[#78818D] uppercase font-bold block">Male</span>
                    <span className="text-sm font-bold text-[#18243A]">{inf.demographics.gender.male}%</span>
                  </div>
                  <div className="flex-1 text-center border-r border-[#DFDCD3]">
                    <span className="text-[10px] text-[#78818D] uppercase font-bold block">Female</span>
                    <span className="text-sm font-bold text-[#18243A]">{inf.demographics.gender.female}%</span>
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-[10px] text-[#78818D] uppercase font-bold block">Other</span>
                    <span className="text-sm font-bold text-[#18243A]">{inf.demographics.gender.other || 0}%</span>
                  </div>
                </div>
              </div>

              {/* Top Geographic Markets */}
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#78818D] mb-3">
                  Top Viewer Geographies
                </h4>
                <div className="space-y-2">
                  {inf.demographics.topCountries.map((c) => (
                    <div key={c.country} className="flex items-center justify-between p-2.5 rounded-xl bg-[#F7F5F0] border border-[#DFDCD3] text-xs">
                      <span className="text-[#202A38] font-semibold">{c.country}</span>
                      <span className="font-mono text-[#4169E1] font-bold">{c.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'qualification' && (
            <div className="space-y-6">
              {/* Overall Score Status */}
              <div className="p-4 rounded-xl border border-[#DFDCD3] bg-[#F7F5F0]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[#78818D] font-medium">Composite Qualification Score</span>
                  <span className="text-lg font-bold font-mono text-[#4169E1]">
                    {inf.qualification.overallScore} / 100
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#EAE7DF] overflow-hidden mb-3">
                  <div 
                    className="h-full bg-gradient-to-r from-[#4169E1] to-[#65A88B]"
                    style={{ width: `${inf.qualification.overallScore}%` }}
                  />
                </div>
                {inf.qualification.passed ? (
                  <div className="text-xs text-[#65A88B] flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    Passed all micro-influencer filters (followers 5K–100K, engagement ≥2%, uploads ≥3).
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-xs text-[#FF805D] flex items-center gap-1.5 font-bold">
                      <XCircle className="w-4 h-4 shrink-0" />
                      Failed one or more qualification requirements:
                    </div>
                    <ul className="text-xs text-[#C95332] space-y-1 list-disc pl-5 font-medium">
                      {inf.qualification.rejectionReasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Dimensional Breakdown */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#78818D]">
                  Dimensional Score Breakdown
                </h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-[#F7F5F0] border border-[#DFDCD3]">
                    <span className="text-[10px] text-[#78818D] font-bold uppercase block mb-1">Relevance</span>
                    <span className="text-sm font-bold font-mono text-[#4169E1]">
                      {inf.qualification.relevanceScore}/100
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F7F5F0] border border-[#DFDCD3]">
                    <span className="text-[10px] text-[#78818D] font-bold uppercase block mb-1">Engagement</span>
                    <span className="text-sm font-bold font-mono text-[#18243A]">
                      {inf.qualification.engagementScore}/100
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F7F5F0] border border-[#DFDCD3]">
                    <span className="text-[10px] text-[#78818D] font-bold uppercase block mb-1">Activity (90d)</span>
                    <span className="text-sm font-bold font-mono text-[#65A88B]">
                      {inf.qualification.activityScore}/100
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Action Bar */}
        <div className="p-4 border-t border-[#EAE7DF] bg-[#FAF8F5] flex items-center justify-between gap-3">
          <button
            onClick={() => {
              setSelectedInfluencerForDetail(null);
              navigateToPersonalization(inf);
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#4169E1] hover:bg-[#3458C9] text-white text-xs font-bold shadow-md shadow-[#4169E1]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Personalize Outreach with AI
          </button>
          <button
            onClick={handleSimulateQuickEmail}
            className="py-2.5 px-4 rounded-xl border border-[#DFDCD3] bg-white hover:bg-[#F7F5F0] text-[#18243A] text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Send className="w-3.5 h-3.5 text-[#4169E1]" />
            Quick Simulate
          </button>
        </div>
      </div>
    </div>
  );
};
