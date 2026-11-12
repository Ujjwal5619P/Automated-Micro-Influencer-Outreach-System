import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  Percent, 
  Mail, 
  Send, 
  Clock, 
  TrendingUp, 
  Sparkles, 
  ArrowRight, 
  ExternalLink, 
  ShieldCheck, 
  CheckCircle2, 
  Calendar, 
  Layers,
  Zap,
  ChevronRight,
  FolderDot,
  Radio,
  Flame,
  Star,
  Check,
  AlertTriangle,
  PlaySquare,
  MessageSquareText
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { influenceApi, AnalyticsSummary } from '../../services/api';
import { SEED_ACTIVITY } from '../../data/seedData';

// Coordinated Art-Directed Palette
const CHART_COLORS = ['#3B66F5', '#FF6F59', '#65A88B', '#E9B85B', '#121A2A'];

export const OverviewView: React.FC = () => {
  const { 
    influencers, 
    setCurrentView, 
    setSelectedInfluencerForDetail, 
    navigateToPersonalization,
    activeCampaign,
    campaigns,
    setActiveCampaignId
  } = useApp();

  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    influenceApi.getAnalytics().then(setAnalytics);
  }, [influencers]);

  if (!analytics) return null;

  const qualifiedCreators = influencers
    .filter(i => i.qualification.passed)
    .sort((a, b) => b.qualification.overallScore - a.qualification.overallScore);

  const spotlightCreator = qualifiedCreators[0] || influencers[0];
  const topQualified = qualifiedCreators.slice(0, 5);

  return (
    <div className="space-y-7 pb-14 max-w-7xl mx-auto">
      {/* 1. VISUALLY STRONG CAMPAIGN OVERVIEW HERO */}
      <div className="relative rounded-3xl border border-[#DFDCD3] bg-white shadow-xs overflow-hidden">
        {/* Subtle decorative glow & layered background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#3B66F5]/10 via-[#FF6F59]/5 to-transparent rounded-full pointer-events-none blur-2xl" />

        <div className="p-7 sm:p-9 relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121A2A] text-white text-[11px] font-bold tracking-tight shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#65A88B] animate-pulse" />
              Active Outbound Campaign · 2026 Edition
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#141E30] font-sans">
              Creator Intelligence &amp; Outbound Pipeline
            </h1>

            <p className="text-xs sm:text-sm text-[#6C7888] leading-relaxed">
              Targeting authentic micro-influencers for{' '}
              <strong className="text-[#141E30]">{activeCampaign?.brandName || 'AgentScale AI'}</strong>.
              Evaluating developer trust, deterministic qualification scores, and context-grounded AI pitches.
            </p>

            {/* Campaign Key Parameters Capsule */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FAF8F5] border border-[#DFDCD3] text-[#141E30] font-semibold text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3B66F5]" />
                Target: 5K–100K Subscribers
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FAF8F5] border border-[#DFDCD3] text-[#141E30] font-semibold text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#65A88B]" />
                Threshold: ≥ 2.0% Eng.
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FAF8F5] border border-[#DFDCD3] text-[#141E30] font-semibold text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF6F59]" />
                Region: India Tech &amp; AI
              </span>
            </div>
          </div>

          {/* Quick Actions & Campaign Switcher */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 sm:items-stretch lg:items-end">
            <div className="relative">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#78818D] mb-1">
                Selected Campaign
              </label>
              <select
                value={activeCampaign?.id}
                onChange={(e) => setActiveCampaignId(e.target.value)}
                className="w-full sm:w-64 px-3.5 py-2.5 rounded-xl border border-[#DFDCD3] bg-[#FAF8F5] text-xs font-bold text-[#141E30] hover:bg-[#F2EFE8] transition-colors focus:outline-none focus:border-[#3B66F5] cursor-pointer shadow-2xs"
              >
                {campaigns.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setCurrentView('discover')}
              className="px-5 py-3 rounded-xl bg-[#3B66F5] hover:bg-[#2C52D6] text-white text-xs font-bold shadow-md shadow-[#3B66F5]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Discover Creators
            </button>
          </div>
        </div>
      </div>

      {/* 2. ASYMMETRICAL MARKETING INTELLIGENCE TELEMETRY STRIP */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Vetting & Qualification Yield (Dominant Focus) */}
        <div className="p-5 rounded-2xl border border-[#DFDCD3] bg-white shadow-2xs hover:shadow-xs transition-all relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#6C7888] mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider">Vetting Pass Rate</span>
            <div className="w-8 h-8 rounded-xl bg-[#65A88B]/15 text-[#65A88B] flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-[#141E30] tabular-nums">
                {analytics.qualifiedCount}
              </span>
              <span className="text-xs text-[#6C7888] font-semibold">
                of {analytics.totalDiscovered} Discovered
              </span>
            </div>
            <div className="w-full bg-[#FAF8F5] h-2 rounded-full mt-3 overflow-hidden border border-[#EAE7DF]">
              <div 
                className="bg-[#65A88B] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.round((analytics.qualifiedCount / Math.max(analytics.totalDiscovered, 1)) * 100)}%` }}
              />
            </div>
          </div>
          <div className="text-[11px] text-[#65A88B] font-bold mt-2 flex items-center justify-between">
            <span>{Math.round((analytics.qualifiedCount / Math.max(analytics.totalDiscovered, 1)) * 100)}% Qualified Ratio</span>
            <span className="text-[#6C7888] font-normal text-[10px]">4-Gate Criteria</span>
          </div>
        </div>

        {/* Metric 2: Resonance & Engagement Rate */}
        <div className="p-5 rounded-2xl border border-[#DFDCD3] bg-white shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#6C7888] mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider">Avg Engagement</span>
            <div className="w-8 h-8 rounded-xl bg-[#3B66F5]/10 text-[#3B66F5] flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-[#3B66F5] tabular-nums">
                {analytics.avgEngagementRate}%
              </span>
              <span className="text-[10px] font-mono text-[#65A88B] bg-[#65A88B]/15 px-2 py-0.5 rounded-full font-bold">
                +1.8% vs Baseline
              </span>
            </div>
            <p className="text-[11px] text-[#6C7888] mt-2">
              Micro-influencer benchmark: <strong className="text-[#141E30]">2.0%</strong>
            </p>
          </div>
          <div className="text-[10px] font-mono text-[#6C7888] border-t border-[#F0EDE6] pt-2 mt-2">
            Highest cohort: 5.1% (Rohan AI Lab)
          </div>
        </div>

        {/* Metric 3: Outreach Generated & Sent */}
        <div className="p-5 rounded-2xl border border-[#DFDCD3] bg-white shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#6C7888] mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider">Outreach Sent</span>
            <div className="w-8 h-8 rounded-xl bg-[#FF6F59]/15 text-[#FF6F59] flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-[#141E30] tabular-nums">
                {analytics.emailsSent}
              </span>
              <span className="text-xs text-[#6C7888] font-semibold">
                / {analytics.emailsGenerated} Drafted
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="w-2 h-2 rounded-full bg-[#65A88B]" />
              <span className="text-[11px] font-bold text-[#65A88B] font-mono">
                {analytics.replyRate}% Reply Rate
              </span>
            </div>
          </div>
          <div className="text-[10px] text-[#6C7888] border-t border-[#F0EDE6] pt-2 mt-2">
            Simulated &amp; Verified Delivery
          </div>
        </div>

        {/* Metric 4: Staging Queue Status */}
        <div className="p-5 rounded-2xl border border-[#DFDCD3] bg-white shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#6C7888] mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Staging</span>
            <div className="w-8 h-8 rounded-xl bg-[#E9B85B]/15 text-[#E9B85B] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-[#E67E22] tabular-nums">
                {analytics.pendingOutreach}
              </span>
              <span className="text-xs text-[#6C7888] font-semibold">
                In Review
              </span>
            </div>
            <p className="text-[11px] text-[#6C7888] mt-2">
              Awaiting approval before dispatch
            </p>
          </div>
          <button
            onClick={() => setCurrentView('outreach')}
            className="text-[11px] font-bold text-[#3B66F5] hover:text-[#2C52D6] flex items-center gap-1 border-t border-[#F0EDE6] pt-2 mt-2 transition-colors cursor-pointer"
          >
            Review Staged Messages <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 3. CREATOR SPOTLIGHT & DISCOVERY VELOCITY BENTO SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Spotlight Creator Card (5 Cols) */}
        {spotlightCreator && (
          <div className="lg:col-span-5 p-6 rounded-3xl border border-[#DFDCD3] bg-white shadow-xs flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF6F59] bg-[#FF6F59]/10 px-2.5 py-1 rounded-full border border-[#FF6F59]/20 flex items-center gap-1.5">
                  <Star className="w-3 h-3 fill-[#FF6F59]" />
                  Top Vetted Match
                </span>
                <span className="font-mono text-xs font-extrabold text-[#65A88B] bg-[#65A88B]/15 px-2.5 py-0.5 rounded-full border border-[#65A88B]/30">
                  {spotlightCreator.qualification.overallScore}/100 Fit Score
                </span>
              </div>

              {/* Creator Visual & Bio */}
              <div className="flex items-start gap-4">
                <img
                  src={spotlightCreator.avatarUrl}
                  alt={spotlightCreator.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#DFDCD3] shadow-sm shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="text-base font-extrabold text-[#141E30] tracking-tight truncate">
                    {spotlightCreator.name}
                  </h3>
                  <p className="text-xs text-[#6C7888] font-medium truncate">
                    {spotlightCreator.channelTitle} · {spotlightCreator.country}
                  </p>
                  <div className="flex items-center gap-3 text-xs font-mono font-bold mt-1.5">
                    <span className="text-[#141E30]">{spotlightCreator.subscribers.toLocaleString()} subs</span>
                    <span className="text-[#3B66F5]">{spotlightCreator.engagementRate}% engagement</span>
                  </div>
                </div>
              </div>

              {/* Grounded Content Insight */}
              <div className="mt-5 p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE7DF] text-xs space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[#6C7888] font-bold">
                  <span className="flex items-center gap-1 text-[#141E30]">
                    <PlaySquare className="w-3.5 h-3.5 text-[#3B66F5]" />
                    Latest Content Hook
                  </span>
                  <span className="font-mono text-[10px] text-[#65A88B]">Verified Video</span>
                </div>
                <p className="text-xs text-[#141E30] font-semibold line-clamp-2 leading-snug">
                  "{spotlightCreator.recentVideos[0]?.title || 'Building Production LLM Systems'}"
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {spotlightCreator.topics.slice(0, 3).map(t => (
                    <span key={t} className="text-[10px] font-mono font-bold text-[#3B66F5] bg-[#3B66F5]/10 px-2 py-0.5 rounded">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-[#F0EDE6] flex items-center justify-between">
              <button
                onClick={() => setSelectedInfluencerForDetail(spotlightCreator)}
                className="text-xs font-bold text-[#6C7888] hover:text-[#141E30] transition-colors cursor-pointer"
              >
                Inspect Dossier
              </button>
              <button
                onClick={() => navigateToPersonalization(spotlightCreator)}
                className="px-4 py-2 rounded-xl bg-[#3B66F5] hover:bg-[#2C52D6] text-white text-xs font-bold shadow-sm shadow-[#3B66F5]/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Draft Personalized Pitch
              </button>
            </div>
          </div>
        )}

        {/* Discovery & Qualification Velocity Area Chart (7 Cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl border border-[#DFDCD3] bg-white shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
            <div>
              <h3 className="text-base font-extrabold text-[#141E30] font-sans">
                Discovery &amp; Qualification Cohort Trends
              </h3>
              <p className="text-xs text-[#6C7888]">
                Monthly discovery volume versus threshold qualification rate
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono font-bold">
              <span className="flex items-center gap-1.5 text-[#3B66F5]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3B66F5]" /> Discovered
              </span>
              <span className="flex items-center gap-1.5 text-[#65A88B]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#65A88B]" /> Qualified
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.discoveryTrend}>
                <defs>
                  <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B66F5" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3B66F5" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorMint" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#65A88B" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#65A88B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EAE7DF" vertical={false} />
                <XAxis dataKey="month" stroke="#78818D" fontSize={11} tickLine={false} />
                <YAxis stroke="#78818D" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    borderColor: '#DFDCD3', 
                    borderRadius: '0.75rem', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '12px',
                    color: '#141E30'
                  }} 
                />
                <Area type="monotone" dataKey="discovered" stroke="#3B66F5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorBlue)" />
                <Area type="monotone" dataKey="qualified" stroke="#65A88B" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMint)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-[#F0EDE6] flex items-center justify-between text-xs text-[#6C7888]">
            <span>Average candidate-to-qualified ratio: <strong className="text-[#141E30] font-mono">75.0%</strong></span>
            <button
              onClick={() => setCurrentView('analytics')}
              className="text-[#3B66F5] hover:text-[#2C52D6] font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              Full Analytics Breakdown <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. CREATOR CRM ROSTER & LIVE INTELLIGENCE STREAM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Top Qualified CRM Table (7 Cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl border border-[#DFDCD3] bg-white shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-[#141E30]">
                Vetted Creator Roster
              </h3>
              <p className="text-xs text-[#6C7888]">
                Highest-scoring technology creators ready for personalized outbound
              </p>
            </div>
            <button
              onClick={() => setCurrentView('database')}
              className="text-xs text-[#3B66F5] hover:text-[#2C52D6] font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              View Full CRM <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#EAE7DF] text-[#78818D] pb-3">
                  <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Creator</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-[10px] text-right">Subscribers</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-[10px] text-right">Engagement</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-[10px] text-right">Qual. Score</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-[10px] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EDE6]">
                {topQualified.map((creator) => (
                  <tr 
                    key={creator.id}
                    onClick={() => setSelectedInfluencerForDetail(creator)}
                    className="hover:bg-[#FAF8F5] transition-colors cursor-pointer group"
                  >
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={creator.avatarUrl}
                          alt={creator.name}
                          referrerPolicy="no-referrer"
                          className="w-9 h-9 rounded-xl object-cover ring-1 ring-[#DFDCD3] shadow-2xs shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-[#141E30] group-hover:text-[#3B66F5] transition-colors truncate">
                            {creator.name}
                          </div>
                          <div className="text-[11px] text-[#6C7888] truncate font-medium">
                            {creator.topics.slice(0, 2).join(', ')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-right font-mono font-semibold text-[#141E30] tabular-nums">
                      {creator.subscribers.toLocaleString()}
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-[#3B66F5] tabular-nums">
                      {creator.engagementRate}%
                    </td>
                    <td className="py-3 text-right font-mono text-[#65A88B] font-extrabold tabular-nums">
                      {creator.qualification.overallScore}/100
                    </td>
                    <td className="py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => navigateToPersonalization(creator)}
                        className="px-3 py-1 rounded-lg bg-[#3B66F5]/10 hover:bg-[#3B66F5]/20 text-[#3B66F5] text-[11px] font-bold transition-colors cursor-pointer border border-[#3B66F5]/20"
                      >
                        Personalize
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Activity & Inbound Intelligence Stream (5 Cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl border border-[#DFDCD3] bg-white shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#EAE7DF]">
            <h3 className="text-base font-extrabold text-[#141E30]">
              Real-Time Outbound Feed
            </h3>
            <span className="text-[10px] text-[#65A88B] font-mono font-bold bg-[#65A88B]/15 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#65A88B] animate-pulse" />
              Live Events
            </span>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {SEED_ACTIVITY.map((act) => (
              <div 
                key={act.id} 
                className="p-3.5 rounded-2xl border border-[#EAE7DF] bg-[#FAF8F5] space-y-1.5 hover:border-[#DFDCD3] transition-colors"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#141E30] flex items-center gap-1.5">
                    {act.title}
                  </span>
                  <span className="text-[10px] font-mono text-[#6C7888] font-semibold">{act.timestamp}</span>
                </div>
                <p className="text-[11px] text-[#556271] leading-relaxed">
                  {act.description}
                </p>
                {act.badge && (
                  <span className="inline-block text-[10px] font-mono font-bold text-[#3B66F5] bg-[#3B66F5]/10 px-2 py-0.5 rounded-md">
                    {act.badge}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
