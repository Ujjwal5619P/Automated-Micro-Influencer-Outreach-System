import React, { useState } from 'react';
import { 
  Settings, 
  Server, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Code2, 
  ShieldCheck, 
  Cpu, 
  ExternalLink,
  Terminal
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SettingsView: React.FC = () => {
  const { 
    apiProvider, 
    setApiProvider, 
    resetAllData, 
    influencers, 
    campaigns, 
    outreachLogs, 
    showToast 
  } = useApp();

  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'connected' | 'fallback'>('idle');

  const handleTestBackendConnection = async () => {
    setTestStatus('testing');
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        setTestStatus('connected');
        showToast('Connected to local full-stack server proxy successfully', 'success');
      } else {
        setTestStatus('fallback');
        showToast('External server not running; using reliable in-browser repository', 'info');
      }
    } catch (err) {
      setTestStatus('fallback');
      showToast('Mock service active with local persistence', 'info');
    }
  };

  const handleExportFullJSON = () => {
    const data = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      influencers,
      campaigns,
      outreachLogs,
    };
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', jsonStr);
    link.setAttribute('download', `influenceai_export_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported complete database JSON', 'success');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-[#18243A] font-sans flex items-center gap-2">
          Platform Architecture &amp; Settings
          <span className="text-xs font-mono font-bold text-[#4169E1] bg-[#4169E1]/10 px-2 py-0.5 rounded-md">
            FastAPI Target
          </span>
        </h1>
        <p className="text-xs text-[#78818D]">
          Configure backend API endpoints, inspect service abstraction contracts, and manage state
        </p>
      </div>

      {/* Backend Integration Target Card */}
      <div className="p-6 rounded-2xl border border-[#DFDCD3] bg-white shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#EAE7DF]">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#DFDCD3] flex items-center justify-center text-[#4169E1]">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#18243A]">
                Python FastAPI REST Backend Integration
              </h3>
              <p className="text-xs text-[#78818D]">
                Independent frontend architecture ready for downstream Python/FastAPI/PostgreSQL target
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestBackendConnection}
              disabled={testStatus === 'testing'}
              className="px-3.5 py-2 rounded-xl border border-[#DFDCD3] bg-white hover:bg-[#F7F5F0] text-[#18243A] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Cpu className="w-3.5 h-3.5 text-[#4169E1]" />
              {testStatus === 'testing' ? 'Testing...' : 'Test Server Connection'}
            </button>
          </div>
        </div>

        {/* Status Callout */}
        {testStatus === 'connected' && (
          <div className="p-3.5 rounded-xl bg-[#65A88B]/15 border border-[#65A88B]/30 text-xs text-[#2E6A51] font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#65A88B] shrink-0" />
            Full-stack server responded OK. Server-side Gemini AI generation is operational.
          </div>
        )}

        {testStatus === 'fallback' && (
          <div className="p-3.5 rounded-xl bg-[#4169E1]/10 border border-[#4169E1]/20 text-xs text-[#2044A8] font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#4169E1] shrink-0" />
            Mock Service Provider active with persistent browser LocalStorage.
          </div>
        )}

        {/* Configuration Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
          <div className="p-4 rounded-xl border border-[#EAE7DF] bg-[#FAF8F5] space-y-1">
            <span className="text-[10px] text-[#78818D] font-bold uppercase block">FastAPI Base Endpoint</span>
            <span className="font-mono text-[#4169E1] font-bold text-xs block">
              VITE_API_BASE_URL = http://localhost:8000/api/v1
            </span>
            <p className="text-[11px] text-[#78818D] mt-1">
              Consumed by <code className="text-[#18243A] font-bold">FastAPIServiceClient</code> in <code className="text-[#18243A] font-bold">src/services/api.ts</code>.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[#EAE7DF] bg-[#FAF8F5] space-y-1">
            <span className="text-[10px] text-[#78818D] font-bold uppercase block">Active Service Layer Mode</span>
            <div className="flex items-center gap-2 pt-1.5">
              <button
                onClick={() => setApiProvider('mock')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                  apiProvider === 'mock' 
                    ? 'bg-[#4169E1] text-white shadow-xs' 
                    : 'bg-white text-[#78818D] border border-[#DFDCD3] hover:text-[#18243A]'
                }`}
              >
                In-Memory / LocalStorage Mock
              </button>
              <button
                onClick={() => setApiProvider('fastapi')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                  apiProvider === 'fastapi' 
                    ? 'bg-[#4169E1] text-white shadow-xs' 
                    : 'bg-white text-[#78818D] border border-[#DFDCD3] hover:text-[#18243A]'
                }`}
              >
                Live FastAPI Backend
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Planned FastAPI Endpoints Contract */}
      <div className="p-6 rounded-2xl border border-[#DFDCD3] bg-white shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-[#4169E1]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#18243A]">
            FastAPI REST API Contract Specification
          </h3>
        </div>
        <p className="text-xs text-[#78818D] leading-relaxed">
          The InfluenceAI frontend service layer strictly mirrors these 10 REST endpoints to ensure seamless backend drop-in:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-3 rounded-xl border border-[#EAE7DF] bg-[#FAF8F5] flex items-center justify-between">
            <span className="text-[#65A88B] font-bold">GET</span>
            <span className="text-[#18243A] font-semibold">/api/v1/influencers</span>
            <span className="text-[#78818D] text-[10px] font-sans">Creator catalog</span>
          </div>
          <div className="p-3 rounded-xl border border-[#EAE7DF] bg-[#FAF8F5] flex items-center justify-between">
            <span className="text-[#4169E1] font-bold">POST</span>
            <span className="text-[#18243A] font-semibold">/api/v1/discovery/run</span>
            <span className="text-[#78818D] text-[10px] font-sans">Query YouTube API</span>
          </div>
          <div className="p-3 rounded-xl border border-[#EAE7DF] bg-[#FAF8F5] flex items-center justify-between">
            <span className="text-[#4169E1] font-bold">POST</span>
            <span className="text-[#18243A] font-semibold">/api/v1/filter/run</span>
            <span className="text-[#78818D] text-[10px] font-sans">Apply 4-gate criteria</span>
          </div>
          <div className="p-3 rounded-xl border border-[#EAE7DF] bg-[#FAF8F5] flex items-center justify-between">
            <span className="text-[#4169E1] font-bold">POST</span>
            <span className="text-[#18243A] font-semibold">/api/v1/enrichment/run</span>
            <span className="text-[#78818D] text-[10px] font-sans">Fetch demographics</span>
          </div>
          <div className="p-3 rounded-xl border border-[#EAE7DF] bg-[#FAF8F5] flex items-center justify-between">
            <span className="text-[#4169E1] font-bold">POST</span>
            <span className="text-[#18243A] font-semibold">/api/v1/messages/generate</span>
            <span className="text-[#78818D] text-[10px] font-sans">LLM message synthesis</span>
          </div>
          <div className="p-3 rounded-xl border border-[#EAE7DF] bg-[#FAF8F5] flex items-center justify-between">
            <span className="text-[#65A88B] font-bold">GET</span>
            <span className="text-[#18243A] font-semibold">/api/v1/campaigns</span>
            <span className="text-[#78818D] text-[10px] font-sans">Fetch campaign list</span>
          </div>
          <div className="p-3 rounded-xl border border-[#EAE7DF] bg-[#FAF8F5] flex items-center justify-between">
            <span className="text-[#4169E1] font-bold">POST</span>
            <span className="text-[#18243A] font-semibold">/api/v1/campaigns</span>
            <span className="text-[#78818D] text-[10px] font-sans">Create campaign</span>
          </div>
          <div className="p-3 rounded-xl border border-[#EAE7DF] bg-[#FAF8F5] flex items-center justify-between">
            <span className="text-[#65A88B] font-bold">GET</span>
            <span className="text-[#18243A] font-semibold">/api/v1/outreach</span>
            <span className="text-[#78818D] text-[10px] font-sans">Fetch tracking logs</span>
          </div>
          <div className="p-3 rounded-xl border border-[#EAE7DF] bg-[#FAF8F5] flex items-center justify-between">
            <span className="text-[#4169E1] font-bold">POST</span>
            <span className="text-[#18243A] font-semibold">/api/v1/outreach/simulate</span>
            <span className="text-[#78818D] text-[10px] font-sans">Simulate email/DM</span>
          </div>
          <div className="p-3 rounded-xl border border-[#EAE7DF] bg-[#FAF8F5] flex items-center justify-between">
            <span className="text-[#65A88B] font-bold">GET</span>
            <span className="text-[#18243A] font-semibold">/api/v1/analytics</span>
            <span className="text-[#78818D] text-[10px] font-sans">Pipeline metrics</span>
          </div>
        </div>
      </div>

      {/* State Management & Reset Section */}
      <div className="p-6 rounded-2xl border border-[#DFDCD3] bg-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-[#18243A]">
            Demo State &amp; Data Management
          </h3>
          <p className="text-xs text-[#78818D]">
            Export complete platform JSON or reset the local demo state back to pristine seed records
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportFullJSON}
            className="px-3.5 py-2 rounded-xl border border-[#DFDCD3] bg-white hover:bg-[#F7F5F0] text-[#18243A] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-[#78818D]" />
            Export State JSON
          </button>
          <button
            onClick={resetAllData}
            className="px-3.5 py-2 rounded-xl border border-[#FF805D]/30 bg-[#FF805D]/10 hover:bg-[#FF805D]/20 text-[#FF805D] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Demo Data
          </button>
        </div>
      </div>
    </div>
  );
};
