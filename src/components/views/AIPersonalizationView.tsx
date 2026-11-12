import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Mail, 
  Instagram, 
  Copy, 
  Check, 
  RotateCw, 
  Save, 
  CheckCircle2, 
  Edit3, 
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Clock,
  Send,
  Sliders,
  FileText,
  Zap,
  Bookmark,
  PlaySquare,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Influencer } from '../../types';
import { generateOutreachMessage, countWords, GeneratedMessageResult } from '../../services/aiService';

export const AIPersonalizationView: React.FC = () => {
  const { 
    influencers, 
    activeCampaign, 
    selectedInfluencerForAI, 
    setSelectedInfluencerForAI,
    simulateOutreach,
    showToast 
  } = useApp();

  const [selectedCreatorId, setSelectedCreatorId] = useState<string>(
    selectedInfluencerForAI?.id || influencers[0]?.id || ''
  );

  const selectedCreator = influencers.find(i => i.id === selectedCreatorId) || influencers[0];

  const [messageType, setMessageType] = useState<'email' | 'instagram_dm'>('email');
  const [tone, setTone] = useState<'professional' | 'casual' | 'value_first'>('professional');
  const [customNotes, setCustomNotes] = useState<string>('');
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [subjectText, setSubjectText] = useState<string>('');
  const [bodyText, setBodyText] = useState<string>('');
  const [reasoning, setReasoning] = useState<string>('');
  const [modelUsed, setModelUsed] = useState<string>('');
  const [isFallback, setIsFallback] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isApproved, setIsApproved] = useState<boolean>(false);

  // Sync if selectedInfluencerForAI changes from other views
  useEffect(() => {
    if (selectedInfluencerForAI) {
      setSelectedCreatorId(selectedInfluencerForAI.id);
    }
  }, [selectedInfluencerForAI]);

  // Generate when the selected creator, campaign, or channel is ready/changed.
  useEffect(() => {
    if (selectedCreator && activeCampaign) void handleGenerate();
  }, [selectedCreator?.id, activeCampaign?.id, messageType]);

  const handleGenerate = async () => {
    if (!selectedCreator || !activeCampaign) return;
    setIsGenerating(true);
    setIsApproved(false);
    try {
      const result: GeneratedMessageResult = await generateOutreachMessage({
        influencer: selectedCreator,
        campaign: activeCampaign,
        messageType,
        tone,
        customNotes: customNotes.trim() || undefined,
      });

      setSubjectText(result.subject || '');
      setBodyText(result.body);
      setReasoning(result.reasoning);
      setModelUsed(result.modelUsed);
      setIsFallback(result.isFallback);
      showToast(`Generated personalized ${messageType === 'email' ? 'email' : 'Instagram DM'} draft`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error generating copy', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    const fullText = messageType === 'email' 
      ? `Subject: ${subjectText}\n\n${bodyText}`
      : bodyText;

    navigator.clipboard.writeText(fullText);
    setIsCopied(true);
    showToast('Copied message to clipboard', 'info');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSaveDraft = () => {
    if (!selectedCreator || !activeCampaign || !bodyText.trim()) return;
    try {
      const key = 'influenceai_personalization_drafts_v1';
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      const draft = { id: `${selectedCreator.id}-${activeCampaign.id}-${messageType}`, influencerId: selectedCreator.id, influencerName: selectedCreator.name, campaignId: activeCampaign.id, campaignName: activeCampaign.name, messageType, subject: subjectText, body: bodyText, wordCount: currentWordCount, savedAt: new Date().toISOString(), modelUsed, isFallback };
      localStorage.setItem(key, JSON.stringify([draft, ...existing.filter((item: any) => item.id !== draft.id)]));
      showToast('Draft saved locally in this browser', 'success');
    } catch (err) {
      showToast('Could not save draft in browser storage', 'error');
    }
  };

  const handleApprove = async () => {
    const validWords = messageType === 'email' ? currentWordCount >= 60 && currentWordCount <= 90 : currentWordCount >= 15 && currentWordCount <= 30;
    if (!validWords) { showToast(messageType === 'email' ? 'Email must contain 60–90 words' : 'Instagram DM must contain 15–30 words', 'error'); return; }
    if (messageType === 'email' && (!selectedCreator?.contactEmail || selectedCreator.contactEmail === 'Not Found')) { showToast('No public email found for this creator', 'error'); return; }
    try {
      await simulateOutreach(selectedCreator.id, messageType, subjectText, bodyText);
      setIsApproved(true);
      showToast('Outreach simulation recorded in the tracker; no message was sent', 'success');
    } catch (err) { showToast(err instanceof Error ? err.message : 'Could not record outreach', 'error'); }
  };

  const currentWordCount = countWords(bodyText);

  // Word count guidance bounds:
  // Email: 60-90 words
  // Instagram DM: 15-30 words
  const isWordCountIdeal = messageType === 'email' 
    ? (currentWordCount >= 60 && currentWordCount <= 90)
    : (currentWordCount >= 15 && currentWordCount <= 30);

  return (
    <div className="space-y-6 pb-14 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#141E30] font-sans flex items-center gap-2.5">
            AI Personalization Studio
            <span className="text-xs font-mono font-bold text-[#3B66F5] bg-[#3B66F5]/10 px-2.5 py-0.5 rounded-full border border-[#3B66F5]/20">
              {modelUsed || 'AI message generator'}{isFallback ? ' · fallback' : ''}
            </span>
          </h1>
          <p className="text-xs text-[#6C7888]">
            Synthesize context-grounded outreach messages citing recent videos, specific tools, and campaign value
          </p>
        </div>

        {/* Creator Selector Dropdown */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold text-[#6C7888]">Creator:</span>
          <select
            value={selectedCreatorId}
            onChange={(e) => {
              setSelectedCreatorId(e.target.value);
              setSelectedInfluencerForAI(null);
            }}
            className="px-3.5 py-2 rounded-xl border border-[#DFDCD3] bg-white text-xs font-bold text-[#141E30] focus:outline-none focus:border-[#3B66F5] cursor-pointer shadow-2xs max-w-xs"
          >
            {influencers.map(inf => (
              <option key={inf.id} value={inf.id}>
                {inf.name} ({inf.handle}) · {inf.subscribers.toLocaleString()} subs
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Creator Evidence & Brand Fit Context (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Creator Profile Summary */}
          <div className="p-6 rounded-3xl border border-[#DFDCD3] bg-white shadow-xs space-y-4">
            <div className="flex items-start gap-4">
              <img
                src={selectedCreator.avatarUrl}
                alt={selectedCreator.name}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-[#DFDCD3] shadow-sm shrink-0"
              />
              <div className="min-w-0">
                <h3 className="text-base font-extrabold text-[#141E30] truncate">
                  {selectedCreator.name}
                </h3>
                <p className="text-xs text-[#6C7888] font-medium truncate">
                  {selectedCreator.handle} · {selectedCreator.channelTitle}
                </p>
                <div className="flex items-center gap-2.5 text-xs font-mono font-bold mt-1.5">
                  <span className="text-[#141E30]">{selectedCreator.subscribers.toLocaleString()} subs</span>
                  <span className="text-[#3B66F5]">{selectedCreator.engagementRate}% eng</span>
                  <span className="text-[#65A88B] bg-[#65A88B]/15 px-2 py-0.2 rounded-full font-mono text-[10px]">
                    {selectedCreator.qualification.overallScore}/100 Fit
                  </span>
                </div>
              </div>
            </div>

            {/* Personalization Grounding Evidence */}
            <div className="pt-4 border-t border-[#EAE7DF] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#141E30] flex items-center gap-1.5">
                  <PlaySquare className="w-3.5 h-3.5 text-[#3B66F5]" />
                  Grounding Evidence
                </span>
                <span className="text-[10px] text-[#65A88B] font-mono font-bold bg-[#65A88B]/15 px-2 py-0.5 rounded-full">
                  Verified Ingest
                </span>
              </div>

              {/* Analyzed Videos */}
              <div className="space-y-2">
                {selectedCreator.recentVideos.slice(0, 2).map((vid) => (
                  <div key={vid.id} className="p-3 rounded-2xl border border-[#EAE7DF] bg-[#FAF8F5] text-xs">
                    <div className="font-semibold text-[#141E30] line-clamp-2 mb-1">
                      "{vid.title}"
                    </div>
                    <div className="text-[10px] font-mono text-[#6C7888] flex items-center gap-3">
                      <span>{vid.views.toLocaleString()} views</span>
                      <span>·</span>
                      <span>{vid.publishedDate}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Primary Topics */}
              <div>
                <span className="text-[11px] text-[#6C7888] block font-bold uppercase mb-1.5">Key Channels &amp; Stacks:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCreator.topics.map(t => (
                    <span key={t} className="text-xs px-2.5 py-0.5 rounded-lg bg-[#3B66F5]/10 text-[#3B66F5] border border-[#3B66F5]/20 font-bold font-mono">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Brand Alignment & Campaign Pitch */}
            <div className="pt-4 border-t border-[#EAE7DF] space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#141E30] block">
                Brand Fit Rationale
              </span>
              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#DFDCD3] text-xs text-[#141E30] leading-relaxed">
                <span className="font-bold text-[#3B66F5] block mb-1">
                  {activeCampaign?.brandName} ({activeCampaign?.targetNiche})
                </span>
                {activeCampaign?.brandPitch}
              </div>
            </div>
          </div>

          {/* Generator Controls / Custom Instructions */}
          <div className="p-5 rounded-3xl border border-[#DFDCD3] bg-white shadow-xs space-y-3.5 text-xs">
            <span className="text-xs font-bold text-[#141E30] uppercase tracking-wider block">Prompt Controls &amp; Tone</span>
            
            <div className="grid grid-cols-3 gap-2">
              {(['professional', 'casual', 'value_first'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer capitalize ${
                    tone === t
                      ? 'border-[#3B66F5] bg-[#3B66F5] text-white shadow-xs'
                      : 'border-[#DFDCD3] bg-[#FAF8F5] text-[#6C7888] hover:text-[#141E30]'
                  }`}
                >
                  {t.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div>
              <span className="text-[11px] text-[#6C7888] font-bold uppercase block mb-1">Custom pitch offer:</span>
              <input
                type="text"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="e.g. Offering $500 sponsorship fee + early beta access..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFDCD3] bg-[#FAF8F5] text-xs font-medium text-[#141E30] placeholder-[#78818D] focus:outline-none focus:border-[#3B66F5] focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Right Column: AI Generation Canvas & Editor (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-7 rounded-3xl border border-[#DFDCD3] bg-white shadow-xs flex flex-col min-h-[640px]">
            {/* Message Type Toggle Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-[#EAE7DF]">
              <div className="flex items-center gap-1.5 p-1 bg-[#FAF8F5] rounded-2xl border border-[#DFDCD3]">
                <button
                  onClick={() => setMessageType('email')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    messageType === 'email'
                      ? 'bg-white text-[#3B66F5] shadow-xs border border-[#D5D2C7]'
                      : 'text-[#6C7888] hover:text-[#141E30]'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  Collaboration Email
                  <span className="text-[10px] font-mono text-[#6C7888] font-normal">(60–90w)</span>
                </button>
                <button
                  onClick={() => setMessageType('instagram_dm')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    messageType === 'instagram_dm'
                      ? 'bg-white text-[#3B66F5] shadow-xs border border-[#D5D2C7]'
                      : 'text-[#6C7888] hover:text-[#141E30]'
                  }`}
                >
                  <Instagram className="w-3.5 h-3.5" />
                  Instagram DM
                  <span className="text-[10px] font-mono text-[#6C7888] font-normal">(15–30w)</span>
                </button>
              </div>

              {/* Regenerate Action */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-3.5 py-1.5 rounded-xl border border-[#DFDCD3] bg-white hover:bg-[#FAF8F5] disabled:opacity-50 text-[#141E30] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <RotateCw className={`w-3.5 h-3.5 text-[#3B66F5] ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? 'Drafting...' : 'Regenerate'}
              </button>
            </div>

            {/* Live Message Preview / Editor */}
            <div className="flex-1 py-4 space-y-4">
              {/* Subject Line (for Email) */}
              {messageType === 'email' && (
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px] text-[#6C7888] font-semibold">
                    <span>Subject Line</span>
                    <span className="font-mono">{countWords(subjectText)} words</span>
                  </div>
                  <input
                    type="text"
                    value={subjectText}
                    onChange={(e) => setSubjectText(e.target.value)}
                    placeholder="Subject..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFDCD3] bg-[#FAF8F5] text-xs text-[#141E30] font-bold focus:outline-none focus:border-[#3B66F5] focus:bg-white"
                  />
                </div>
              )}

              {/* Message Body Editor */}
              <div className="space-y-1 flex-1 flex flex-col">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-[#6C7888] font-bold uppercase tracking-wider">
                    {messageType === 'email' ? 'Email Body' : 'Direct Message'}
                  </span>
                  
                  {/* Live Word Count Indicator */}
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-[#6C7888] font-semibold">Word Count:</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      isWordCountIdeal 
                        ? 'bg-[#65A88B]/15 text-[#65A88B] border border-[#65A88B]/30' 
                        : 'bg-[#FF6F59]/15 text-[#FF6F59] border border-[#FF6F59]/30'
                    }`}>
                      {currentWordCount} words{' '}
                      {messageType === 'email' ? '(goal: 60–90)' : '(goal: 15–30)'}
                    </span>
                  </div>
                </div>

                <textarea
                  rows={messageType === 'email' ? 10 : 5}
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  placeholder="Drafting personalized outreach..."
                  className="w-full flex-1 p-4 rounded-2xl border border-[#DFDCD3] bg-[#FAF8F5] text-xs text-[#141E30] leading-relaxed font-sans focus:outline-none focus:border-[#3B66F5] focus:bg-white resize-none"
                />
              </div>

              {/* AI Reasoning Note */}
              {reasoning && (
                <div className="p-3.5 rounded-2xl border border-[#DFDCD3] bg-[#FAF8F5] text-[11px] text-[#556271] flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#3B66F5] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[#141E30] font-bold">Personalization Rationale: </span>
                    {reasoning}
                    <div className="text-[10px] text-[#8895A5] mt-0.5 font-mono">
                      Engine: {modelUsed}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions Toolbar */}
            <div className="pt-4 border-t border-[#EAE7DF] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3.5 py-2 rounded-xl border border-[#DFDCD3] bg-white hover:bg-[#FAF8F5] text-[#141E30] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-[#65A88B]" /> : <Copy className="w-3.5 h-3.5 text-[#6C7888]" />}
                  {isCopied ? 'Copied' : 'Copy'}
                </button>

                <button
                  onClick={handleSaveDraft}
                  className="px-3.5 py-2 rounded-xl border border-[#DFDCD3] bg-white hover:bg-[#FAF8F5] text-[#141E30] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Save className="w-3.5 h-3.5 text-[#6C7888]" />
                  Save Draft
                </button>
              </div>

              <div className="flex items-center gap-2">
                {isApproved ? (
                  <span className="px-4 py-2 rounded-xl bg-[#65A88B]/15 text-[#65A88B] border border-[#65A88B]/30 text-xs font-extrabold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Approved &amp; Staged
                  </span>
                ) : (
                  <button
                    onClick={handleApprove}
                    className="px-5 py-2.5 rounded-xl bg-[#3B66F5] hover:bg-[#2C52D6] text-white text-xs font-bold shadow-md shadow-[#3B66F5]/25 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve &amp; Stage Outreach
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
