/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';
import { InfluencerDrawer } from './components/common/InfluencerDrawer';
import { ToastContainer } from './components/common/ToastContainer';

// All 11 Views
import { OverviewView } from './components/views/OverviewView';
import { DiscoverView } from './components/views/DiscoverView';
import { DatabaseView } from './components/views/DatabaseView';
import { SmartFilteringView } from './components/views/SmartFilteringView';
import { ProfileEnrichmentView } from './components/views/ProfileEnrichmentView';
import { AIPersonalizationView } from './components/views/AIPersonalizationView';
import { OutreachCenterView } from './components/views/OutreachCenterView';
import { OutreachTrackerView } from './components/views/OutreachTrackerView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { SettingsView } from './components/views/SettingsView';

const MainContent: React.FC = () => {
  const { currentView } = useApp();

  const renderView = () => {
    switch (currentView) {
      case 'overview':
        return <OverviewView />;
      case 'discover':
        return <DiscoverView />;
      case 'database':
        return <DatabaseView />;
      case 'filter':
        return <SmartFilteringView />;
      case 'enrichment':
        return <ProfileEnrichmentView />;
      case 'personalization':
        return <AIPersonalizationView />;
      case 'outreach':
        return <OutreachCenterView />;
      case 'tracker':
        return <OutreachTrackerView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'settings':
        return <SettingsView />;
      case 'campaigns':
        return <OverviewView />;
      default:
        return <OverviewView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F7F5F0] text-[#202A38] font-sans">
      {/* Left Collapsible Navigation Sidebar in #18243A Midnight Navy */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#F7F5F0]">
        {/* Top Navigation Bar */}
        <TopBar />

        {/* Viewport View Container */}
        <main className="flex-1 overflow-y-auto px-6 py-6 max-w-7xl w-full mx-auto">
          {renderView()}
        </main>
      </div>

      {/* Modals & Overlays */}
      <InfluencerDrawer />
      <GlobalSearchModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
