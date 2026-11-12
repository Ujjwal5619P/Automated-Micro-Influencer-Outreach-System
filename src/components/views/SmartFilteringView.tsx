import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Sparkles, 
  AlertTriangle,
  Info,
  Youtube,
  ArrowRight,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DEFAULT_FILTER_CRITERIA } from '../../data/seedData';
import { evaluateCreatorQualification } from '../../data/seedData';

export const SmartFilteringView: React.FC = () => {
  const { 
    influencers, 
    filterCriteria, 
    updateFilterCriteria, 
    applyFiltering, 
    setSelectedInfluencerForDetail, 
    navigateToPersonalization,
    showToast 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'passed' | 'failed'>('passed');

  const passedCreators = influencers.filter(i => i.qualification.passed);
  const failedCreators = influencers.filter(i => !i.qualification.passed);

  const handleResetDefaults = () => {
    updateFilterCriteria(DEFAULT_FILTER_CRITERIA);
    showToast('Reset filter thresholds to default micro-influencer criteria', 'info');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-[#18243A] font-sans flex items-center gap-2">
            Smart Filtering Engine
            <span className="text-xs font-mono font-bold text-[#4169E1] bg-[#4169E1]/10 px-2 py-0.5 rounded-md">
              Deterministic Vetting
            </span>
          </h1>
          <p className="text-xs text-[#78818D]">
            Active Campaign: <span className="text-[#18243A] font-bold">Indian Technology & AI Micro-Influencers</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetDefaults}
            className="px-3.5 py-2 rounded-xl border border-[#DFDCD3] bg-white hover:bg-[#F7F5F0] text-[#18243A] text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#78818D]" />
            Reset Defaults
          </button>
          <button
            onClick={applyFiltering}
            className="px-4 py-2 rounded-xl bg-[#4169E1] hover:bg-[#3458C9] text-white text-xs font-bold shadow-md shadow-[#4169E1]/25 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Re-evaluate Creators
          </button>
        </div>
      </div>

      {/* Threshold Configuration Panel */}
      <div className="p-6 rounded-2xl border border-[#DFDCD3] bg-white shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-[#EAE7DF] pb-3.5">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#4169E1]" />
            <span className="text-xs font-bold text-[#18243A] uppercase tracking-wider">
              Micro-Influencer Qualification Thresholds
            </span>
          </div>
          <span className="text-[11px] text-[#78818D] font-mono font-bold bg-[#F7F5F0] px-2 py-0.5 rounded">
            4-Gate Pipeline
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Rule 1: Min Followers */}
          <div className="p-4 rounded-xl border border-[#EAE7DF] bg-[#FAF8F5] space-y-2.5">
            <div className="flex items-center justify-between text-[#18243A] font-bold">
              <span>Min Follower Gate</span>
              <span className="font-mono text-[#4169E1] font-extrabold">
                {filterCriteria.minFollowers.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="1000"
              max="20000"
              step="500"
              value={filterCriteria.minFollowers}
              onChange={(e) => updateFilterCriteria({ minFollowers: Number(e.target.value) })}
              className="w-full accent-[#4169E1] cursor-pointer"
            />
            <p className="text-[11px] text-[#78818D] leading-tight font-medium">
              Excludes nano accounts lacking sufficient dev reach.
            </p>
          </div>

          {/* Rule 2: Max Followers */}
          <div className="p-4 rounded-xl border border-[#EAE7DF] bg-[#FAF8F5] space-y-2.5">
            <div className="flex items-center justify-between text-[#18243A] font-bold">
              <span>Max Follower Cap</span>
              <span className="font-mono text-[#4169E1] font-extrabold">
                {filterCriteria.maxFollowers.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="50000"
              max="250000"
              step="5000"
              value={filterCriteria.maxFollowers}
              onChange={(e) => updateFilterCriteria({ maxFollowers: Number(e.target.value) })}
              className="w-full accent-[#4169E1] cursor-pointer"
            />
            <p className="text-[11px] text-[#78818D] leading-tight font-medium">
              Strictly enforces micro-influencer band (&le; 100K).
            </p>
          </div>

          {/* Rule 3: Min Engagement */}
          <div className="p-4 rounded-xl border border-[#EAE7DF] bg-[#FAF8F5] space-y-2.5">
            <div className="flex items-center justify-between text-[#18243A] font-bold">
              <span>Min Engagement</span>
              <span className="font-mono text-[#4169E1] font-extrabold">
                {filterCriteria.minEngagementRate}%
              </span>
            </div>
            <input
              type="range"
              min="1.0"
              max="5.0"
              step="0.1"
              value={filterCriteria.minEngagementRate}
              onChange={(e) => updateFilterCriteria({ minEngagementRate: Number(e.target.value) })}
              className="w-full accent-[#4169E1] cursor-pointer"
            />
            <p className="text-[11px] text-[#78818D] leading-tight font-medium">
              Industry benchmark for authentic dev channels is &ge; 2.0%.
            </p>
          </div>

          {/* Rule 4: Activity (90 Days) */}
          <div className="p-4 rounded-xl border border-[#EAE7DF] bg-[#FAF8F5] space-y-2.5">
            <div className="flex items-center justify-between text-[#18243A] font-bold">
              <span>90-Day Uploads</span>
              <span className="font-mono text-[#4169E1] font-extrabold">
                &ge; {filterCriteria.minUploads90Days} uploads
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="8"
              step="1"
              value={filterCriteria.minUploads90Days}
              onChange={(e) => updateFilterCriteria({ minUploads90Days: Number(e.target.value) })}
              className="w-full accent-[#4169E1] cursor-pointer"
            />
            <p className="text-[11px] text-[#78818D] leading-tight font-medium">
              Filters out dormant channels with stale engagement.
            </p>
          </div>
        </div>
      </div>

      {/* Passed vs Failed Segmented Summary */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 p-1 bg-white rounded-xl border border-[#DFDCD3] shadow-2xs">
          <button
            onClick={() => setActiveTab('passed')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'passed'
                ? 'bg-[#65A88B]/15 text-[#65A88B] border border-[#65A88B]/30'
                : 'text-[#78818D] hover:text-[#18243A]'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-[#65A88B]" />
            Passed Qualification ({passedCreators.length})
          </button>
          <button
            onClick={() => setActiveTab('failed')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'failed'
                ? 'bg-[#FF805D]/15 text-[#FF805D] border border-[#FF805D]/30'
                : 'text-[#78818D] hover:text-[#18243A]'
            }`}
          >
            <XCircle className="w-4 h-4 text-[#FF805D]" />
            Failed / Needs Review ({failedCreators.length})
          </button>
        </div>

        <div className="text-xs text-[#78818D] font-medium">
          Showing <span className="font-mono font-bold text-[#18243A]">{activeTab === 'passed' ? passedCreators.length : failedCreators.length}</span> candidates
        </div>
      </div>

      {/* Cards Display for Active Tab */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {(activeTab === 'passed' ? passedCreators : failedCreators).map((inf) => {
          const isPassed = inf.qualification.passed;

          return (
            <div
              key={inf.id}
              onClick={() => setSelectedInfluencerForDetail(inf)}
              className="p-5 rounded-2xl border border-[#DFDCD3] bg-white hover:border-[#4169E1]/40 hover:shadow-md transition-all cursor-pointer group shadow-2xs flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3.5">
                  <div className="flex items-center gap-3">
                    <img
                      src={inf.avatarUrl}
                      alt={inf.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover ring-1 ring-[#DFDCD3] shadow-2xs shrink-0"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-[#18243A] group-hover:text-[#4169E1] transition-colors">
                        {inf.name}
                      </h3>
                      <div className="text-[11px] text-[#78818D] font-medium">
                        {inf.handle} · {inf.country}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-[#78818D] block font-bold uppercase tracking-wider">Overall Score</span>
                    <span className={`text-base font-extrabold font-mono ${isPassed ? 'text-[#65A88B]' : 'text-[#FF805D]'}`}>
                      {inf.qualification.overallScore}/100
                    </span>
                  </div>
                </div>

                {/* Metrics Matrix */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE7DF] mb-3 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-[#78818D] font-bold uppercase block">Followers</span>
                    <span className="font-mono font-semibold text-[#18243A]">
                      {inf.subscribers.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#78818D] font-bold uppercase block">Engagement</span>
                    <span className="font-mono font-bold text-[#4169E1]">
                      {inf.engagementRate}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#78818D] font-bold uppercase block">90d Uploads</span>
                    <span className="font-mono font-semibold text-[#18243A]">
                      {inf.uploadsLast90Days}
                    </span>
                  </div>
                </div>

                {/* Score Radars / Diagnostic Bars */}
                <div className="space-y-1.5 mb-3 text-[11px] font-medium">
                  <div className="flex items-center justify-between text-[#78818D]">
                    <span>Relevance ({inf.qualification.relevanceScore}/100)</span>
                    <span>Engagement ({inf.qualification.engagementScore}/100)</span>
                    <span>Activity ({inf.qualification.activityScore}/100)</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 h-1.5 rounded-full overflow-hidden bg-[#EAE7DF]">
                    <div 
                      className="h-full bg-[#4169E1] rounded-full" 
                      style={{ width: `${inf.qualification.relevanceScore}%` }} 
                    />
                    <div 
                      className="h-full bg-[#18243A] rounded-full" 
                      style={{ width: `${inf.qualification.engagementScore}%` }} 
                    />
                    <div 
                      className="h-full bg-[#65A88B] rounded-full" 
                      style={{ width: `${inf.qualification.activityScore}%` }} 
                    />
                  </div>
                </div>

                {/* Rejection Reasons if Failed */}
                {!isPassed && inf.qualification.rejectionReasons.length > 0 && (
                  <div className="p-3 rounded-xl bg-[#FF805D]/10 border border-[#FF805D]/25 text-xs mb-3">
                    <span className="text-[#FF805D] font-bold block mb-1 flex items-center gap-1 text-[11px]">
                      <XCircle className="w-3.5 h-3.5 shrink-0" /> Rejection Diagnostics:
                    </span>
                    <ul className="text-[#C95332] text-[11px] space-y-0.5 list-disc pl-4 font-medium">
                      {inf.qualification.rejectionReasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-[#EAE7DF] flex items-center justify-between text-xs">
                <span className="text-[#78818D] font-medium truncate max-w-[200px]">
                  {inf.topics.slice(0, 2).join(' · ')}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateToPersonalization(inf);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-[#4169E1]/10 hover:bg-[#4169E1]/20 text-[#4169E1] font-bold transition-colors border border-[#4169E1]/20 flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Personalize
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
