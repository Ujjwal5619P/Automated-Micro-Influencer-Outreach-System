import React, { useState, useMemo } from 'react';
import { 
  Database, 
  Search, 
  Download, 
  CheckSquare, 
  Square, 
  Sparkles, 
  Mail, 
  CheckCircle2, 
  XCircle, 
  Youtube, 
  Instagram,
  ExternalLink,
  Target,
  Trash2,
  Filter,
  UserCheck,
  Percent,
  PlaySquare,
  AlertCircle,
  Eye,
  SlidersHorizontal,
  FolderDot
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Influencer } from '../../types';

export const DatabaseView: React.FC = () => {
  const { 
    influencers, 
    setInfluencers,
    activeCampaign, 
    setSelectedInfluencerForDetail, 
    navigateToPersonalization,
    showToast 
  } = useApp();

  const [query, setQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'qualified' | 'needs_review' | 'has_email'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const qualifiedCount = influencers.filter(i => i.qualification.passed).length;
  const needsReviewCount = influencers.filter(i => !i.qualification.passed).length;
  const hasEmailCount = influencers.filter(i => Boolean(i.contactEmail)).length;

  const filtered = useMemo(() => {
    return influencers.filter(inf => {
      if (filterTab === 'qualified' && !inf.qualification.passed) return false;
      if (filterTab === 'needs_review' && inf.qualification.passed) return false;
      if (filterTab === 'has_email' && !inf.contactEmail) return false;

      if (query.trim()) {
        const q = query.toLowerCase();
        return (
          inf.name.toLowerCase().includes(q) ||
          inf.handle.toLowerCase().includes(q) ||
          inf.topics.some(t => t.toLowerCase().includes(q)) ||
          inf.niche.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [influencers, filterTab, query]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(i => i.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkAddToCampaign = () => {
    if (selectedIds.length === 0) return;
    if (!activeCampaign) {
      showToast('No active campaign selected', 'error');
      return;
    }
    setInfluencers(prev => prev.map(inf => {
      if (selectedIds.includes(inf.id)) {
        const campaignIds = Array.from(new Set([...inf.campaignIds, activeCampaign.id]));
        return { ...inf, campaignIds };
      }
      return inf;
    }));
    showToast(`Added ${selectedIds.length} creators to "${activeCampaign.name}"`, 'success');
    setSelectedIds([]);
  };

  const handleBulkExport = () => {
    const targets = influencers.filter(i => selectedIds.includes(i.id));
    if (targets.length === 0) return;

    const headers = ['Name', 'Handle', 'Platform', 'Subscribers', 'Engagement Rate (%)', 'Niche', 'Contact Email', 'Qualification Score'];
    const rows = targets.map(i => [
      `"${i.name}"`,
      `"${i.handle}"`,
      i.platform,
      i.subscribers,
      i.engagementRate,
      `"${i.niche}"`,
      `"${i.contactEmail || 'Unavailable'}"`,
      i.qualification.overallScore,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `influenceai_crm_export_${targets.length}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${targets.length} creators`, 'success');
  };

  return (
    <div className="space-y-6 pb-14 max-w-7xl mx-auto">
      {/* Title & Bulk Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#141E30] font-sans flex items-center gap-2.5">
            Influencer CRM &amp; Repository
            <span className="text-xs font-mono font-bold text-[#3B66F5] bg-[#3B66F5]/10 px-2.5 py-0.5 rounded-full border border-[#3B66F5]/20">
              {influencers.length} Total Saved
            </span>
          </h1>
          <p className="text-xs text-[#6C7888]">
            Unified repository of discovered creators, verified emails, and qualification histories
          </p>
        </div>

        {/* Bulk Action Strip if items are selected */}
        {selectedIds.length > 0 ? (
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#121A2A] text-white shadow-md animate-in fade-in duration-150">
            <span className="text-xs font-mono font-bold text-[#FF805D] px-3">
              {selectedIds.length} Selected
            </span>
            <button
              onClick={handleBulkAddToCampaign}
              className="px-3 py-1.5 rounded-xl bg-[#3B66F5] hover:bg-[#2C52D6] text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Target className="w-3.5 h-3.5" />
              Add to Active Campaign
            </button>
            <button
              onClick={handleBulkExport}
              className="px-3 py-1.5 rounded-xl border border-[#2B3A52] bg-[#1E2B40] text-white text-xs font-semibold hover:bg-[#283852] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#6C7888]">
              Active Campaign:{' '}
              <strong className="text-[#141E30]">{activeCampaign?.name || 'Indian Tech & AI'}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Filter Tabs & Search Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl border border-[#DFDCD3] bg-white shadow-xs">
        {/* Filter Segmented Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-[#FAF8F5] rounded-2xl border border-[#DFDCD3] w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All Saved', count: influencers.length },
            { id: 'qualified', label: 'Qualified', count: qualifiedCount },
            { id: 'needs_review', label: 'Needs Review', count: needsReviewCount },
            { id: 'has_email', label: 'Verified Email', count: hasEmailCount },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                filterTab === tab.id
                  ? 'bg-white text-[#141E30] shadow-xs font-extrabold border border-[#D5D2C7]'
                  : 'text-[#6C7888] hover:text-[#141E30]'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                filterTab === tab.id ? 'bg-[#3B66F5]/10 text-[#3B66F5]' : 'bg-[#EAE7DF] text-[#6C7888]'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Instant Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#78818D] absolute left-3.5 top-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, handle, topic..."
            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#DFDCD3] bg-[#FAF8F5] text-xs font-medium text-[#141E30] placeholder-[#78818D] focus:outline-none focus:border-[#3B66F5] focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Database CRM Table */}
      <div className="rounded-3xl border border-[#DFDCD3] bg-white overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#EAE7DF] bg-[#FAF8F5] text-[#6C7888] select-none">
              <th className="py-3.5 px-4 w-10 text-center">
                <button onClick={toggleSelectAll} className="cursor-pointer text-[#6C7888] hover:text-[#141E30]">
                  {selectedIds.length === filtered.length && filtered.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-[#3B66F5]" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px]">Creator / Channel</th>
              <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px] text-right">Subscribers</th>
              <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px] text-right">Engagement</th>
              <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px]">Contact Email</th>
              <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px]">Campaign</th>
              <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px] text-center">Vetting Status</th>
              <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0EDE6]">
            {filtered.map((inf) => {
              const isSelected = selectedIds.includes(inf.id);
              const inActiveCampaign = inf.campaignIds.includes(activeCampaign?.id || '');

              return (
                <tr
                  key={inf.id}
                  onClick={() => setSelectedInfluencerForDetail(inf)}
                  className={`hover:bg-[#FAF8F5] transition-colors cursor-pointer group ${
                    isSelected ? 'bg-[#3B66F5]/5' : ''
                  }`}
                >
                  <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => toggleSelectOne(inf.id)} className="cursor-pointer">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#3B66F5]" />
                      ) : (
                        <Square className="w-4 h-4 text-[#8895A5] group-hover:text-[#141E30]" />
                      )}
                    </button>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={inf.avatarUrl}
                        alt={inf.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-2xl object-cover ring-1 ring-[#DFDCD3] shadow-2xs shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-extrabold text-[#141E30] group-hover:text-[#3B66F5] transition-colors truncate flex items-center gap-1.5">
                          {inf.name}
                          <span className="text-[10px] text-[#FF0000]">
                            <Youtube className="w-3.5 h-3.5" />
                          </span>
                        </div>
                        <div className="text-[11px] text-[#6C7888] font-medium truncate">
                          {inf.handle} · {inf.niche}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 text-right font-mono font-semibold text-[#141E30] tabular-nums">
                    {inf.subscribers.toLocaleString()}
                  </td>

                  <td className="py-3.5 px-3 text-right font-mono font-bold text-[#3B66F5] tabular-nums">
                    {inf.engagementRate}%
                  </td>

                  <td className="py-3.5 px-3 font-mono text-[11px]">
                    {inf.contactEmail ? (
                      <span className="text-[#141E30] font-medium truncate max-w-[150px] block" title={inf.contactEmail}>
                        {inf.contactEmail}
                      </span>
                    ) : (
                      <span className="text-[#FF6F59] font-sans font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Unavailable
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-3">
                    {inActiveCampaign ? (
                      <span className="text-[11px] font-bold text-[#3B66F5] bg-[#3B66F5]/10 px-2.5 py-0.5 rounded-full border border-[#3B66F5]/20 truncate block max-w-[140px]">
                        {activeCampaign?.name}
                      </span>
                    ) : inf.campaignIds.length > 0 ? (
                      <span className="text-[11px] font-medium text-[#6C7888]">
                        {inf.campaignIds.length} campaigns
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#8895A5]">Unassigned</span>
                    )}
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    {inf.qualification.passed ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#65A88B] bg-[#65A88B]/15 px-2.5 py-0.5 rounded-full border border-[#65A88B]/30 font-mono">
                        <CheckCircle2 className="w-3 h-3" />
                        {inf.qualification.overallScore}/100
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#FF6F59] bg-[#FF6F59]/15 px-2.5 py-0.5 rounded-full border border-[#FF6F59]/30 font-mono">
                        <XCircle className="w-3 h-3" />
                        {inf.qualification.overallScore}/100
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => navigateToPersonalization(inf)}
                        className="px-3 py-1.5 rounded-xl bg-[#3B66F5]/10 hover:bg-[#3B66F5]/20 text-[#3B66F5] text-[11px] font-bold transition-colors border border-[#3B66F5]/20 flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        Personalize
                      </button>
                      <button
                        onClick={() => setSelectedInfluencerForDetail(inf)}
                        className="p-1.5 rounded-xl text-[#6C7888] hover:text-[#141E30] hover:bg-[#EAE7DF] transition-colors cursor-pointer"
                        title="View Full Profile Dossier"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
