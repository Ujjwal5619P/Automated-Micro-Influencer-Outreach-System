import React, { useState } from 'react';
import { 
  UserCheck, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Mail, 
  Globe, 
  Instagram, 
  Youtube, 
  Sparkles,
  Calendar,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Influencer } from '../../types';
import { influenceApi } from '../../services/api';

export const ProfileEnrichmentView: React.FC = () => {
  const { 
    influencers, 
    setInfluencers, 
    setSelectedInfluencerForDetail, 
    navigateToPersonalization,
    showToast 
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<'all' | 'complete' | 'partial'>('all');
  const [selectedCreatorId, setSelectedCreatorId] = useState<string>(influencers[0]?.id || '');
  const [isEnriching, setIsEnriching] = useState<boolean>(false);

  const selectedCreator = influencers.find(i => i.id === selectedCreatorId) || influencers[0];

  const handleEnrichSelected = async () => {
    if (!selectedCreator) return;
    setIsEnriching(true);
    showToast(`Enriching profile data for ${selectedCreator.name}...`, 'info');
    try {
      const updated = await influenceApi.runEnrichment(selectedCreator.id);
      setInfluencers(prev => prev.map(i => i.id === updated.id ? updated : i));
      showToast(`Enrichment complete for ${updated.name}`, 'success');
    } catch (err) {
      showToast('Enrichment process failed', 'error');
    } finally {
      setIsEnriching(false);
    }
  };

  const filteredList = influencers.filter(i => {
    if (filterStatus === 'complete') return i.enrichmentStatus === 'complete';
    if (filterStatus === 'partial') return i.enrichmentStatus === 'partial';
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-[#18243A] font-sans flex items-center gap-2">
            Profile Enrichment &amp; Demographic Audit
            <span className="text-xs font-mono font-bold text-[#65A88B] bg-[#65A88B]/15 px-2 py-0.5 rounded-md">
              Zero-Fabrication Policy
            </span>
          </h1>
          <p className="text-xs text-[#78818D]">
            Verify contact emails, audience demographics, content themes, and missing data points
          </p>
        </div>

        <button
          onClick={handleEnrichSelected}
          disabled={isEnriching || !selectedCreator}
          className="px-4 py-2 rounded-xl bg-[#4169E1] hover:bg-[#3458C9] disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-[#4169E1]/25 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isEnriching ? 'animate-spin' : ''}`} />
          {isEnriching ? 'Enriching...' : 'Run Enrichment Audit'}
        </button>
      </div>

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Creator Selection Directory (4 Cols) */}
        <div className="lg:col-span-4 p-4 rounded-2xl border border-[#DFDCD3] bg-white shadow-sm flex flex-col h-[680px]">
          {/* Filter status buttons */}
          <div className="flex items-center gap-1 p-1 bg-[#F7F5F0] rounded-xl border border-[#DFDCD3] mb-3 text-xs">
            {(['all', 'complete', 'partial'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilterStatus(tab)}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer capitalize text-[11px] ${
                  filterStatus === tab
                    ? 'bg-white text-[#4169E1] shadow-2xs border border-[#D5D2C7]'
                    : 'text-[#78818D] hover:text-[#18243A]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Creator list */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredList.map((inf) => {
              const isSelected = inf.id === selectedCreator?.id;
              const isComplete = inf.enrichmentStatus === 'complete';

              return (
                <button
                  key={inf.id}
                  onClick={() => setSelectedCreatorId(inf.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left cursor-pointer ${
                    isSelected
                      ? 'border-[#4169E1] bg-[#4169E1]/5 shadow-xs'
                      : 'border-[#EAE7DF] hover:bg-[#F7F5F0]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={inf.avatarUrl}
                      alt={inf.name}
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-xl object-cover ring-1 ring-[#DFDCD3] shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#18243A] truncate">
                        {inf.name}
                      </div>
                      <div className="text-[11px] text-[#78818D] font-medium truncate">
                        {inf.handle}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    {isComplete ? (
                      <span className="text-[10px] font-bold text-[#65A88B] bg-[#65A88B]/15 px-2 py-0.5 rounded-full border border-[#65A88B]/25">
                        Complete
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-[#FF805D] bg-[#FF805D]/15 px-2 py-0.5 rounded-full border border-[#FF805D]/25">
                        {inf.missingFields.length} Missing
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Enriched Profile (8 Cols) */}
        {selectedCreator ? (
          <div className="lg:col-span-8 space-y-5">
            {/* Creator Header Profile Card */}
            <div className="p-6 rounded-2xl border border-[#DFDCD3] bg-white shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#EAE7DF]">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedCreator.avatarUrl}
                    alt={selectedCreator.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white shadow-md"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-extrabold text-[#18243A] font-sans">
                        {selectedCreator.name}
                      </h2>
                      <span className="text-[11px] font-mono font-bold text-[#4169E1] bg-[#4169E1]/10 px-2 py-0.5 rounded-md border border-[#4169E1]/20">
                        {selectedCreator.niche}
                      </span>
                    </div>
                    <p className="text-xs text-[#78818D] font-medium flex items-center gap-2 mt-0.5">
                      <span>{selectedCreator.handle}</span>
                      <span>·</span>
                      <span>{selectedCreator.country}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => navigateToPersonalization(selectedCreator)}
                    className="px-4 py-2 rounded-xl bg-[#4169E1] hover:bg-[#3458C9] text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#4169E1]/20"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Personalize Outreach
                  </button>
                </div>
              </div>

              {/* Enrichment Status & Timestamp Audit Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
                <div>
                  <span className="text-[10px] text-[#78818D] font-bold uppercase block">Enrichment Status</span>
                  <span className={`font-bold ${selectedCreator.enrichmentStatus === 'complete' ? 'text-[#65A88B]' : 'text-[#FF805D]'}`}>
                    {selectedCreator.enrichmentStatus === 'complete' ? 'Fully Enriched' : 'Partial Data'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#78818D] font-bold uppercase block">Last Verified</span>
                  <span className="font-mono text-[#18243A] font-semibold text-[11px]">
                    {new Date(selectedCreator.lastUpdated).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#78818D] font-bold uppercase block">Subscribers</span>
                  <span className="font-mono text-[#18243A] font-bold">
                    {selectedCreator.subscribers.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#78818D] font-bold uppercase block">Engagement Rate</span>
                  <span className="font-mono text-[#4169E1] font-bold">
                    {selectedCreator.engagementRate}%
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Verification & Source URLs */}
            <div className="p-6 rounded-2xl border border-[#DFDCD3] bg-white shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#18243A]">
                Contact &amp; Identity Verification
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                {/* Contact Email */}
                <div className="p-3.5 rounded-xl border border-[#EAE7DF] bg-[#FAF8F5] space-y-1">
                  <span className="text-[10px] text-[#78818D] font-bold uppercase flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#4169E1]" />
                    Public Contact Email
                  </span>
                  {selectedCreator.contactEmail ? (
                    <span className="font-mono text-[#18243A] text-xs font-semibold block truncate" title={selectedCreator.contactEmail}>
                      {selectedCreator.contactEmail}
                    </span>
                  ) : (
                    <span className="text-[#FF805D] font-bold text-xs flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Unavailable / Not Found
                    </span>
                  )}
                </div>

                {/* Website / Portfolio */}
                <div className="p-3.5 rounded-xl border border-[#EAE7DF] bg-[#FAF8F5] space-y-1">
                  <span className="text-[10px] text-[#78818D] font-bold uppercase flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#18243A]" />
                    Portfolio / Substack
                  </span>
                  {selectedCreator.website ? (
                    <a 
                      href={selectedCreator.website}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-[#4169E1] hover:underline text-xs font-semibold block truncate"
                    >
                      {selectedCreator.website.replace('https://', '')}
                    </a>
                  ) : (
                    <span className="text-[#78818D] font-semibold text-xs">
                      Unavailable
                    </span>
                  )}
                </div>

                {/* Instagram Handle */}
                <div className="p-3.5 rounded-xl border border-[#EAE7DF] bg-[#FAF8F5] space-y-1">
                  <span className="text-[10px] text-[#78818D] font-bold uppercase flex items-center gap-1.5">
                    <Instagram className="w-3.5 h-3.5 text-[#FF805D]" />
                    Instagram Handle
                  </span>
                  {selectedCreator.instagramHandle ? (
                    <span className="font-mono text-[#18243A] text-xs font-semibold block truncate">
                      @{selectedCreator.instagramHandle}
                    </span>
                  ) : (
                    <span className="text-[#78818D] text-xs font-medium">
                      Unavailable
                    </span>
                  )}
                </div>
              </div>

              {/* Missing Fields Checklist */}
              {selectedCreator.missingFields.length > 0 && (
                <div className="p-3.5 rounded-xl bg-[#FF805D]/10 border border-[#FF805D]/25 text-xs text-[#C95332] flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold">
                    <AlertCircle className="w-4 h-4 text-[#FF805D] shrink-0" />
                    Missing Fields Identified: {selectedCreator.missingFields.join(', ')}
                  </span>
                  <span className="text-[11px] font-semibold text-[#FF805D]">
                    Strict zero-fabrication standard
                  </span>
                </div>
              )}
            </div>

            {/* Audience Demographics Panel */}
            <div className="p-6 rounded-2xl border border-[#DFDCD3] bg-white shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#18243A]">
                Audience Demographics Breakdown
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Age */}
                <div className="p-4 rounded-xl border border-[#EAE7DF] bg-[#FAF8F5] space-y-2.5">
                  <span className="text-[10px] text-[#78818D] font-bold uppercase block">Age Distribution</span>
                  <div className="space-y-2">
                    {selectedCreator.demographics.ageRanges.map(a => (
                      <div key={a.range} className="space-y-1">
                        <div className="flex justify-between text-[11px] font-mono font-bold text-[#18243A]">
                          <span>{a.range}</span>
                          <span>{a.percentage}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[#EAE7DF] overflow-hidden">
                          <div className="h-full bg-[#4169E1] rounded-full" style={{ width: `${a.percentage}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gender */}
                <div className="p-4 rounded-xl border border-[#EAE7DF] bg-[#FAF8F5] space-y-2.5">
                  <span className="text-[10px] text-[#78818D] font-bold uppercase block">Audience Gender</span>
                  <div className="space-y-2.5 pt-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#78818D] font-medium">Male</span>
                      <span className="font-mono text-[#18243A] font-extrabold">{selectedCreator.demographics.gender.male}%</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#78818D] font-medium">Female</span>
                      <span className="font-mono text-[#18243A] font-extrabold">{selectedCreator.demographics.gender.female}%</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#78818D] font-medium">Other</span>
                      <span className="font-mono text-[#18243A] font-extrabold">{selectedCreator.demographics.gender.other || 0}%</span>
                    </div>
                  </div>
                </div>

                {/* Top Countries */}
                <div className="p-4 rounded-xl border border-[#EAE7DF] bg-[#FAF8F5] space-y-2.5">
                  <span className="text-[10px] text-[#78818D] font-bold uppercase block">Viewer Geography</span>
                  <div className="space-y-2 pt-1">
                    {selectedCreator.demographics.topCountries.map(c => (
                      <div key={c.country} className="flex justify-between text-xs">
                        <span className="text-[#202A38] font-semibold">{c.country}</span>
                        <span className="font-mono text-[#4169E1] font-bold">{c.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
