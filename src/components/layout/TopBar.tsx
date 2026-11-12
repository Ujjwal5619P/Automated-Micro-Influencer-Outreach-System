import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  ChevronDown, 
  Check, 
  Plus, 
  Sparkles,
  ExternalLink,
  ShieldCheck,
  User,
  Sliders,
  FolderDot
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const TopBar: React.FC = () => {
  const { 
    campaigns, 
    activeCampaign, 
    setActiveCampaignId, 
    setCurrentView,
    notifications,
    unreadNotificationCount,
    markNotificationsAsRead,
    setIsSearchModalOpen,
  } = useApp();

  const [isCampaignDropdownOpen, setIsCampaignDropdownOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);

  const campaignRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (campaignRef.current && !campaignRef.current.contains(e.target as Node)) {
        setIsCampaignDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-17 px-6 flex items-center justify-between border-b border-[#E6E3DA] bg-white sticky top-0 z-20 gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      {/* Left Zone: Campaign Selector & Context */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="relative" ref={campaignRef}>
          <button
            onClick={() => setIsCampaignDropdownOpen(prev => !prev)}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-[#DFDCD3] bg-[#FAF8F5] hover:bg-[#F2EFE8] text-xs text-[#141E30] transition-all cursor-pointer font-bold max-w-[320px] shadow-2xs"
          >
            <FolderDot className="w-3.5 h-3.5 text-[#3B66F5] shrink-0" />
            <span className="truncate">
              {activeCampaign ? activeCampaign.name : 'Select Campaign'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#6C7888] shrink-0 ml-1" />
          </button>

          {isCampaignDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-80 rounded-2xl border border-[#E2DFD6] bg-white shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 text-[10px] font-bold text-[#6C7888] uppercase tracking-wider border-b border-[#F0EDE6]">
                Campaign Workspace
              </div>
              <div className="max-h-64 overflow-y-auto py-1">
                {campaigns.map((camp) => (
                  <button
                    key={camp.id}
                    onClick={() => {
                      setActiveCampaignId(camp.id);
                      setIsCampaignDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-[#141E30] hover:bg-[#FAF8F5] transition-colors text-left cursor-pointer"
                  >
                    <div className="truncate mr-2">
                      <div className="font-bold text-[#141E30] truncate">{camp.name}</div>
                      <div className="text-[11px] text-[#6C7888] truncate">{camp.targetNiche} · {camp.targetGeography}</div>
                    </div>
                    {activeCampaign?.id === camp.id && (
                      <Check className="w-4 h-4 text-[#3B66F5] shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Middle Zone: Global Search Bar */}
      <div className="flex-1 max-w-md mx-2">
        <button
          onClick={() => setIsSearchModalOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl border border-[#DFDCD3] bg-[#FAF8F5] hover:bg-[#F0EDE6] text-[#6C7888] hover:text-[#141E30] text-xs transition-colors cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center gap-2.5 truncate">
            <Search className="w-3.5 h-3.5 text-[#6C7888] group-hover:text-[#3B66F5] transition-colors" />
            <span className="truncate font-medium">Search creators, channels, topics, or campaigns...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-bold text-[#556271] bg-white rounded-md border border-[#D5D2C7] shadow-2xs">
            <span>⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Right Zone: Notifications & Profile */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setIsNotifDropdownOpen(prev => !prev);
              if (!isNotifDropdownOpen) markNotificationsAsRead();
            }}
            aria-label="Notifications"
            className="p-2 rounded-xl text-[#556271] hover:text-[#141E30] hover:bg-[#FAF8F5] border border-[#DFDCD3] transition-colors relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#FF6F59] ring-2 ring-white" />
            )}
          </button>

          {isNotifDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-[#E2DFD6] bg-white shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-3 py-2 border-b border-[#F0EDE6]">
                <span className="text-xs font-bold text-[#141E30]">Outreach Notifications</span>
                <span className="text-[10px] text-[#3B66F5] font-mono font-bold bg-[#3B66F5]/10 px-2 py-0.5 rounded-full">Active Events</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-[#F0EDE6] py-1">
                {notifications.map((n) => (
                  <div key={n.id} className="p-2.5 hover:bg-[#FAF8F5] rounded-xl transition-colors">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-bold text-[#141E30]">{n.title}</span>
                      <span className="text-[10px] text-[#6C7888]">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-[#556271] leading-relaxed">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-[#E6E3DA]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#121A2A] to-[#3B66F5] flex items-center justify-center text-white text-xs font-extrabold shadow-sm ring-2 ring-[#3B66F5]/20">
            AI
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-bold text-[#141E30] leading-tight">AI Engineer</span>
            <span className="text-[10px] text-[#6C7888] font-medium leading-tight">Internship Evaluator</span>
          </div>
        </div>
      </div>
    </header>
  );
};
