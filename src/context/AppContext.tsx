import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Influencer, 
  Campaign, 
  OutreachLog, 
  FilterCriteria, 
  ViewType 
} from '../types';
import { 
  influenceApi, 
  getActiveApiProvider, 
  setActiveApiProvider, 
  ApiProvider 
} from '../services/api';
import { DEFAULT_FILTER_CRITERIA, SEED_CAMPAIGNS } from '../data/seedData';

interface ToastInfo {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface AppContextType {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  influencers: Influencer[];
  setInfluencers: React.Dispatch<React.SetStateAction<Influencer[]>>;
  campaigns: Campaign[];
  activeCampaign: Campaign | null;
  setActiveCampaignId: (id: string) => void;
  createCampaign: (data: Omit<Campaign, 'id' | 'createdAt'>) => Promise<Campaign>;
  updateCampaign: (id: string, data: Partial<Campaign>) => Promise<Campaign>;
  deleteCampaign: (id: string) => Promise<void>;
  filterCriteria: FilterCriteria;
  updateFilterCriteria: (updates: Partial<FilterCriteria>) => void;
  applyFiltering: () => Promise<void>;
  outreachLogs: OutreachLog[];
  simulateOutreach: (influencerId: string, type: 'email' | 'instagram_dm', subject?: string, body?: string) => Promise<OutreachLog>;
  updateOutreachStatus: (logId: string, status: OutreachLog['status']) => Promise<void>;
  selectedInfluencerForDetail: Influencer | null;
  setSelectedInfluencerForDetail: (inf: Influencer | null) => void;
  selectedInfluencerForAI: Influencer | null;
  setSelectedInfluencerForAI: (inf: Influencer | null) => void;
  navigateToPersonalization: (inf: Influencer) => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  isDarkTheme: boolean;
  toggleTheme: () => void;
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (open: boolean) => void;
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  markNotificationsAsRead: () => void;
  toasts: ToastInfo[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
  apiProvider: ApiProvider;
  setApiProvider: (p: ApiProvider) => void;
  resetAllData: () => Promise<void>;
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>(SEED_CAMPAIGNS);
  const [activeCampaignId, setActiveCampaignIdState] = useState<string>('camp-tech-ai-in');
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>(DEFAULT_FILTER_CRITERIA);
  const [outreachLogs, setOutreachLogs] = useState<OutreachLog[]>([]);
  const [selectedInfluencerForDetail, setSelectedInfluencerForDetail] = useState<Influencer | null>(null);
  const [selectedInfluencerForAI, setSelectedInfluencerForAI] = useState<Influencer | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiProvider, setApiProviderState] = useState<ApiProvider>(getActiveApiProvider());
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'Outreach Replied',
      message: 'Aakash Verma replied with interest in reviewing AgentScale AI.',
      time: '2h ago',
      read: false,
    },
    {
      id: 'notif-2',
      title: 'Filter Passed',
      message: '12 out of 16 creators passed your micro-influencer qualification thresholds.',
      time: '1d ago',
      read: false,
    },
    {
      id: 'notif-3',
      title: 'Campaign Active',
      message: 'Default campaign "Indian Tech & AI Micro-Influencers" is initialized.',
      time: '2d ago',
      read: true,
    },
  ]);

  // Load each resource independently. A campaigns/outreach endpoint failure must
  // never prevent the creator database from refreshing after a discovery run.
  const refreshData = async () => {
    setIsLoading(true);
    const [influencersResult, campaignsResult, outreachResult] = await Promise.allSettled([
      influenceApi.getInfluencers(),
      influenceApi.getCampaigns(),
      influenceApi.getOutreachLogs(),
    ]);

    if (influencersResult.status === 'fulfilled') {
      setInfluencers(influencersResult.value);
    } else {
      console.error('Failed to refresh influencer database:', influencersResult.reason);
      showToast(influencersResult.reason instanceof Error ? `Creator database refresh failed: ${influencersResult.reason.message}` : 'Creator database refresh failed', 'error');
    }

    if (campaignsResult.status === 'fulfilled' && campaignsResult.value.length > 0) {
      setCampaigns(campaignsResult.value);
      if (!campaignsResult.value.some(c => c.id === activeCampaignId)) {
        setActiveCampaignIdState(campaignsResult.value[0].id);
      }
    } else if (campaignsResult.status === 'rejected') {
      console.warn('Campaigns endpoint unavailable; using the local default campaign context:', campaignsResult.reason);
      setCampaigns(SEED_CAMPAIGNS);
    } else {
      setCampaigns(SEED_CAMPAIGNS);
    }

    if (outreachResult.status === 'fulfilled') {
      setOutreachLogs(outreachResult.value);
    } else {
      console.warn('Outreach history could not be refreshed:', outreachResult.reason);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Sync dark class to html document
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkTheme) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, [isDarkTheme]);

  // Keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const toggleSidebar = () => setIsSidebarCollapsed(prev => !prev);
  const toggleTheme = () => setIsDarkTheme(prev => !prev);

  const activeCampaign = campaigns.find(c => c.id === activeCampaignId) || campaigns[0] || null;

  const setActiveCampaignId = (id: string) => {
    setActiveCampaignIdState(id);
    const camp = campaigns.find(c => c.id === id);
    if (camp) {
      showToast(`Switched active campaign to "${camp.name}"`, 'info');
    }
  };

  const createCampaign = async (data: Omit<Campaign, 'id' | 'createdAt'>) => {
    try {
      const created = await influenceApi.createCampaign(data);
      setCampaigns(prev => [created, ...prev.filter(c => c.id !== created.id)]);
      setActiveCampaignIdState(created.id);
      showToast(`Campaign "${created.name}" created successfully`, 'success');
      return created;
    } catch (err) {
      console.error('Campaign creation failed:', err);
      showToast(err instanceof Error ? `Campaign could not be saved: ${err.message}` : 'Campaign could not be saved. Check that the backend is running.', 'error');
      throw err;
    }
  };

  const updateCampaign = async (id: string, data: Partial<Campaign>) => {
    try {
      const updated = await influenceApi.updateCampaign(id, data);
      setCampaigns(prev => prev.map(c => c.id === id ? updated : c));
      showToast('Campaign updated', 'success');
      return updated;
    } catch (err) {
      console.error('Campaign update failed:', err);
      showToast(err instanceof Error ? `Campaign update failed: ${err.message}` : 'Campaign update failed.', 'error');
      throw err;
    }
  };

  const deleteCampaign = async (id: string) => {
    try {
      await influenceApi.deleteCampaign(id);
      setCampaigns(prev => prev.filter(c => c.id !== id));
      if (activeCampaignId === id) {
        const remaining = campaigns.filter(c => c.id !== id);
        if (remaining.length > 0) setActiveCampaignIdState(remaining[0].id);
      }
      showToast('Campaign deleted', 'info');
    } catch (err) {
      console.error('Campaign deletion failed:', err);
      showToast(err instanceof Error ? `Campaign deletion failed: ${err.message}` : 'Campaign deletion failed.', 'error');
      throw err;
    }
  };

  const updateFilterCriteria = (updates: Partial<FilterCriteria>) => {
    setFilterCriteria(prev => ({ ...prev, ...updates }));
  };

  const applyFiltering = async () => {
    setIsLoading(true);
    try {
      const { updatedInfluencers, passed, failed } = await influenceApi.runFiltering(filterCriteria);
      setInfluencers(updatedInfluencers);
      showToast(`Smart filtering applied: ${passed.length} qualified, ${failed.length} rejected`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Error executing smart filtering', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const simulateOutreach = async (
    influencerId: string, 
    type: 'email' | 'instagram_dm', 
    subject?: string, 
    body: string = ''
  ) => {
    const log = await influenceApi.simulateOutreach({
      influencerId,
      campaignId: activeCampaign?.id || 'camp-tech-ai-in',
      messageType: type,
      subject,
      body,
    });
    setOutreachLogs(prev => [log, ...prev]);
    showToast(`Outreach simulated for ${log.influencerName}`, 'success');
    return log;
  };

  const updateOutreachStatus = async (logId: string, status: OutreachLog['status']) => {
    const updated = await influenceApi.updateOutreachStatus(logId, status);
    setOutreachLogs(prev => prev.map(l => l.id === logId ? updated : l));
    showToast(`Outreach status updated to ${status}`, 'info');
  };

  const navigateToPersonalization = (inf: Influencer) => {
    setSelectedInfluencerForAI(inf);
    setCurrentView('personalization');
  };

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  const setApiProvider = (p: ApiProvider) => {
    setActiveApiProvider(p);
    setApiProviderState(p);
    showToast(`API Service Provider set to ${p === 'fastapi' ? 'Python FastAPI' : 'Mock Repository'}`, 'info');
  };

  const resetAllData = async () => {
    influenceApi.resetDemoData();
    await refreshData();
    setFilterCriteria(DEFAULT_FILTER_CRITERIA);
    showToast('Demo data reset to clean initial state', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        influencers,
        setInfluencers,
        campaigns,
        activeCampaign,
        setActiveCampaignId,
        createCampaign,
        updateCampaign,
        deleteCampaign,
        filterCriteria,
        updateFilterCriteria,
        applyFiltering,
        outreachLogs,
        simulateOutreach,
        updateOutreachStatus,
        selectedInfluencerForDetail,
        setSelectedInfluencerForDetail,
        selectedInfluencerForAI,
        setSelectedInfluencerForAI,
        navigateToPersonalization,
        isSidebarCollapsed,
        toggleSidebar,
        isDarkTheme,
        toggleTheme,
        isSearchModalOpen,
        setIsSearchModalOpen,
        notifications,
        unreadNotificationCount,
        markNotificationsAsRead,
        toasts,
        showToast,
        removeToast,
        apiProvider,
        setApiProvider,
        resetAllData,
        isLoading,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
