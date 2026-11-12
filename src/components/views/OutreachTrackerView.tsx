import React, { useState, useMemo } from 'react';
import { 
  ListOrdered, 
  Search, 
  Download, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Send, 
  Mail, 
  Instagram, 
  Calendar, 
  MessageSquare, 
  AlertCircle, 
  ExternalLink, 
  ChevronDown 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { OutreachLog, OutreachStatus } from '../../types';

export const OutreachTrackerView: React.FC = () => {
  const { outreachLogs, updateOutreachStatus, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');

  const filteredLogs = useMemo(() => {
    return outreachLogs.filter(log => {
      if (statusFilter !== 'all' && log.status !== statusFilter) return false;
      if (channelFilter !== 'all' && log.channelType !== channelFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          log.influencerName.toLowerCase().includes(q) ||
          log.influencerHandle.toLowerCase().includes(q) ||
          (log.influencerEmail && log.influencerEmail.toLowerCase().includes(q)) ||
          log.campaignName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [outreachLogs, statusFilter, channelFilter, searchQuery]);

  const handleSimulateReply = async (logId: string, name: string) => {
    await updateOutreachStatus(logId, 'replied');
    showToast(`Simulated positive response received from ${name}!`, 'success');
  };

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      showToast('No logs to export', 'info');
      return;
    }

    const headers = ['Influencer', 'Handle', 'Email', 'Campaign', 'Channel', 'Status', 'Date', 'Delivery Mode', 'Follow-Up Status'];
    const rows = filteredLogs.map(l => [
      `"${l.influencerName}"`,
      `"${l.influencerHandle}"`,
      `"${l.influencerEmail || 'Instagram DM'}"`,
      `"${l.campaignName}"`,
      l.channelType,
      l.status,
      l.date,
      l.deliveryMode,
      l.followUpStatus,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `influenceai_outreach_tracker_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filteredLogs.length} outreach records to CSV`, 'success');
  };

  const getStatusBadge = (status: OutreachStatus) => {
    switch (status) {
      case 'replied':
        return (
          <span className="text-[11px] font-bold text-[#65A88B] bg-[#65A88B]/15 px-2.5 py-0.5 rounded-full border border-[#65A88B]/30 flex items-center gap-1">
            <MessageSquare className="w-3 h-3" /> Replied
          </span>
        );
      case 'sent':
      case 'simulated':
        return (
          <span className="text-[11px] font-bold text-[#4169E1] bg-[#4169E1]/15 px-2.5 py-0.5 rounded-full border border-[#4169E1]/30 flex items-center gap-1">
            <Send className="w-3 h-3" /> {status === 'simulated' ? 'Simulated Sent' : 'Sent'}
          </span>
        );
      case 'pending_approval':
        return (
          <span className="text-[11px] font-bold text-[#E9B85B] bg-[#E9B85B]/15 px-2.5 py-0.5 rounded-full border border-[#E9B85B]/30 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pending Approval
          </span>
        );
      case 'failed':
        return (
          <span className="text-[11px] font-bold text-[#FF805D] bg-[#FF805D]/15 px-2.5 py-0.5 rounded-full border border-[#FF805D]/30 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Failed
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-bold text-[#78818D] bg-[#F7F5F0] px-2.5 py-0.5 rounded-full border border-[#DFDCD3]">
            Draft
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-[#18243A] font-sans flex items-center gap-2">
            Outreach Tracker
            <span className="text-xs font-mono font-bold text-[#4169E1] bg-[#4169E1]/10 px-2 py-0.5 rounded-md">
              {filteredLogs.length} Records
            </span>
          </h1>
          <p className="text-xs text-[#78818D]">
            Audit message generation, manual approval states, delivery logs, and follow-up schedules
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3.5 py-2 rounded-xl border border-[#DFDCD3] bg-white hover:bg-[#F7F5F0] text-[#18243A] text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <Download className="w-3.5 h-3.5 text-[#78818D]" />
          Export Tracking CSV
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-2xl border border-[#DFDCD3] bg-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-1.5 rounded-xl border border-[#DFDCD3] bg-[#F7F5F0] text-xs font-bold text-[#18243A] focus:outline-none focus:border-[#4169E1] cursor-pointer"
          >
            <option value="all">All Delivery Statuses</option>
            <option value="replied">Replied</option>
            <option value="simulated">Simulated</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="draft">Drafts</option>
          </select>

          {/* Channel filter */}
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="px-3.5 py-1.5 rounded-xl border border-[#DFDCD3] bg-[#F7F5F0] text-xs font-bold text-[#18243A] focus:outline-none focus:border-[#4169E1] cursor-pointer"
          >
            <option value="all">All Channels</option>
            <option value="email">Email</option>
            <option value="instagram_dm">Instagram DM</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#78818D] absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search logs by creator or email..."
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-[#DFDCD3] bg-[#F7F5F0] text-xs font-medium text-[#202A38] placeholder-[#78818D] focus:outline-none focus:border-[#4169E1] focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Interactive Outreach Table */}
      <div className="rounded-2xl border border-[#DFDCD3] bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#EAE7DF] bg-[#FAF8F5] text-[#78818D] select-none">
                <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px]">Influencer</th>
                <th className="py-3 px-3 font-bold uppercase tracking-wider text-[10px]">Destination Email / Handle</th>
                <th className="py-3 px-3 font-bold uppercase tracking-wider text-[10px]">Campaign</th>
                <th className="py-3 px-3 font-bold uppercase tracking-wider text-[10px]">Channel</th>
                <th className="py-3 px-3 font-bold uppercase tracking-wider text-[10px]">Dispatch Date</th>
                <th className="py-3 px-3 font-bold uppercase tracking-wider text-[10px]">Delivery Status</th>
                <th className="py-3 px-3 font-bold uppercase tracking-wider text-[10px]">Follow-Up</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EDE6]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#78818D]">
                    No outreach records match the active criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F7F5F0] transition-colors">
                    {/* Influencer Name & Handle */}
                    <td className="py-3.5 px-4 font-medium">
                      <div className="font-bold text-[#18243A]">{log.influencerName}</div>
                      <div className="text-[11px] text-[#78818D] font-mono font-medium">{log.influencerHandle}</div>
                    </td>

                    {/* Email / Handle */}
                    <td className="py-3 px-3 font-mono text-[11px]">
                      {log.influencerEmail ? (
                        <span className="text-[#202A38] font-medium truncate max-w-[160px] block" title={log.influencerEmail}>
                          {log.influencerEmail}
                        </span>
                      ) : (
                        <span className="text-[#78818D] font-sans font-semibold">Direct Message</span>
                      )}
                    </td>

                    {/* Campaign */}
                    <td className="py-3 px-3 text-[#202A38] font-medium max-w-[140px] truncate" title={log.campaignName}>
                      {log.campaignName}
                    </td>

                    {/* Channel */}
                    <td className="py-3 px-3">
                      <span className="flex items-center gap-1.5 capitalize text-[#18243A] font-semibold">
                        {log.channelType === 'email' ? (
                          <Mail className="w-3.5 h-3.5 text-[#4169E1]" />
                        ) : (
                          <Instagram className="w-3.5 h-3.5 text-[#FF805D]" />
                        )}
                        {log.channelType === 'email' ? 'Email' : 'DM'}
                      </span>
                    </td>

                    {/* Dispatch Date */}
                    <td className="py-3 px-3 font-mono text-[11px] text-[#78818D] font-medium">
                      {new Date(log.date).toLocaleDateString()}
                    </td>

                    {/* Delivery Status Badge */}
                    <td className="py-3 px-3">
                      {getStatusBadge(log.status)}
                    </td>

                    {/* Follow-up Status */}
                    <td className="py-3 px-3 font-mono text-[11px]">
                      {log.followUpStatus === 'responded' ? (
                        <span className="text-[#65A88B] font-bold">Responded</span>
                      ) : log.followUpDate ? (
                        <span className="text-[#18243A] flex items-center gap-1 font-semibold">
                          <Calendar className="w-3 h-3 text-[#78818D]" />
                          {log.followUpDate}
                        </span>
                      ) : (
                        <span className="text-[#78818D] font-sans font-medium">None</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      {log.status === 'simulated' || log.status === 'sent' ? (
                        <button
                          onClick={() => handleSimulateReply(log.id, log.influencerName)}
                          className="px-3 py-1.5 rounded-lg bg-[#65A88B]/15 hover:bg-[#65A88B]/25 text-[#65A88B] text-[11px] font-bold transition-colors border border-[#65A88B]/30 cursor-pointer"
                        >
                          Simulate Reply
                        </button>
                      ) : (
                        <span className="text-[11px] text-[#78818D] font-mono font-medium">Logged</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
