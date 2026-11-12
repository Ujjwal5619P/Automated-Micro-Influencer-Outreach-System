import React, { useState, useEffect, useRef } from 'react';
import { Search, X, User, Target, Send, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const GlobalSearchModal: React.FC = () => {
  const { 
    isSearchModalOpen, 
    setIsSearchModalOpen, 
    influencers, 
    campaigns, 
    setSelectedInfluencerForDetail, 
    setCurrentView,
    setActiveCampaignId
  } = useApp();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchModalOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isSearchModalOpen]);

  if (!isSearchModalOpen) return null;

  const filteredInfluencers = query.trim() === '' ? [] : influencers.filter(i => 
    i.name.toLowerCase().includes(query.toLowerCase()) ||
    i.handle.toLowerCase().includes(query.toLowerCase()) ||
    i.topics.some(t => t.toLowerCase().includes(query.toLowerCase())) ||
    i.niche.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const filteredCampaigns = query.trim() === '' ? [] : campaigns.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.targetNiche.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-[#18243A]/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl rounded-2xl border border-[#DFDCD3] bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#EAE7DF] gap-3 bg-[#FAF8F5]">
          <Search className="w-5 h-5 text-[#4169E1] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search micro-influencers by name, topic (e.g. LangGraph, CUDA), or campaign..."
            className="flex-1 bg-transparent border-0 text-sm text-[#202A38] placeholder-[#78818D] font-medium focus:outline-none"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="text-[#78818D] hover:text-[#202A38] p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={() => setIsSearchModalOpen(false)}
            className="text-xs font-mono font-bold px-2 py-1 rounded-md bg-[#E8E5DC] text-[#5A6675] hover:text-[#202A38] cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {query.trim() === '' ? (
            <div className="py-8 text-center text-xs text-[#78818D]">
              Type keywords like <span className="text-[#4169E1] font-semibold">"AI"</span>, <span className="text-[#4169E1] font-semibold">"Priya"</span>, <span className="text-[#4169E1] font-semibold">"LangChain"</span>, or <span className="text-[#4169E1] font-semibold">"Agent"</span>
            </div>
          ) : (
            <>
              {filteredInfluencers.length > 0 && (
                <div>
                  <div className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#78818D]">
                    Micro-Influencers ({filteredInfluencers.length})
                  </div>
                  <div className="space-y-1">
                    {filteredInfluencers.map((inf) => (
                      <button
                        key={inf.id}
                        onClick={() => {
                          setSelectedInfluencerForDetail(inf);
                          setIsSearchModalOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F7F5F0] transition-colors text-left group cursor-pointer border border-transparent hover:border-[#E2DFD6]"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={inf.avatarUrl}
                            alt={inf.name}
                            referrerPolicy="no-referrer"
                            className="w-9 h-9 rounded-xl object-cover ring-1 ring-[#D5D2C7]"
                          />
                          <div>
                            <div className="text-xs font-bold text-[#18243A] group-hover:text-[#4169E1] transition-colors">
                              {inf.name} <span className="text-[11px] font-medium text-[#78818D]">{inf.handle}</span>
                            </div>
                            <div className="text-[11px] text-[#78818D] flex items-center gap-2 mt-0.5">
                              <span className="font-mono">{inf.subscribers.toLocaleString()} subs</span>
                              <span>·</span>
                              <span className="font-mono">{inf.engagementRate}% eng</span>
                              <span>·</span>
                              <span>{inf.niche}</span>
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#78818D] group-hover:text-[#4169E1] transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {filteredCampaigns.length > 0 && (
                <div>
                  <div className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#78818D]">
                    Campaigns ({filteredCampaigns.length})
                  </div>
                  <div className="space-y-1">
                    {filteredCampaigns.map((camp) => (
                      <button
                        key={camp.id}
                        onClick={() => {
                          setActiveCampaignId(camp.id);
                          setIsSearchModalOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F7F5F0] transition-colors text-left group cursor-pointer border border-transparent hover:border-[#E2DFD6]"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#4169E1]/10 flex items-center justify-center text-[#4169E1]">
                            <Target className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[#18243A] group-hover:text-[#4169E1]">
                              {camp.name}
                            </div>
                            <div className="text-[11px] text-[#78818D]">
                              {camp.targetNiche} · {camp.targetGeography}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#78818D] group-hover:text-[#4169E1]" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {filteredInfluencers.length === 0 && filteredCampaigns.length === 0 && (
                <div className="py-8 text-center text-xs text-[#78818D]">
                  No matching influencers or campaigns found for "{query}".
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
