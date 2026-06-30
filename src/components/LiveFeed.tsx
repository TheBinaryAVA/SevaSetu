import React, { useState, useMemo } from 'react';
import { MapPin, Search, Sliders, ThumbsUp, ThumbsDown, MessageSquare, AlertTriangle, ShieldCheck, Heart, ArrowRight } from 'lucide-react';
import { Issue, User } from '../types';

interface LiveFeedProps {
  issues: Issue[];
  currentUser: User | null;
  onViewIssue: (issueId: string) => void;
  onVerifyVote: (issueId: string, type: 'upvote' | 'downvote') => void;
  onSupportIssue: (issueId: string) => void;
}

export default function LiveFeed({ issues, currentUser, onViewIssue, onVerifyVote, onSupportIssue }: LiveFeedProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterSeverity, setFilterSeverity] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Computed and filtered list of issues
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            issue.address.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === 'All' || issue.category === filterCategory;
      const matchesSeverity = filterSeverity === 'All' || issue.severity === filterSeverity;
      const matchesStatus = filterStatus === 'All' || issue.status === filterStatus;

      return matchesSearch && matchesCategory && matchesSeverity && matchesStatus;
    });
  }, [issues, searchTerm, filterCategory, filterSeverity, filterStatus]);

  const categories = ['All', 'Water Utility', 'Potholes & Roads', 'Electrical & Lighting', 'Waste Management', 'Drainage & Sewer', 'Sidewalks & Transit', 'Public Property Damage'];
  const severities = ['All', 'Low', 'Medium', 'High', 'Critical'];
  const statuses = ['All', 'Reported', 'AI Analyzed', 'Community Verified', 'Assigned', 'In Progress', 'Resolved'];

  const getSeverityStyles = (sev: string) => {
    switch (sev) {
      case 'Critical': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'High': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'Medium': return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Resolved': return 'bg-emerald-600 text-white';
      case 'In Progress': return 'bg-blue-600 text-white';
      case 'Assigned': return 'bg-indigo-600 text-white';
      case 'Community Verified': return 'bg-purple-600 text-white';
      case 'AI Analyzed': return 'bg-amber-500 text-slate-900';
      default: return 'bg-slate-500 text-white';
    }
  };

  return (
    <div id="live-feed-section" className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. Refined Filtering HUD */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        
        {/* Search Input and icon */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search complaints by title, keyword, address, or locality (e.g., Koramangala)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Categories, Severity, Status selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">Civic Category</label>
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">Risk Severity</label>
            <select 
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            >
              {severities.map(sev => <option key={sev} value={sev}>{sev}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">Lifecycle Status</label>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            >
              {statuses.map(st => <option key={st} value={st}>{st}</option>)}
            </select>
          </div>
        </div>

      </div>

      {/* 2. Grid of Social feed Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredIssues.map((issue) => {
          const totalVotes = (issue.upvotes || 0) + (issue.downvotes || 0);
          const consensusPercentage = totalVotes > 0 
            ? Math.round(((issue.upvotes || 0) / totalVotes) * 100) 
            : 50;

          return (
            <div 
              key={issue.id}
              className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Card Header: Profile Info */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={issue.userAvatar} alt={issue.userName} className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{issue.userName}</h4>
                    <p className="text-[9px] font-mono text-slate-400 uppercase">
                      Citizen Reporter • {new Date(issue.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <span className={`text-[9px] font-mono font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider ${getSeverityStyles(issue.severity)}`}>
                  {issue.severity}
                </span>
              </div>

              {/* Card Body: Image & Contents */}
              <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                <img src={issue.image} alt={issue.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <span className={`absolute top-3 left-3 text-[9px] font-mono font-bold tracking-widest px-2.5 py-1 uppercase rounded-md shadow-md ${getStatusStyles(issue.status)}`}>
                  {issue.status}
                </span>
              </div>

              {/* Card Content Text */}
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate font-bold text-slate-500">{issue.address}</span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-800 font-sans tracking-tight">{issue.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{issue.description}</p>
                </div>

                {/* Consensus Indicator meter */}
                <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-500 flex items-center gap-1 font-sans">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Community Consensus: <span className="font-bold text-slate-800">{issue.trustScore || consensusPercentage}%</span>
                    </span>
                    <span className="font-mono text-slate-400">
                      Verified by <span className="font-bold text-slate-700">{issue.upvotes}</span> citizens
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${issue.trustScore || consensusPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Card Footer: Interactive Buttons (Fully Functional) */}
              <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs font-mono font-bold">
                <div className="flex gap-1">
                  {/* Upvote button */}
                  <button 
                    onClick={() => onVerifyVote(issue.id, 'upvote')}
                    className="p-2 px-3 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-emerald-600 transition-colors flex items-center gap-1"
                    title="Verify this issue exists"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{issue.upvotes}</span>
                  </button>

                  {/* Downvote button */}
                  <button 
                    onClick={() => onVerifyVote(issue.id, 'downvote')}
                    className="p-2 px-3 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-rose-600 transition-colors flex items-center gap-1"
                    title="Flag as inaccurate/resolved"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span>{issue.downvotes}</span>
                  </button>

                  {/* Support Count button */}
                  <button 
                    onClick={() => onSupportIssue(issue.id)}
                    className="p-2 px-3 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-rose-600 transition-colors flex items-center gap-1"
                    title="Support with reputation points"
                  >
                    <Heart className="w-3.5 h-3.5 fill-none text-slate-500 hover:fill-rose-500 hover:text-rose-500" />
                    <span>Support</span>
                  </button>
                </div>

                <button 
                  onClick={() => onViewIssue(issue.id)}
                  className="p-2 px-3 bg-white hover:bg-emerald-50 border border-slate-200 text-emerald-800 hover:border-emerald-300 rounded-lg transition-all flex items-center gap-1 text-[11px] font-sans"
                >
                  Audit Timeline <ArrowRight className="w-3 h-3" />
                </button>
              </div>

            </div>
          );
        })}

        {filteredIssues.length === 0 && (
          <div className="col-span-full py-16 text-center space-y-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <AlertTriangle className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No active complaints logged</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">There are no reports matches the filters. Try adjusting your query or logging a new complaint.</p>
          </div>
        )}
      </div>

    </div>
  );
}
