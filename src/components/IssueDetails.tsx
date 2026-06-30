import React, { useState, useMemo } from 'react';
import { MapPin, Sliders, CheckCircle, Clock, ShieldCheck, Heart, ArrowLeft, ThumbsUp, ThumbsDown, Send, UserCheck, AlertTriangle, ChevronRight, Activity, Plus } from 'lucide-react';
import { Issue, Comment, User } from '../types';

interface IssueDetailsProps {
  issueId: string;
  allIssues: Issue[];
  currentUser: User | null;
  comments: Comment[];
  onBack: () => void;
  onVerifyVote: (issueId: string, type: 'upvote' | 'downvote') => void;
  onSupportIssue: (issueId: string) => void;
  onAddComment: (issueId: string, content: string, fileImage: string | null) => void;
  onViewIssue: (id: string) => void;
}

// Simulated evidence files uploaded by other citizens
const INITIAL_EVIDENCE_LOGS = [
  { id: "ev-1", author: "Sneha Patel", image: "https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?w=600", timestamp: "12 hours ago", note: "Barriers are set up on the left lane." },
  { id: "ev-2", author: "Rahul Verma", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", timestamp: "5 hours ago", note: "Contractors welding the lower pipeline junction." }
];

export default function IssueDetails({ issueId, allIssues, currentUser, comments, onBack, onVerifyVote, onSupportIssue, onAddComment, onViewIssue }: IssueDetailsProps) {
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [commentEvidence, setCommentEvidence] = useState<string | null>(null);

  // Resolution feedback form states
  const [selectedFeedbackStatus, setSelectedFeedbackStatus] = useState<'Fully Resolved' | 'Partially Resolved' | 'Not Resolved'>('Fully Resolved');
  const [feedbackComment, setFeedbackComment] = useState<string>('');
  const [feedbackImage, setFeedbackImage] = useState<string | null>(null);

  // Retrieve current detailed issue
  const currentIssue = useMemo(() => {
    return allIssues.find(i => i.id === issueId) || allIssues[0];
  }, [allIssues, issueId]);

  const handleSubmitFeedback = async () => {
    if (!feedbackComment.trim()) {
      alert("Please enter an audit comment explaining your verification.");
      return;
    }
    if (!currentUser) return;

    try {
      const res = await fetch(`/api/issues/${currentIssue.id}/resolution-feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          status: selectedFeedbackStatus,
          comment: feedbackComment,
          evidenceImage: feedbackImage
        })
      });

      if (res.ok) {
        setFeedbackComment('');
        setFeedbackImage(null);
        // Reactive sync re-fetches details automatically
        onViewIssue(currentIssue.id);
      }
    } catch (err) {
      console.error("Failed to submit resolution feedback:", err);
    }
  };

  // Find nearby similar issues
  const nearbyIssues = useMemo(() => {
    return allIssues
      .filter(i => i.id !== currentIssue.id && i.category === currentIssue.category)
      .slice(0, 2);
  }, [allIssues, currentIssue]);

  const detailedComments = useMemo(() => {
    return comments.filter(c => c.issueId === currentIssue.id);
  }, [comments, currentIssue]);

  // Status mapping for visual tracking (Requirement 10)
  // Reported -> AI Validated -> Duplicate Check Completed -> Community Verified -> Assigned -> In Progress -> Resolved
  const trackingStages = [
    { label: 'Reported', value: 'Reported', progress: 15, desc: 'Logged on smart network' },
    { label: 'AI Validated', value: 'AI Validated', progress: 30, desc: 'Triage complete' },
    { label: 'Duplicate Checked', value: 'Duplicate Checked', progress: 45, desc: 'Unique record confirmed' },
    { label: 'Community Verified', value: 'Community Verified', progress: 60, desc: 'Citizen consensus approved' },
    { label: 'Assigned', value: 'Assigned', progress: 75, desc: 'Dispatched to department' },
    { label: 'In Progress', value: 'In Progress', progress: 90, desc: 'Workers on ground' },
    { label: 'Resolved', value: 'Resolved', progress: 100, desc: 'Inspected & closed' }
  ];

  // Map database status to our granular tracking stages for high fidelity
  const getGranularStageIndex = (status: string) => {
    switch (status) {
      case 'Resolved': return 6;
      case 'In Progress': return 5;
      case 'Assigned': return 4;
      case 'Community Verified': return 3;
      case 'AI Analyzed': return 1; // Maps to AI Validated
      default: return 0; // Reported
    }
  };

  const currentStageIndex = getGranularStageIndex(currentIssue.status);
  const currentStagePercentage = trackingStages[currentStageIndex].progress;

  // Handle Comment Post
  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    onAddComment(currentIssue.id, newCommentText, commentEvidence);
    setNewCommentText('');
    setCommentEvidence(null);
  };

  const totalVotes = (currentIssue.upvotes || 0) + (currentIssue.downvotes || 0);
  const trustScorePercentage = totalVotes > 0 
    ? Math.round(((currentIssue.upvotes || 0) / totalVotes) * 100) 
    : 85;

  const severityColors = currentIssue.severity === 'Critical' 
    ? 'bg-rose-100 text-rose-800' 
    : currentIssue.severity === 'High' 
    ? 'bg-orange-100 text-orange-800' 
    : 'bg-amber-100 text-amber-800';

  return (
    <div id="issue-details-root" className="space-y-8 animate-in fade-in duration-200">
      
      {/* Back button header */}
      <div className="flex justify-between items-center">
        <button 
          onClick={onBack}
          className="py-1.5 px-3 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition-all flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" /> Back to List
        </button>
        <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">
          Ticket Audit: #{currentIssue.id}
        </span>
      </div>

      {/* Hero Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-xs space-y-4">
        <div className="flex flex-wrap gap-2 items-center text-[10px] font-mono font-bold">
          <span className={`px-2.5 py-0.5 rounded-sm uppercase ${severityColors}`}>
            {currentIssue.severity} Severity
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500 uppercase">{currentIssue.category}</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {currentIssue.address}
          </span>
        </div>

        <h1 className="text-xl md:text-2xl font-black text-slate-800 font-sans tracking-tight leading-tight">
          {currentIssue.title}
        </h1>

        <div className="flex items-center gap-3 pt-2">
          <img src={currentIssue.userAvatar} alt={currentIssue.userName} className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
          <div className="text-[10px] text-slate-500 font-mono">
            Reported by <span className="font-bold text-slate-700">{currentIssue.userName}</span> on {new Date(currentIssue.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Core Real-Time Tracking Timeline (Requirement 10) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div>
          <h3 className="text-xs font-mono font-extrabold uppercase tracking-wider text-slate-400">Real-Time Issue Lifecycle</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Uber-like progress mapping of municipal workflows from log to closure.</p>
        </div>

        {/* Horizontal Tracker visual */}
        <div className="relative pt-4 pb-8">
          
          {/* Progress gray background bar */}
          <div className="absolute top-9 left-4 right-4 h-1.5 bg-slate-150 rounded-full" />
          
          {/* Progress active emerald bar */}
          <div 
            className="absolute top-9 left-4 h-1.5 bg-emerald-500 rounded-full transition-all duration-1000"
            style={{ width: `calc(${currentStagePercentage}% - 2rem)` }}
          />

          <div className="relative z-10 grid grid-cols-7 gap-1">
            {trackingStages.map((stage, idx) => {
              const isCompleted = idx <= currentStageIndex;
              const isActive = idx === currentStageIndex;
              const hasCheck = isCompleted && !isActive;

              return (
                <div key={stage.label} className="text-center space-y-3 flex flex-col items-center">
                  {/* Indicator Dot */}
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isActive ? 'bg-emerald-600 border-white ring-4 ring-emerald-100 text-white' : isCompleted ? 'bg-emerald-50 text-emerald-700 border-emerald-500' : 'bg-slate-100 text-slate-400 border-slate-200'}`}
                  >
                    {isActive ? (
                      <Activity className="w-4.5 h-4.5 animate-pulse" />
                    ) : hasCheck ? (
                      <span className="text-xs font-bold font-mono">✓</span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold">{idx + 1}</span>
                    )}
                  </div>

                  {/* Stage Label */}
                  <div className="space-y-0.5">
                    <span className={`text-[10px] font-bold block leading-tight ${isActive ? 'text-slate-900 font-extrabold' : 'text-slate-700'}`}>
                      {stage.label}
                    </span>
                    <span className="text-[8px] text-slate-400 leading-normal hidden md:block">
                      {stage.desc}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Timeline Checkpoints Log */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
          <div className="text-[9px] font-mono font-bold tracking-wider text-slate-400 uppercase">Audit Checkpoints (Timestamped)</div>
          <div className="space-y-3 font-sans text-xs">
            {currentIssue.timeline.map((point, index) => (
              <div key={index} className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                <div>
                  <p className="font-bold text-slate-700 flex items-center gap-1.5">
                    {point.status} <span className="text-[9px] font-mono font-normal text-slate-400">by {point.updatedBy}</span>
                  </p>
                  {point.note && <p className="text-[11px] text-slate-500 mt-0.5">{point.note}</p>}
                  <span className="text-[9px] text-slate-400 font-mono block mt-1">{new Date(point.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 12-Column Grid splitting content: Left: Incident Image, AI Analysis, Evidence; Right: Department Checklist, Discussion */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (8/12 spacing on desktop) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Incident Image */}
          <div className="bg-slate-100 rounded-3xl overflow-hidden aspect-video border border-slate-200 relative group shadow-sm">
            <img src={currentIssue.image} alt={currentIssue.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>

          {/* Real Geo-Tagging Details */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-5 h-5 text-rose-600" />
              <h3 className="text-xs font-mono font-extrabold uppercase tracking-wider text-slate-400">On-Site GPS Geotag Record</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-[8px] font-mono font-bold text-slate-400 block uppercase">Latitude</span>
                <span className="text-xs font-extrabold text-slate-800 font-mono">{currentIssue.lat?.toFixed(6) || "12.979200"}° N</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-[8px] font-mono font-bold text-slate-400 block uppercase">Longitude</span>
                <span className="text-xs font-extrabold text-slate-800 font-mono">{currentIssue.lng?.toFixed(6) || "80.219500"}° E</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-[8px] font-mono font-bold text-slate-400 block uppercase">Ward Division</span>
                <span className="text-xs font-extrabold text-slate-800">Ward 178 (Velachery)</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-[8px] font-mono font-bold text-slate-400 block uppercase">Municipal City</span>
                <span className="text-xs font-extrabold text-slate-800">Chennai</span>
              </div>
            </div>
            <div className="bg-rose-50/50 p-3.5 rounded-xl border border-rose-100 text-xs text-rose-950 flex items-start gap-2">
              <span className="text-rose-600">📍</span>
              <div>
                <span className="font-extrabold">Verified Address:</span> {currentIssue.address || "Velachery, Chennai"}
              </div>
            </div>
          </div>

          {/* Citizen Resolution Feedback System (Active when Resolved) */}
          {currentIssue.status === 'Resolved' && (
            <div className="bg-white p-6 rounded-3xl border-2 border-emerald-500/30 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-xs font-mono font-extrabold uppercase tracking-wider text-slate-400">Citizen Resolution Audit</h3>
                </div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded">
                  Status: Resolved
                </span>
              </div>

              <p className="text-xs text-slate-500 leading-normal">
                Municipal officers have marked this issue as resolved. Please verify the actual ground status to confirm proper closure.
              </p>

              {/* Logged feedback records */}
              <div className="space-y-3">
                <h4 className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">Logged Ground Verification Audits</h4>
                {currentIssue.resolutionFeedback && currentIssue.resolutionFeedback.map((fb, idx) => (
                  <div key={fb.id || idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-150 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <img src={fb.userAvatar} alt={fb.userName} className="w-6 h-6 rounded-full object-cover" referrerPolicy="no-referrer" />
                        <span className="font-bold text-slate-800">{fb.userName}</span>
                      </div>
                      <span className={`px-2 py-0.5 font-mono text-[9px] font-bold rounded ${fb.status === 'Fully Resolved' ? 'bg-emerald-100 text-emerald-800' : fb.status === 'Partially Resolved' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'}`}>
                        {fb.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-normal italic">"{fb.comment}"</p>
                    {fb.evidenceImage && (
                      <div className="h-32 rounded-lg overflow-hidden bg-slate-900 border border-slate-200 mt-2">
                        <img src={fb.evidenceImage} alt="Resolution Evidence" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    )}
                    <span className="text-[9px] text-slate-400 font-mono block">{new Date(fb.createdAt).toLocaleString()}</span>
                  </div>
                ))}

                {(!currentIssue.resolutionFeedback || currentIssue.resolutionFeedback.length === 0) && (
                  <div className="text-center py-6 text-xs text-slate-400 italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    No citizen audits filed yet. Be the first to verify this resolution!
                  </div>
                )}
              </div>

              {/* Submit Feedback Form */}
              <div className="pt-4 border-t border-slate-150 space-y-4">
                <h4 className="text-[11px] font-bold text-slate-800">File Your Ground Resolution Audit</h4>
                
                <div className="grid grid-cols-3 gap-2">
                  {(['Fully Resolved', 'Partially Resolved', 'Not Resolved'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setSelectedFeedbackStatus(st)}
                      className={`py-2 px-2.5 rounded-lg text-[10px] font-bold font-sans border text-center transition-all ${selectedFeedbackStatus === st ? 'bg-slate-900 text-white border-slate-900 shadow-xs' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'}`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <textarea
                    rows={2}
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="Enter audit comment verifying the quality of the repair..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  />
                  
                  {/* Evidence attachment */}
                  <input
                    type="text"
                    value={feedbackImage || ''}
                    onChange={(e) => setFeedbackImage(e.target.value || null)}
                    placeholder="Optional: Enter photo URL proving repair quality..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-[11px] font-mono text-slate-600"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSubmitFeedback}
                  className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
                >
                  Submit Ground Audit Report
                </button>
              </div>
            </div>
          )}

          {/* AI Analysis details (Requirement 9) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <h3 className="text-xs font-mono font-extrabold uppercase tracking-wider text-slate-400">AI Diagnostic Triage Logs</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[8px] font-mono font-bold text-slate-400 uppercase">Estimated Population Affected</span>
                <p className="text-base font-extrabold text-slate-800">{currentIssue.affectedPopulation || 150} local citizens</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[8px] font-mono font-bold text-slate-400 uppercase">Image Verification Score</span>
                <p className="text-base font-extrabold text-emerald-600">{currentIssue.confidenceScore || 92}% accuracy match</p>
              </div>
            </div>

            <div className="space-y-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-[8px] font-mono font-bold text-slate-400 uppercase">Detailed Infrastructure Impact Estimate</span>
              <p className="text-xs text-slate-600 leading-relaxed leading-normal mt-1">
                {currentIssue.impactEstimate || 'Continuous waterlogging and structural decay on public thoroughfares.'}
              </p>
            </div>
          </div>

          {/* Citizen Evidence Gallery (Requirement 8 & 9) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <h3 className="text-xs font-mono font-extrabold uppercase tracking-wider text-slate-400">Citizen Evidence Gallery</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Photographs and inspections logged on-ground by third-party auditors.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {INITIAL_EVIDENCE_LOGS.map(ev => (
                <div key={ev.id} className="border border-slate-150 rounded-xl overflow-hidden shadow-2xs bg-slate-50 flex flex-col justify-between">
                  <div className="h-28 overflow-hidden bg-slate-900">
                    <img src={ev.image} alt="evidence" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="p-2.5 space-y-1 text-[10px]">
                    <span className="font-bold text-slate-800 block">{ev.author}</span>
                    <p className="text-slate-500 line-clamp-1 leading-normal">{ev.note}</p>
                    <span className="font-mono text-slate-400 text-[8px] block">{ev.timestamp}</span>
                  </div>
                </div>
              ))}
              <div className="border-2 border-dashed border-slate-200 hover:border-emerald-300 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-1 bg-slate-50/50 cursor-pointer transition-all">
                <Plus className="w-5 h-5 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-600">Attach Evidence</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (4/12 spacing on desktop) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Verification / Support controls */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-4 shadow-md">
            <div>
              <div className="flex justify-between text-emerald-400 font-mono text-[9px] uppercase tracking-wider mb-1">
                <span>Trust Score Index</span>
                <span>{trustScorePercentage}% Credibility</span>
              </div>
              <div className="w-full bg-slate-850 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${trustScorePercentage}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <button 
                onClick={() => onVerifyVote(currentIssue.id, 'upvote')}
                className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Upvote ({currentIssue.upvotes})</span>
              </button>

              <button 
                onClick={() => onVerifyVote(currentIssue.id, 'downvote')}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-slate-700"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                <span>Flag ({currentIssue.downvotes})</span>
              </button>
            </div>

            <button 
              onClick={() => onSupportIssue(currentIssue.id)}
              className="w-full py-2.5 px-4 bg-white hover:bg-rose-50 text-slate-900 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Heart className="w-4 h-4 fill-rose-600 text-rose-600" />
              <span>Support Urban Escalation</span>
            </button>
          </div>

          {/* Assigned Department Checklist */}
          {currentIssue.advisor && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-xs font-mono font-extrabold uppercase tracking-wider text-slate-400">Assigned Dispatch Triage</h3>
                  <span className="px-2 py-0.5 bg-emerald-150 text-emerald-800 text-[8px] font-mono font-black rounded-sm uppercase tracking-wider">
                    {currentIssue.advisor.departmentStatus || 'Active Dispatch'}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 leading-normal">{currentIssue.advisor.department}</h4>
              </div>

              {/* Mock Officer Profile */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-2.5">
                <img 
                  src={currentIssue.advisor.officerAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} 
                  alt="Dispatch Officer" 
                  className="w-9 h-9 rounded-full object-cover border border-slate-250 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="text-xs space-y-0.5 min-w-0">
                  <span className="text-[7.5px] font-mono font-bold text-slate-400 block uppercase tracking-wider">Nodal Officer In-Charge</span>
                  <span className="font-extrabold text-slate-800 block truncate">{currentIssue.advisor.officerName || "Er. S. Meenakshi (AE)"}</span>
                  <span className="text-[9px] text-slate-500 block truncate">GCC Desk: +91 44 2242 1100</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-500">
                <div className="bg-slate-50 p-2 rounded-lg">
                  <div>DISPATCH TIER</div>
                  <div className="font-bold text-rose-600 uppercase mt-0.5">{currentIssue.advisor.priority}</div>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <div>REPAIR SLA</div>
                  <div className="font-bold text-slate-700 uppercase mt-0.5">{currentIssue.advisor.timeline}</div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[9px] uppercase font-mono font-bold text-slate-400">Action Plan (Dispatched)</span>
                <div className="space-y-2 text-xs">
                  {currentIssue.advisor.actions.map((act, index) => (
                    <div key={index} className="flex gap-2 items-start bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                      <span className="w-4.5 h-4.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-slate-600 leading-relaxed leading-normal">{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Discussion comments thread */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-mono font-extrabold uppercase tracking-wider text-slate-400">Citizen Comments</h3>
            
            <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
              {detailedComments.map(c => (
                <div key={c.id} className="space-y-1 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-slate-800">{c.userName}</span>
                    <span className="text-slate-400 font-mono">{new Date(c.timestamp).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-normal">{c.content}</p>
                </div>
              ))}

              {detailedComments.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-400 italic">
                  No discussions logged yet. Leave an inspection update below!
                </div>
              )}
            </div>

            {/* Post comment form */}
            <form onSubmit={handlePostComment} className="pt-2 border-t border-slate-100 flex gap-2">
              <input 
                type="text" 
                placeholder="Write update comment..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
              <button 
                type="submit"
                className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Similar Nearby Issues directory */}
          {nearbyIssues.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">Nearby Similar Concerns</h4>
              <div className="space-y-3">
                {nearbyIssues.map(near => (
                  <div 
                    key={near.id}
                    onClick={() => onViewIssue(near.id)}
                    className="p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-200/80 cursor-pointer flex gap-3 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-lg bg-slate-100 shrink-0 overflow-hidden">
                      <img src={near.image} alt={near.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <h5 className="text-xs font-bold text-slate-800 line-clamp-1">{near.title}</h5>
                      <span className="text-[9px] font-mono text-slate-400 block uppercase leading-none">{near.address.split(',')[0]}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 align-middle self-center" />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
