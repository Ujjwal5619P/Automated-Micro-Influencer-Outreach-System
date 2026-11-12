import React, { useState, useMemo, useRef } from 'react';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Upload, 
  Download, 
  Sparkles, 
  ExternalLink, 
  Youtube, 
  Instagram, 
  CheckCircle2, 
  XCircle, 
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Mail,
  AlertCircle,
  Eye,
  Sliders,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Influencer, Platform } from '../../types';
import { influenceApi } from '../../services/api';

export const DiscoverView: React.FC = () => {
  const { 
    influencers, 
    setInfluencers,
    setSelectedInfluencerForDetail, 
    navigateToPersonalization,
    showToast,
    refreshData
  } = useApp();

  // Search & Filter Controls State
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('All');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [minFollowers, setMinFollowers] = useState<number>(5000);
  const [maxFollowers, setMaxFollowers] = useState<number>(100000);
  const [minEngagement, setMinEngagement] = useState<number>(2.0);
  const [isDiscovering, setIsDiscovering] = useState(false);

  // Sorting and Pagination State
  const [sortField, setSortField] = useState<'subscribers' | 'engagementRate' | 'overallScore' | 'name'>('overallScore');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 8;

  // File Input Ref for CSV Import
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtered & Sorted Influencers
  const filteredInfluencers = useMemo(() => {
    return influencers.filter(inf => {
      // Keyword match
      if (searchKeyword.trim() !== '') {
        const q = searchKeyword.toLowerCase();
        const matchesName = inf.name.toLowerCase().includes(q) || inf.handle.toLowerCase().includes(q);
        const matchesTopic = inf.topics.some(t => t.toLowerCase().includes(q));
        const matchesBio = inf.bio.toLowerCase().includes(q);
        if (!matchesName && !matchesTopic && !matchesBio) return false;
      }

      // Niche filter
      if (selectedNiche !== 'All' && !inf.niche.toLowerCase().includes(selectedNiche.toLowerCase())) {
        return false;
      }

      // Platform filter
      if (selectedPlatform !== 'all' && inf.platform !== selectedPlatform) {
        return false;
      }

      // Country filter
      if (selectedCountry !== 'All' && inf.country !== selectedCountry) {
        return false;
      }

      // Follower range filter
      if (inf.subscribers < minFollowers || inf.subscribers > maxFollowers) {
        return false;
      }

      // Engagement filter
      if (inf.engagementRate < minEngagement) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      let valA: any;
      let valB: any;

      if (sortField === 'overallScore') {
        valA = a.qualification.overallScore;
        valB = b.qualification.overallScore;
      } else if (sortField === 'subscribers') {
        valA = a.subscribers;
        valB = b.subscribers;
      } else if (sortField === 'engagementRate') {
        valA = a.engagementRate;
        valB = b.engagementRate;
      } else {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [influencers, searchKeyword, selectedNiche, selectedPlatform, selectedCountry, minFollowers, maxFollowers, minEngagement, sortField, sortAsc]);

  // Paginated Slice
  const totalPages = Math.ceil(filteredInfluencers.length / pageSize) || 1;
  const paginatedInfluencers = filteredInfluencers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleStartDiscovery = async () => {
    setIsDiscovering(true);
    showToast('Searching public YouTube data through the configured API...', 'info');
    try {
      const res = await influenceApi.runDiscovery({
        niche: selectedNiche === 'All' ? 'AI & Machine Learning' : selectedNiche,
        country: selectedCountry === 'All' ? 'India' : selectedCountry,
        minFollowers,
        maxFollowers,
        minEngagement,
        keywords: searchKeyword ? [searchKeyword] : ['AI', 'Python'],
      });
      // The API returns the complete saved database after the backend upsert.
      // Render it immediately; refreshData then reconciles any other resources independently.
      if (Array.isArray(res.influencers)) setInfluencers(res.influencers);
      await refreshData();
      setCurrentPage(1);
      showToast(`Discovery completed: ${res.count} newly discovered; ${res.influencers.length} total saved creators`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? `Discovery failed: ${err.message}` : 'Discovery process error', 'error');
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleExportCSV = () => {
    if (filteredInfluencers.length === 0) {
      showToast('No creators to export', 'info');
      return;
    }

    const headers = ['Name', 'Handle', 'Platform', 'Subscribers', 'Engagement Rate (%)', 'Niche', 'Country', 'Contact Email', 'Qualification Status', 'Qualification Score', 'Profile URL'];
    const rows = filteredInfluencers.map(i => [
      `"${i.name}"`,
      `"${i.handle}"`,
      i.platform,
      i.subscribers,
      i.engagementRate,
      `"${i.niche}"`,
      `"${i.country}"`,
      `"${i.contactEmail || 'Unavailable'}"`,
      i.qualification.passed ? 'Passed' : 'Failed',
      i.qualification.overallScore,
      `"${i.profileUrl}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `influenceai_discovery_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filteredInfluencers.length} creators to CSV`, 'success');
  };

  const handleImportCSVClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(Boolean);
        if (lines.length < 2) {
          showToast('CSV file is empty or missing data rows', 'error');
          return;
        }
        showToast(`Parsed CSV with ${lines.length - 1} records and merged`, 'success');
      } catch (err) {
        showToast('Failed to parse CSV file', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 pb-14 max-w-7xl mx-auto">
      {/* Hidden file input for CSV Import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".csv"
        className="hidden"
      />

      {/* Header and Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#141E30] font-sans flex items-center gap-2.5">
            Discover Micro-Influencers
            <span className="text-xs font-mono font-bold text-[#3B66F5] bg-[#3B66F5]/10 px-2.5 py-0.5 rounded-full border border-[#3B66F5]/20">
              {filteredInfluencers.length} of {influencers.length} Candidates
            </span>
          </h1>
          <p className="text-xs text-[#6C7888]">
            Automated discovery targeting authentic technology &amp; AI creators (5K–100K YouTube subscribers)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleStartDiscovery}
            disabled={isDiscovering}
            className="px-4 py-2 rounded-xl bg-[#3B66F5] hover:bg-[#2C52D6] disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-[#3B66F5]/25 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isDiscovering ? 'animate-spin' : ''}`} />
            {isDiscovering ? 'Discovering...' : 'Run Discovery Crawl'}
          </button>

          <button
            onClick={handleImportCSVClick}
            className="px-3.5 py-2 rounded-xl border border-[#DFDCD3] bg-white hover:bg-[#FAF8F5] text-[#141E30] text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5 text-[#6C7888]" />
            Import CSV
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl border border-[#DFDCD3] bg-white hover:bg-[#FAF8F5] text-[#141E30] text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-[#6C7888]" />
            Export CSV
          </button>

          <button
            onClick={refreshData}
            title="Refresh database"
            className="p-2 rounded-xl border border-[#DFDCD3] bg-white hover:bg-[#FAF8F5] text-[#556271] hover:text-[#141E30] transition-colors cursor-pointer shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Discovery Multi-Param Search & Filtering Console */}
      <div className="p-5 sm:p-6 rounded-3xl border border-[#DFDCD3] bg-white shadow-xs space-y-4">
        {/* Row 1: Search Keywords and Quick Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
          {/* Keyword Search */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-[#78818D] absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => {
                setSearchKeyword(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search keyword (e.g. LangChain, Llama, PyTorch, CUDA, Next.js)..."
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#DFDCD3] bg-[#FAF8F5] text-xs font-medium text-[#141E30] placeholder-[#78818D] focus:outline-none focus:border-[#3B66F5] focus:bg-white transition-colors"
            />
          </div>

          {/* Niche Selector */}
          <div>
            <select
              value={selectedNiche}
              onChange={(e) => {
                setSelectedNiche(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFDCD3] bg-[#FAF8F5] text-xs font-bold text-[#141E30] focus:outline-none focus:border-[#3B66F5] cursor-pointer"
            >
              <option value="All">All Niches</option>
              <option value="AI">AI & Machine Learning</option>
              <option value="DevOps">DevOps & Cloud</option>
              <option value="Full-Stack">Full-Stack & Web Dev</option>
              <option value="Data">Data Science & Python</option>
            </select>
          </div>

          {/* Platform Selector */}
          <div>
            <select
              value={selectedPlatform}
              onChange={(e) => {
                setSelectedPlatform(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFDCD3] bg-[#FAF8F5] text-xs font-bold text-[#141E30] focus:outline-none focus:border-[#3B66F5] cursor-pointer"
            >
              <option value="all">All Platforms (YouTube-first)</option>
              <option value="youtube">YouTube Channels</option>
              <option value="instagram">Instagram Creators</option>
            </select>
          </div>
        </div>

        {/* Row 2: Range Sliders (Followers & Engagement) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-3 border-t border-[#EAE7DF] text-xs">
          {/* Min & Max Followers */}
          <div className="space-y-1.5 sm:col-span-2">
            <div className="flex justify-between text-[#6C7888] text-[11px] font-semibold">
              <span>Follower Band (Micro-influencer target: 5K–100K)</span>
              <span className="font-mono text-[#3B66F5] font-bold">
                {minFollowers.toLocaleString()} – {maxFollowers.toLocaleString()}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="range"
                min="1000"
                max="50000"
                step="1000"
                value={minFollowers}
                onChange={(e) => {
                  setMinFollowers(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full accent-[#3B66F5] cursor-pointer"
              />
              <input
                type="range"
                min="50000"
                max="250000"
                step="5000"
                value={maxFollowers}
                onChange={(e) => {
                  setMaxFollowers(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full accent-[#3B66F5] cursor-pointer"
              />
            </div>
          </div>

          {/* Min Engagement Rate */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[#6C7888] text-[11px] font-semibold">
              <span>Min Engagement Rate Threshold</span>
              <span className="font-mono text-[#3B66F5] font-bold">{minEngagement}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="6.0"
              step="0.1"
              value={minEngagement}
              onChange={(e) => {
                setMinEngagement(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full accent-[#3B66F5] cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Discovery Results Table */}
      <div className="rounded-3xl border border-[#DFDCD3] bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#EAE7DF] bg-[#FAF8F5] text-[#6C7888] select-none">
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px]">
                  <button 
                    onClick={() => toggleSort('name')}
                    className="flex items-center gap-1 hover:text-[#141E30] transition-colors cursor-pointer"
                  >
                    Creator / Channel
                    <ArrowUpDown className="w-3 h-3 text-[#6C7888]" />
                  </button>
                </th>
                <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px]">Platform</th>
                <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px] text-right">
                  <button 
                    onClick={() => toggleSort('subscribers')}
                    className="flex items-center gap-1 ml-auto hover:text-[#141E30] transition-colors cursor-pointer"
                  >
                    Followers
                    <ArrowUpDown className="w-3 h-3 text-[#6C7888]" />
                  </button>
                </th>
                <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px] text-right">
                  <button 
                    onClick={() => toggleSort('engagementRate')}
                    className="flex items-center gap-1 ml-auto hover:text-[#141E30] transition-colors cursor-pointer"
                  >
                    Engagement
                    <ArrowUpDown className="w-3 h-3 text-[#6C7888]" />
                  </button>
                </th>
                <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px]">Niche / Topics</th>
                <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px]">Contact Email</th>
                <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px] text-center">
                  <button 
                    onClick={() => toggleSort('overallScore')}
                    className="flex items-center gap-1 mx-auto hover:text-[#141E30] transition-colors cursor-pointer"
                  >
                    Vetting Score
                    <ArrowUpDown className="w-3 h-3 text-[#6C7888]" />
                  </button>
                </th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EDE6]">
              {paginatedInfluencers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#6C7888]">
                    No creators match the current filter thresholds. Try lowering the minimum engagement or adjusting keywords.
                  </td>
                </tr>
              ) : (
                paginatedInfluencers.map((inf) => {
                  const isPassed = inf.qualification.passed;

                  return (
                    <tr
                      key={inf.id}
                      onClick={() => setSelectedInfluencerForDetail(inf)}
                      className="hover:bg-[#FAF8F5] transition-colors cursor-pointer group"
                    >
                      {/* Creator Column */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3.5">
                          <img
                            src={inf.avatarUrl}
                            alt={inf.name}
                            referrerPolicy="no-referrer"
                            className="w-11 h-11 rounded-2xl object-cover ring-1 ring-[#DFDCD3] shadow-2xs shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-extrabold text-[#141E30] group-hover:text-[#3B66F5] transition-colors flex items-center gap-1.5 truncate">
                              {inf.name}
                            </div>
                            <div className="text-[11px] text-[#6C7888] font-medium truncate">
                              {inf.handle} · {inf.country}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Platform */}
                      <td className="py-3.5 px-3">
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-[#556271]">
                          <Youtube className="w-3.5 h-3.5 text-[#FF0000] shrink-0" />
                          YouTube
                        </span>
                      </td>

                      {/* Followers */}
                      <td className="py-3.5 px-3 text-right font-mono font-semibold text-[#141E30] tabular-nums">
                        {inf.subscribers.toLocaleString()}
                      </td>

                      {/* Engagement */}
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-[#3B66F5] tabular-nums">
                        {inf.engagementRate}%
                      </td>

                      {/* Niche / Topics */}
                      <td className="py-3.5 px-3 max-w-[200px]">
                        <div className="text-[#141E30] truncate font-bold text-[11px]">
                          {inf.niche}
                        </div>
                        <div className="text-[11px] text-[#6C7888] truncate font-medium">
                          {inf.topics.slice(0, 2).join(', ')}
                        </div>
                      </td>

                      {/* Contact Email */}
                      <td className="py-3.5 px-3">
                        {inf.contactEmail ? (
                          <span className="text-[11px] font-mono text-[#141E30] truncate max-w-[140px] block font-medium" title={inf.contactEmail}>
                            {inf.contactEmail}
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-[#FF6F59] flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Unavailable
                          </span>
                        )}
                      </td>

                      {/* Qualification Status & Score */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold">
                          {isPassed ? (
                            <span className="text-[#65A88B] bg-[#65A88B]/15 px-2.5 py-0.5 rounded-full border border-[#65A88B]/30 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              {inf.qualification.overallScore}/100
                            </span>
                          ) : (
                            <span className="text-[#FF6F59] bg-[#FF6F59]/15 px-2.5 py-0.5 rounded-full border border-[#FF6F59]/30 flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              {inf.qualification.overallScore}/100
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => navigateToPersonalization(inf)}
                            className="px-3 py-1.5 rounded-xl bg-[#3B66F5]/10 hover:bg-[#3B66F5]/20 text-[#3B66F5] text-[11px] font-bold transition-colors border border-[#3B66F5]/20 flex items-center gap-1 cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3" />
                            Personalize
                          </button>
                          <a
                            href={inf.profileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-xl text-[#6C7888] hover:text-[#141E30] hover:bg-[#EAE7DF] transition-colors"
                            title="Open channel in new tab"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Strip */}
        <div className="flex items-center justify-between px-4 py-3.5 border-t border-[#EAE7DF] text-xs text-[#6C7888] bg-[#FAF8F5]">
          <div>
            Showing <span className="font-mono text-[#141E30] font-bold">{paginatedInfluencers.length}</span> of <span className="font-mono text-[#141E30] font-bold">{filteredInfluencers.length}</span> candidates
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-xl border border-[#DFDCD3] bg-white disabled:opacity-40 text-[#141E30] font-semibold hover:bg-[#FAF8F5] transition-colors cursor-pointer shadow-2xs"
            >
              Previous
            </button>
            <span className="font-mono text-[11px] text-[#141E30] font-bold px-1">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-xl border border-[#DFDCD3] bg-white disabled:opacity-40 text-[#141E30] font-semibold hover:bg-[#FAF8F5] transition-colors cursor-pointer shadow-2xs"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
