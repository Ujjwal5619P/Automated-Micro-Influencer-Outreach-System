import React, { useState } from 'react';
import { 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Mail, 
  Instagram, 
  RotateCw, 
  Sparkles, 
  Clock, 
  HelpCircle,
  Eye,
  Sliders,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  PlaySquare,
  ArrowRight,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { OutreachLog, Influencer } from '../../types';
import { countWords } from '../../services/aiService';

export const OutreachCenterView: React.FC = () => {
  const { 
    influencers, 
    outreachLogs, 
    updateOutreachStatus, 
    navigateToPersonalization,
    showToast 
  } = useApp();

  const [sendingMode, setSendingMode] = useState<'simulation' | 'real'>('simulation');
  const [isSimulatingBatch, setIsSimulatingBatch] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Staged / pending approvals
  const pendingLogs = outreachLogs.filter(l => l.status === 'pending_approval' || l.status === 'draft');

  // Currently focused message in the split workspace
  const [selectedLogId, setSelectedLogId] = useState<string>(
    pendingLogs[0]?.id || outreachLogs[0]?.id || ''
  );

  // Active selected log
  const activeLog = pendingLogs.find(l => l.id === selectedLogId) || pendingLogs[0] || outreachLogs[0];

  // Matched creator
  const targetCreator: Influencer | undefined = activeLog 
    ? influencers.find(i => i.id === activeLog.influencerId)
    : undefined;

  // Duplicate outreach check
  const getOutreachCount = (influencerId: string) => {
    return outreachLogs.filter(l => l.influencerId === influencerId).length;
  };

  const isDuplicate = activeLog ? getOutreachCount(activeLog.influencerId) > 1 : false;

  const handleApproveAndSend = async (log: OutreachLog) => {
    await updateOutreachStatus(log.id, 'simulated');
    showToast(`Dispatched simulated message to ${log.influencerName}`, 'success');
  };

  const handleSimulateBatch = async () => {
    if (pendingLogs.length === 0) {
      showToast('No pending messages in queue', 'info');
      return;
    }
    setIsSimulatingBatch(true);
    for (const log of pendingLogs) {
      await updateOutreachStatus(log.id, 'simulated');
    }
    setIsSimulatingBatch(false);
    showToast(`Simulated batch delivery for ${pendingLogs.length} messages`, 'success');
  };

  const handleCopy = () => {
    if (!activeLog) return;
    const fullText = activeLog.subject 
      ? `Subject: ${activeLog.subject}\n\n${activeLog.messagePreview}`
      : activeLog.messagePreview;
    navigator.clipboard.writeText(fullText);
    setIsCopied(true);
    showToast('Copied message to clipboard', 'info');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const wordCount = activeLog ? countWords(activeLog.messagePreview) : 0;
  const isEmail = activeLog?.channelType === 'email';
  const isWordCountIdeal = isEmail
    ? (wordCount >= 55 && wordCount <= 95)
    : (wordCount >= 14 && wordCount <= 32);

  return (
    <div className="space-y-6 pb-14 max-w-7xl mx-auto">
      {/* Workspace Header & Dispatch Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#141E30] font-sans flex items-center gap-2.5">
            Outreach Writing &amp; Dispatch Studio
            <span className="text-xs font-mono font-bold text-[#FF6F59] bg-[#FF6F59]/10 px-2.5 py-0.5 rounded-full border border-[#FF6F59]/20">
              {pendingLogs.length} Staged for Approval
            </span>
          </h1>
          <p className="text-xs text-[#6C7888]">
            Review personalized copy, inspect creator validation signals, and execute verified outreach
          </p>
        </div>

        {/* Mode Selector and Batch Actions */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-[#DFDCD3] text-xs shadow-2xs">
            <button
              onClick={() => setSendingMode('simulation')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                sendingMode === 'simulation'
                  ? 'bg-[#141E30] text-white shadow-2xs'
                  : 'text-[#6C7888] hover:text-[#141E30]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#65A88B]" />
              Simulation Mode
            </button>

            <button
              onClick={() => {
                showToast('Real sending mode requires Python FastAPI + Gmail API credentials', 'info');
              }}
              title="Real sending mode is reserved for Python FastAPI + Gmail backend"
              className="px-3 py-1.5 rounded-lg text-[#8895A5] hover:text-[#556271] transition-colors flex items-center gap-1.5 cursor-not-allowed opacity-80 font-medium"
            >
              <span className="w-2 h-2 rounded-full bg-[#DFDCD3]" />
              Real Sending (FastAPI Target)
            </button>
          </div>

          {pendingLogs.length > 0 && (
            <button
              onClick={handleSimulateBatch}
              disabled={isSimulatingBatch}
              className="px-4 py-2 rounded-xl bg-[#3B66F5] hover:bg-[#2C52D6] text-white text-xs font-bold shadow-md shadow-[#3B66F5]/20 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              {isSimulatingBatch ? 'Dispatching...' : `Dispatch All (${pendingLogs.length})`}
            </button>
          )}
        </div>
      </div>

      {/* Zero State if no logs pending */}
      {pendingLogs.length === 0 ? (
        <div className="p-12 rounded-3xl border border-[#DFDCD3] bg-white text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#65A88B]/15 text-[#65A88B] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-[#141E30]">Outreach Queue is Clean</h3>
            <p className="text-xs text-[#6C7888] max-w-md mx-auto leading-relaxed">
              All prepared pitches have been approved and simulated. Discover new creators or personalize additional drafts.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => navigateToPersonalization(influencers[0])}
              className="px-4 py-2 rounded-xl bg-[#3B66F5] hover:bg-[#2C52D6] text-white text-xs font-bold shadow-sm shadow-[#3B66F5]/20 transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Open AI Personalization Studio
            </button>
            <button
              onClick={() => updateOutreachStatus(outreachLogs[0]?.id, 'pending_approval')}
              className="px-4 py-2 rounded-xl border border-[#DFDCD3] bg-white hover:bg-[#FAF8F5] text-[#141E30] text-xs font-bold transition-colors cursor-pointer"
            >
              Stage Sample Pitch
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Queue Selector Ribbon */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {pendingLogs.map((log) => {
              const creator = influencers.find(i => i.id === log.influencerId);
              const isSelected = (activeLog && activeLog.id === log.id);
              const hasDuplicate = getOutreachCount(log.influencerId) > 1;

              return (
                <button
                  key={log.id}
                  onClick={() => setSelectedLogId(log.id)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border transition-all cursor-pointer shrink-0 text-left ${
                    isSelected
                      ? 'border-[#3B66F5] bg-white shadow-xs ring-1 ring-[#3B66F5]'
                      : 'border-[#DFDCD3] bg-[#FAF8F5] hover:bg-white text-[#6C7888]'
                  }`}
                >
                  {creator ? (
                    <img
                      src={creator.avatarUrl}
                      alt={creator.name}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-xl object-cover ring-1 ring-[#DFDCD3]"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-xl bg-[#3B66F5]/10 text-[#3B66F5] flex items-center justify-center font-bold text-xs">
                      {log.influencerName[0]}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className={`text-xs font-bold truncate ${isSelected ? 'text-[#141E30]' : 'text-[#6C7888]'}`}>
                      {log.influencerName}
                    </div>
                    <div className="text-[10px] text-[#8895A5] flex items-center gap-1 font-mono">
                      <span>{log.channelType === 'email' ? 'Email' : 'DM'}</span>
                      {hasDuplicate && (
                        <span className="text-[#FF6F59] font-bold">· Dup</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* SPLIT WRITING WORKSPACE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Creator Dossier & Grounding Evidence (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-6 rounded-3xl border border-[#DFDCD3] bg-white shadow-xs space-y-5">
                {/* Creator Header with Photo */}
                <div className="flex items-start gap-4">
                  {targetCreator ? (
                    <img
                      src={targetCreator.avatarUrl}
                      alt={targetCreator.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#DFDCD3] shadow-sm shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-[#3B66F5]/10 text-[#3B66F5] flex items-center justify-center font-extrabold text-xl shrink-0">
                      {activeLog.influencerName[0]}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-extrabold text-[#141E30] truncate">
                        {activeLog.influencerName}
                      </h3>
                      {targetCreator && (
                        <span className="text-[10px] font-mono font-bold text-[#65A88B] bg-[#65A88B]/15 px-2 py-0.5 rounded-full border border-[#65A88B]/25">
                          {targetCreator.qualification.overallScore}/100 Fit
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#6C7888] font-medium truncate">
                      {activeLog.influencerHandle} · {targetCreator?.country || 'India'}
                    </p>

                    <div className="mt-2 flex items-center gap-3 text-xs font-mono font-bold">
                      <span className="text-[#141E30]">
                        {targetCreator?.subscribers.toLocaleString()} subs
                      </span>
                      <span className="text-[#3B66F5]">
                        {targetCreator?.engagementRate}% eng
                      </span>
                    </div>
                  </div>
                </div>

                {/* Duplicate Outreach Warning Notice */}
                {isDuplicate && (
                  <div className="p-3.5 rounded-2xl bg-[#FF6F59]/10 border border-[#FF6F59]/25 text-xs text-[#141E30] flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-[#FF6F59] shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="font-extrabold text-[#FF6F59]">Duplicate Outreach Alert</span>
                      <p className="text-[11px] text-[#6C7888] leading-relaxed">
                        This creator was already contacted previously in this campaign. Verify your messaging to avoid duplicate outreach fatigue.
                      </p>
                    </div>
                  </div>
                )}

                {/* Destination & Channel Info */}
                <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE7DF] space-y-2 text-xs">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#78818D]">
                    Dispatch Target
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#141E30]">
                      {activeLog.channelType === 'email' ? 'Contact Email:' : 'Instagram Direct Message:'}
                    </span>
                    <span className="font-mono text-[#3B66F5] font-bold">
                      {activeLog.influencerEmail || targetCreator?.instagramHandle || 'Instagram DM'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-[#EAE7DF]">
                    <span className="text-[#6C7888]">Campaign:</span>
                    <span className="font-semibold text-[#141E30] truncate max-w-[200px]">
                      {activeLog.campaignName}
                    </span>
                  </div>
                </div>

                {/* Grounding Video Evidence */}
                {targetCreator && targetCreator.recentVideos.length > 0 && (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#6C7888]">
                      <span className="flex items-center gap-1.5 text-[#141E30]">
                        <PlaySquare className="w-3.5 h-3.5 text-[#3B66F5]" />
                        Content Grounding Evidence
                      </span>
                      <span className="text-[10px] text-[#65A88B] font-mono">Verified Match</span>
                    </div>

                    <div className="p-3 rounded-xl border border-[#EAE7DF] bg-[#FAF8F5] space-y-1">
                      <div className="font-semibold text-[#141E30] line-clamp-2">
                        "{targetCreator.recentVideos[0].title}"
                      </div>
                      <div className="text-[10px] font-mono text-[#78818D] flex items-center gap-2">
                        <span>{targetCreator.recentVideos[0].views.toLocaleString()} views</span>
                        <span>·</span>
                        <span>{targetCreator.recentVideos[0].publishedDate}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Writing Canvas & Approval Strip (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-7 rounded-3xl border border-[#DFDCD3] bg-white shadow-xs space-y-5">
                {/* Header Strip with Channel Indicator */}
                <div className="flex items-center justify-between pb-3.5 border-b border-[#EAE7DF]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#3B66F5]/10 text-[#3B66F5] flex items-center justify-center">
                      {isEmail ? <Mail className="w-4 h-4" /> : <Instagram className="w-4 h-4 text-[#FF6F59]" />}
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-[#141E30]">
                        {isEmail ? 'Collaboration Email Pitch' : 'Instagram Direct Message'}
                      </span>
                      <span className="text-[10px] text-[#6C7888] block">
                        Prepared via configured message generator
                      </span>
                    </div>
                  </div>

                  {/* Word Count Capsule */}
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="text-[#6C7888]">Word Count:</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      isWordCountIdeal 
                        ? 'bg-[#65A88B]/15 text-[#65A88B] border border-[#65A88B]/30' 
                        : 'bg-[#FF6F59]/15 text-[#FF6F59] border border-[#FF6F59]/30'
                    }`}>
                      {wordCount} words {isEmail ? '(goal: 60–90)' : '(goal: 15–30)'}
                    </span>
                  </div>
                </div>

                {/* Email Subject Line (if email) */}
                {activeLog.subject && (
                  <div className="space-y-1 text-xs">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#6C7888]">
                      Subject Line
                    </label>
                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#DFDCD3] font-bold text-[#141E30]">
                      {activeLog.subject}
                    </div>
                  </div>
                )}

                {/* Message Body Content */}
                <div className="space-y-1 text-xs">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#6C7888]">
                    Personalized Message Body
                  </label>
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#DFDCD3] text-[#141E30] leading-relaxed whitespace-pre-wrap font-sans text-xs">
                    {activeLog.messagePreview}
                  </div>
                </div>

                {/* Simulation Guidance Callout */}
                <div className="p-3.5 rounded-2xl bg-[#3B66F5]/5 border border-[#3B66F5]/15 text-[11px] text-[#556271] flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-[#3B66F5] shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Executing dispatch in Simulation Mode records delivery timestamps, activates follow-up reminders, and logs simulated creator replies without generating real external network traffic.
                  </p>
                </div>

                {/* Actions Toolbar */}
                <div className="pt-4 border-t border-[#EAE7DF] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="px-3.5 py-2 rounded-xl border border-[#DFDCD3] bg-white hover:bg-[#FAF8F5] text-[#141E30] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-[#65A88B]" /> : <Copy className="w-3.5 h-3.5 text-[#6C7888]" />}
                      {isCopied ? 'Copied' : 'Copy'}
                    </button>

                    {targetCreator && (
                      <button
                        onClick={() => navigateToPersonalization(targetCreator)}
                        className="px-3.5 py-2 rounded-xl border border-[#DFDCD3] bg-white hover:bg-[#FAF8F5] text-[#141E30] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#3B66F5]" />
                        Edit in AI Studio
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handleApproveAndSend(activeLog)}
                    className="px-5 py-2.5 rounded-xl bg-[#3B66F5] hover:bg-[#2C52D6] text-white text-xs font-bold shadow-md shadow-[#3B66F5]/25 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve &amp; Simulate Dispatch
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
