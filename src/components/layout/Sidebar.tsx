import React from 'react';
import { 
  LayoutDashboard, 
  Search, 
  Database, 
  SlidersHorizontal, 
  UserCheck, 
  Sparkles, 
  Send, 
  ListOrdered, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Flame,
  CheckCircle2,
  Clock,
  Compass,
  Radio
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ViewType } from '../../types';

interface NavItem {
  id: ViewType;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeTone?: 'blue' | 'coral' | 'mint' | 'amber';
  indicatorColor?: 'blue' | 'coral';
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const { 
    currentView, 
    setCurrentView, 
    isSidebarCollapsed, 
    toggleSidebar,
    influencers,
    outreachLogs
  } = useApp();

  const qualifiedCount = influencers.filter(i => i.qualification.passed).length;
  const pendingOutreachCount = outreachLogs.filter(l => l.status === 'pending_approval' || l.status === 'draft').length;

  const sections: NavSection[] = [
    {
      title: 'Discovery & Pipeline',
      items: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard, indicatorColor: 'blue' },
        { id: 'discover', label: 'Discover Creators', icon: Search, indicatorColor: 'blue' },
        { id: 'database', label: 'Creator CRM', icon: Database, badge: influencers.length, badgeTone: 'blue', indicatorColor: 'blue' },
        { id: 'filter', label: 'Smart Vetting', icon: SlidersHorizontal, badge: `${qualifiedCount} Qual`, badgeTone: 'mint', indicatorColor: 'blue' },
        { id: 'enrichment', label: 'Profile Enrichment', icon: UserCheck, indicatorColor: 'blue' },
      ],
    },
    {
      title: 'AI & Outreach Studio',
      items: [
        { id: 'personalization', label: 'AI Personalization', icon: Sparkles, badge: 'Gemini', badgeTone: 'coral', indicatorColor: 'coral' },
        { id: 'outreach', label: 'Outreach Center', icon: Send, badge: pendingOutreachCount > 0 ? pendingOutreachCount : undefined, badgeTone: 'amber', indicatorColor: 'coral' },
        { id: 'tracker', label: 'Outreach Tracker', icon: ListOrdered, indicatorColor: 'blue' },
      ],
    },
    {
      title: 'Intelligence & Ops',
      items: [
        { id: 'analytics', label: 'Analytics', icon: BarChart3, indicatorColor: 'blue' },
        { id: 'settings', label: 'Settings', icon: Settings, indicatorColor: 'blue' },
      ],
    },
  ];

  return (
    <aside 
      className={`relative flex flex-col border-r transition-all duration-300 ease-in-out shrink-0 select-none z-30 ${
        isSidebarCollapsed ? 'w-18' : 'w-64'
      } bg-[#121A2A] border-[#1E2B40] text-[#9BA8BA]`}
    >
      {/* Brand Header with Bespoke Editorial Mark */}
      <div className="flex items-center justify-between h-17 px-4 border-b border-[#1E2B40] bg-[#0E1522]">
        {!isSidebarCollapsed ? (
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Custom geometric logo mark */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1C2C47] to-[#121C2F] border border-[#2D4163] flex items-center justify-center text-white shadow-sm shrink-0 relative group">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-[#3B66F5] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF6F59]" />
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-white font-sans">
                  Influence<span className="text-[#3B66F5]">AI</span>
                </span>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#FF805D] bg-[#FF805D]/10 px-1.5 py-0.2 rounded border border-[#FF805D]/25">
                  2026
                </span>
              </div>
              <span className="text-[10px] text-[#6E7F96] tracking-tight truncate">
                Creator Intelligence &amp; Outreach
              </span>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-9 h-9 rounded-xl bg-gradient-to-br from-[#1C2C47] to-[#121C2F] border border-[#2D4163] flex items-center justify-center text-white shadow-sm">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-[#3B66F5] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FF6F59]" />
            </div>
          </div>
        )}

        <button
          onClick={toggleSidebar}
          aria-label={isSidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'}
          className="p-1.5 rounded-lg text-[#6E7F96] hover:text-white hover:bg-[#1B273C] transition-colors cursor-pointer"
        >
          {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-3 py-3 space-y-5 overflow-y-auto">
        {sections.map((section, sIdx) => (
          <div key={section.title} className="space-y-1">
            {!isSidebarCollapsed && (
              <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-[#5E6F84]">
                {section.title}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;

                const getBadgeStyle = () => {
                  if (item.badgeTone === 'coral') return 'bg-[#FF6F59]/15 text-[#FF805D] border border-[#FF6F59]/25';
                  if (item.badgeTone === 'mint') return 'bg-[#65A88B]/15 text-[#65A88B] border border-[#65A88B]/25';
                  if (item.badgeTone === 'amber') return 'bg-[#E9B85B]/15 text-[#E9B85B] border border-[#E9B85B]/25';
                  return 'bg-[#3B66F5]/15 text-[#7090FF] border border-[#3B66F5]/25';
                };

                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    title={isSidebarCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-xs rounded-xl transition-all duration-150 cursor-pointer text-left group relative ${
                      isActive
                        ? 'bg-[#1A263A] text-white font-bold border-l-3 ' + (item.indicatorColor === 'coral' ? 'border-[#FF6F59]' : 'border-[#3B66F5]')
                        : 'text-[#9BA8BA] hover:text-white hover:bg-[#172234] font-medium border-l-3 border-transparent'
                    } ${isSidebarCollapsed ? 'justify-center px-0 border-l-0' : ''}`}
                  >
                    <Icon 
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive 
                          ? (item.indicatorColor === 'coral' ? 'text-[#FF805D]' : 'text-[#3B66F5]')
                          : 'text-[#6E7F96] group-hover:text-white'
                      }`} 
                    />
                    {!isSidebarCollapsed && (
                      <div className="flex-1 flex items-center justify-between truncate">
                        <span className="truncate">{item.label}</span>
                        {item.badge !== undefined && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold tracking-tight ${getBadgeStyle()}`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Backend Indicator */}
      {!isSidebarCollapsed && (
        <div className="p-3 mx-3 mb-3.5 rounded-xl border border-[#1E2B40] bg-[#0E1522]/90 text-xs">
          <div className="flex items-center justify-between text-white text-[11px] font-bold mb-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#65A88B] animate-pulse" />
              FastAPI Ready
            </span>
            <span className="text-[10px] font-mono text-[#6E7F96]">v1.0</span>
          </div>
          <p className="text-[10px] text-[#718298] leading-relaxed">
            REST &amp; PostgreSQL service layer abstracted for Python backend.
          </p>
        </div>
      )}
    </aside>
  );
};
