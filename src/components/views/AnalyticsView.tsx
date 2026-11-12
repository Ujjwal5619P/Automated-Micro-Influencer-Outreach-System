import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  UserCheck, 
  Send, 
  Mail, 
  Percent, 
  PieChart as PieIcon,
  ArrowRight,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { influenceApi, AnalyticsSummary } from '../../services/api';

const PALETTE = ['#3B66F5', '#FF6F59', '#65A88B', '#E9B85B', '#141E30', '#7090FF'];

export const AnalyticsView: React.FC = () => {
  const { influencers, outreachLogs, campaigns } = useApp();
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    influenceApi.getAnalytics().then(setAnalytics);
  }, [influencers, outreachLogs]);

  if (!analytics) return null;

  // Engagement Distribution Data
  const engagementBands = [
    { band: '1.0%–2.0%', count: influencers.filter(i => i.engagementRate < 2.0).length },
    { band: '2.0%–3.0%', count: influencers.filter(i => i.engagementRate >= 2.0 && i.engagementRate < 3.0).length },
    { band: '3.0%–4.0%', count: influencers.filter(i => i.engagementRate >= 3.0 && i.engagementRate < 4.0).length },
    { band: '4.0%–5.0%', count: influencers.filter(i => i.engagementRate >= 4.0 && i.engagementRate < 5.0).length },
    { band: '> 5.0%', count: influencers.filter(i => i.engagementRate >= 5.0).length },
  ];

  return (
    <div className="space-y-6 pb-14 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#141E30] font-sans flex items-center gap-2.5">
            Platform Analytics &amp; Conversion Funnel
            <span className="text-xs font-mono font-bold text-[#3B66F5] bg-[#3B66F5]/10 px-2.5 py-0.5 rounded-full border border-[#3B66F5]/20">
              Pipeline Intelligence
            </span>
          </h1>
          <p className="text-xs text-[#6C7888]">
            Telemetry tracking candidate discovery velocity, engagement distribution, and outbound response yield
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-[#65A88B] bg-[#65A88B]/15 px-3 py-1.5 rounded-xl border border-[#65A88B]/30 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {analytics.replyRate}% Verified Response Rate
          </span>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-[#DFDCD3] bg-white shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#6C7888] mb-1">
            Total Discovered
          </div>
          <div className="text-2xl font-mono font-extrabold text-[#141E30]">
            {analytics.totalDiscovered}
          </div>
          <div className="text-[11px] text-[#3B66F5] font-bold mt-1">
            {analytics.qualifiedCount} Qualified ({Math.round((analytics.qualifiedCount / Math.max(analytics.totalDiscovered, 1)) * 100)}%)
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[#DFDCD3] bg-white shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#6C7888] mb-1">
            Avg Engagement Rate
          </div>
          <div className="text-2xl font-mono font-extrabold text-[#3B66F5]">
            {analytics.avgEngagementRate}%
          </div>
          <div className="text-[11px] text-[#6C7888] mt-1 font-medium">
            Threshold: 2.0%
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[#DFDCD3] bg-white shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#6C7888] mb-1">
            Outreach Sent
          </div>
          <div className="text-2xl font-mono font-extrabold text-[#FF6F59]">
            {analytics.emailsSent}
          </div>
          <div className="text-[11px] text-[#65A88B] font-bold mt-1">
            {analytics.replyRate}% Verified Replies
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[#DFDCD3] bg-white shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#6C7888] mb-1">
            Active Campaigns
          </div>
          <div className="text-2xl font-mono font-extrabold text-[#141E30]">
            {campaigns.length}
          </div>
          <div className="text-[11px] text-[#6C7888] mt-1 font-medium">
            3 Active Developer Initiatives
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Discovery & Qualified Trends Area Chart (7 Cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl border border-[#DFDCD3] bg-white shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-[#141E30]">
                Discovery Velocity &amp; Qualified Cohorts
              </h3>
              <p className="text-xs text-[#6C7888]">
                Growth trajectory across candidates evaluated against qualification gates
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono font-bold">
              <span className="flex items-center gap-1 text-[#3B66F5]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3B66F5]" /> Discovered
              </span>
              <span className="flex items-center gap-1 text-[#65A88B]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#65A88B]" /> Qualified
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.discoveryTrend}>
                <defs>
                  <linearGradient id="anBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B66F5" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3B66F5" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="anMint" x1="0" y1="0" x2="0" y2="1">
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
                <Area type="monotone" dataKey="discovered" stroke="#3B66F5" strokeWidth={2.5} fillOpacity={1} fill="url(#anBlue)" />
                <Area type="monotone" dataKey="qualified" stroke="#65A88B" strokeWidth={2.5} fillOpacity={1} fill="url(#anMint)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Outreach Status Pie Chart (5 Cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl border border-[#DFDCD3] bg-white shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-[#141E30]">
              Outreach Status Distribution
            </h3>
            <p className="text-xs text-[#6C7888]">
              Lifecycle stages of all staged and dispatched communication
            </p>
          </div>

          <div className="h-52 w-full flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.outreachStatusDistribution}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                >
                  {analytics.outreachStatusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    borderColor: '#DFDCD3', 
                    borderRadius: '0.75rem', 
                    fontSize: '12px',
                    color: '#141E30'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#EAE7DF] text-xs">
            {analytics.outreachStatusDistribution.map((item, idx) => (
              <div key={item.status} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PALETTE[idx % PALETTE.length] }} />
                <span className="text-[#6C7888] truncate font-medium">{item.status}:</span>
                <span className="font-mono text-[#141E30] font-bold ml-auto">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Engagement Bands Bar Chart */}
      <div className="p-6 rounded-3xl border border-[#DFDCD3] bg-white shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-[#141E30]">
              Audience Engagement Rate Distribution
            </h3>
            <p className="text-xs text-[#6C7888]">
              Distribution of discovered creators across engagement percentage brackets
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-[#3B66F5] bg-[#3B66F5]/10 px-2.5 py-0.5 rounded-full">
            Target ≥ 2.0%
          </span>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={engagementBands}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EAE7DF" vertical={false} />
              <XAxis dataKey="band" stroke="#78818D" fontSize={11} tickLine={false} />
              <YAxis stroke="#78818D" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#FFFFFF', 
                  borderColor: '#DFDCD3', 
                  borderRadius: '0.75rem', 
                  fontSize: '12px',
                  color: '#141E30'
                }} 
              />
              <Bar dataKey="count" fill="#3B66F5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
