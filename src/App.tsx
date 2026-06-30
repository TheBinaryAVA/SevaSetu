import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  Bell, 
  User, 
  Activity, 
  Award, 
  Camera, 
  Layers, 
  CheckCircle2, 
  ArrowLeft,
  X,
  Info,
  Sparkles,
  RefreshCw,
  Sliders,
  Globe
} from 'lucide-react';

import { User as UserType, Issue, Comment, Notification, RiskPrediction, CommunityStats } from './types';

// Import our modularized civic components
import CommandCenter from './components/CommandCenter';
import LiveFeed from './components/LiveFeed';
import InteractiveMap from './components/InteractiveMap';
import ReportForm from './components/ReportForm';
import IssueDetails from './components/IssueDetails';
import CitizenLeaderboard from './components/CitizenLeaderboard';

const INDIAN_CITIES = [
  { name: "Chennai", localities: ["Anna Nagar", "Adyar", "Velachery", "OMR", "T Nagar"], coords: { lat: 13.0827, lng: 80.2707 } },
  { name: "Bengaluru", localities: ["Koramangala", "Indiranagar", "HSR Layout", "Whitefield"], coords: { lat: 12.9716, lng: 77.5946 } },
  { name: "Hyderabad", localities: ["Jubilee Hills", "Gachibowli", "Madhapur"], coords: { lat: 17.3850, lng: 78.4867 } },
  { name: "Mumbai", localities: ["Bandra West", "Andheri West", "Colaba"], coords: { lat: 19.0760, lng: 72.8777 } },
  { name: "Pune", localities: ["Koregaon Park", "Kothrud", "Viman Nagar"], coords: { lat: 18.5204, lng: 73.8567 } }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'feed' | 'map' | 'submit' | 'leaderboard'>('home');
  const [detailedIssueId, setDetailedIssueId] = useState<string | null>(null);

  // Global App States
  const [users, setUsers] = useState<UserType[]>([]);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [riskPredictions, setRiskPredictions] = useState<RiskPrediction[]>([]);

  // Selection states
  const [selectedCity, setSelectedCity] = useState<string>('Chennai');
  const [selectedLocality, setSelectedLocality] = useState<string>('Anna Nagar');

  // UI overlays
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showUserProfilePanel, setShowUserProfilePanel] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // 1. Initial Load of Database API endpoints
  const loadAllData = async () => {
    try {
      // Load users
      const usersRes = await fetch('/api/users');
      const usersData = await usersRes.json();
      setUsers(usersData);
      
      // Auto-set standard user Arjun Sharma (user-3) on first boot
      if (!currentUser && usersData.length > 0) {
        const arjun = usersData.find((u: any) => u.name.includes("Arjun")) || usersData[2] || usersData[0];
        setCurrentUser(arjun);
      }

      // Load issues
      const issuesRes = await fetch('/api/issues');
      const issuesData = await issuesRes.json();
      setIssues(issuesData);

      // Load stats
      const statsRes = await fetch('/api/stats');
      const statsData = await statsRes.json();
      setStats(statsData);

      // Load risk forecasts
      const intelRes = await fetch('/api/civic-intelligence');
      const intelData = await intelRes.json();
      setRiskPredictions(intelData.riskPredictions || []);

      // Load notifications
      const notifRes = await fetch('/api/notifications');
      const notifData = await notifRes.json();
      setNotifications(notifData);

      // Load comments for current selected detailed issue if open
      if (detailedIssueId) {
        const commRes = await fetch(`/api/issues/${detailedIssueId}/comments`);
        const commData = await commRes.json();
        setComments(commData);
      } else {
        // Load all comments historically to avoid null arrays
        const commentsPromises = issuesData.map((i: any) => fetch(`/api/issues/${i.id}/comments`).then(r => r.json()));
        const resolvedComments = await Promise.all(commentsPromises);
        setComments(resolvedComments.flat());
      }

    } catch (err) {
      console.error("Failed to load platform data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [detailedIssueId]);

  // Synchronize location changes
  const handleCityLocalityChange = (city: string, locality: string) => {
    setSelectedCity(city);
    setSelectedLocality(locality);
  };

  // 2. Core Community Verification Vote action (Requirement 8)
  const handleVerifyVote = async (issueId: string, type: 'upvote' | 'downvote') => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/issues/${issueId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          type,
          comment: type === 'upvote' 
            ? "Ground inspection verified. This hazard exists and requires repair." 
            : "Inaccurate report. Unable to find the matching issue on-site."
        })
      });

      if (res.ok) {
        // Trigger alert confirmation
        const pointGain = type === 'upvote' ? 10 : 5;
        // Reload states
        await loadAllData();
      }
    } catch (err) {
      console.error("Failed to register verification audit:", err);
    }
  };

  // Support / Upvote issue escalation (Requirement 1 & 8)
  const handleSupportIssue = async (issueId: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/issues/${issueId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          type: 'upvote',
          comment: "Escalated and supported this complaint. Expedite municipal dispatch!"
        })
      });

      if (res.ok) {
        await loadAllData();
      }
    } catch (err) {
      console.error("Failed to support escalation:", err);
    }
  };

  // Add Comment and attach evidence photo (Requirement 8 & 9)
  const handleAddComment = async (issueId: string, content: string, fileImage: string | null) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/issues/${issueId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          userName: currentUser.name,
          userAvatar: currentUser.avatar,
          userRole: currentUser.role,
          content,
          evidenceImage: fileImage
        })
      });

      if (res.ok) {
        await loadAllData();
      }
    } catch (err) {
      console.error("Failed to write inspection comment:", err);
    }
  };

  // Toggle user profiles to inspect role matrices (Admin vs Citizen)
  const handleSwitchUser = (user: UserType) => {
    setCurrentUser(user);
    setShowUserProfilePanel(false);
  };

  // Clear notifications read state
  const handleMarkNotificationsRead = async () => {
    try {
      const unread = notifications.filter(n => !n.read);
      const readPromises = unread.map(n => 
        fetch(`/api/notifications/${n.id}/read`, { method: 'POST' })
      );
      await Promise.all(readPromises);
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to read alerts:", err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col justify-between font-sans selection:bg-emerald-200">
      
      {/* 1. Global Navigation Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer shrink-0" onClick={() => { setDetailedIssueId(null); setActiveTab('home'); }}>
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
              <Globe className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-slate-800 tracking-tight leading-none">CiviShield</h1>
              <span className="text-[9px] font-mono font-bold text-emerald-600 uppercase tracking-widest block mt-1">Smart-City GIS Portal</span>
            </div>
          </div>

          {/* Center: Global Region/City Selectors */}
          <div className="hidden md:flex items-center gap-3 bg-slate-50 border border-slate-150 rounded-xl p-1 px-2.5">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Region:</span>
            <select 
              value={selectedCity}
              onChange={(e) => {
                const targetCity = e.target.value;
                const targetLocality = INDIAN_CITIES.find(c => c.name === targetCity)?.localities[0] || '';
                handleCityLocalityChange(targetCity, targetLocality);
              }}
              className="bg-transparent border-none text-xs font-bold text-slate-700 focus:outline-hidden cursor-pointer"
            >
              {INDIAN_CITIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
            <span className="text-slate-300">|</span>
            <select 
              value={selectedLocality}
              onChange={(e) => handleCityLocalityChange(selectedCity, e.target.value)}
              className="bg-transparent border-none text-xs font-semibold text-slate-500 focus:outline-hidden cursor-pointer"
            >
              {INDIAN_CITIES.find(c => c.name === selectedCity)?.localities.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* Right Controls (Alerts Bell & Identity Panel Switcher) */}
          <div className="flex items-center gap-3">
            
            {/* Notification Alert Trigger */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) handleMarkNotificationsRead();
                }}
                className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors relative"
              >
                <Bell className="w-4.5 h-4.5 text-slate-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
                )}
              </button>

              {/* Alerts Box Slide-out Overlay */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-4 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800">
                    <span className="text-xs font-bold font-mono tracking-wider">MUNICIPAL ALERTS</span>
                    <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div key={notif.id} className="p-3.5 hover:bg-slate-50 transition-colors text-xs space-y-1">
                        <h4 className="font-bold text-slate-800 flex items-center gap-1.5">{notif.title}</h4>
                        <p className="text-slate-500 leading-normal">{notif.message}</p>
                        <span className="text-[8px] font-mono text-slate-400 block">{new Date(notif.timestamp).toLocaleTimeString()}</span>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <p className="p-6 text-center text-slate-400 italic">No alerts logged.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Identity switcher */}
            <div className="relative">
              <button 
                onClick={() => setShowUserProfilePanel(!showUserProfilePanel)}
                className="flex items-center gap-2 p-1 pr-2.5 bg-slate-50 hover:bg-slate-100 rounded-full border border-slate-200 transition-all cursor-pointer"
              >
                <img 
                  src={currentUser?.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150"} 
                  alt={currentUser?.name} 
                  className="w-7 h-7 object-cover rounded-full border border-slate-200" 
                  referrerPolicy="no-referrer"
                />
                <span className="text-xs font-bold text-slate-700 hidden sm:inline truncate max-w-[80px]">
                  {currentUser?.name.split(' ')[0]}
                </span>
              </button>

              {/* Switch profile drawer panel */}
              {showUserProfilePanel && (
                <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50 animate-in fade-in duration-150">
                  <div className="p-4 bg-slate-50 border-b border-slate-150">
                    <span className="text-[9px] uppercase font-mono tracking-wider font-extrabold text-slate-400">Citizen Identity Matrix</span>
                    <p className="text-xs text-slate-500 mt-0.5">Toggle identities to inspect roles.</p>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                    {users.map((u) => (
                      <div 
                        key={u.id}
                        onClick={() => handleSwitchUser(u)}
                        className={`p-3 hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer ${currentUser?.id === u.id ? 'bg-emerald-50/40' : ''}`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
                          <div className="truncate text-xs">
                            <h4 className="font-bold text-slate-800">{u.name}</h4>
                            <span className="text-slate-400 font-mono text-[9px]">{u.role}</span>
                          </div>
                        </div>
                        <span className="font-mono text-[10px] font-bold text-emerald-600 shrink-0 pr-2">
                          {u.reputationScore} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </header>

      {/* 2. Primary Layout Workspace Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {/* Tab Selection Row (Only visible when not looking at specific detailed complaints) */}
        {!detailedIssueId && (
          <nav className="flex flex-wrap gap-2 pb-2 border-b border-slate-200/80">
            <button 
              onClick={() => setActiveTab('home')}
              className={`py-2 px-4 rounded-xl text-xs font-bold font-sans transition-all flex items-center gap-2 ${activeTab === 'home' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-600'}`}
            >
              <Globe className="w-4 h-4" />
              Command Center
            </button>
            <button 
              onClick={() => setActiveTab('feed')}
              className={`py-2 px-4 rounded-xl text-xs font-bold font-sans transition-all flex items-center gap-2 ${activeTab === 'feed' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-600'}`}
            >
              <Activity className="w-4 h-4" />
              Live Issues Feed
            </button>
            <button 
              onClick={() => setActiveTab('map')}
              className={`py-2 px-4 rounded-xl text-xs font-bold font-sans transition-all flex items-center gap-2 ${activeTab === 'map' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-600'}`}
            >
              <Layers className="w-4 h-4" />
              Civic Live Map
            </button>
            <button 
              onClick={() => setActiveTab('submit')}
              className={`py-2 px-4 rounded-xl text-xs font-bold font-sans transition-all flex items-center gap-2 ${activeTab === 'submit' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-600'}`}
            >
              <Camera className="w-4 h-4" />
              Submit Field Report
            </button>
            <button 
              onClick={() => setActiveTab('leaderboard')}
              className={`py-2 px-4 rounded-xl text-xs font-bold font-sans transition-all flex items-center gap-2 ${activeTab === 'leaderboard' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-600'}`}
            >
              <Award className="w-4 h-4" />
              Hero Board
            </button>
          </nav>
        )}

        {/* 3. Core Tab Views Router */}
        {loading ? (
          <div className="py-24 text-center space-y-4">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
            <p className="text-slate-500 text-xs font-bold uppercase font-mono tracking-wider">Syncing Smart City Database...</p>
          </div>
        ) : detailedIssueId ? (
          /* Deep audit complaint inspector */
          <IssueDetails 
            issueId={detailedIssueId}
            allIssues={issues}
            currentUser={currentUser}
            comments={comments}
            onBack={() => setDetailedIssueId(null)}
            onVerifyVote={handleVerifyVote}
            onSupportIssue={handleSupportIssue}
            onAddComment={handleAddComment}
            onViewIssue={(id) => setDetailedIssueId(id)}
          />
        ) : (
          /* Parent Tab Switch router */
          <>
            {activeTab === 'home' && (
              <CommandCenter 
                stats={stats}
                issues={issues}
                riskPredictions={riskPredictions}
                onViewIssue={(id) => setDetailedIssueId(id)}
                onNavigateToTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'feed' && (
              <LiveFeed 
                issues={issues}
                currentUser={currentUser}
                onViewIssue={(id) => setDetailedIssueId(id)}
                onVerifyVote={handleVerifyVote}
                onSupportIssue={handleSupportIssue}
              />
            )}

            {activeTab === 'map' && (
              <InteractiveMap 
                issues={issues}
                selectedCity={selectedCity}
                selectedLocality={selectedLocality}
                onViewIssue={(id) => setDetailedIssueId(id)}
              />
            )}

            {activeTab === 'submit' && (
              <ReportForm 
                currentUser={currentUser}
                selectedCity={selectedCity}
                selectedLocality={selectedLocality}
                onCityLocalityChange={handleCityLocalityChange}
                onSubmitSuccess={() => {
                  setDetailedIssueId(null);
                  setActiveTab('feed');
                  loadAllData();
                }}
                onCancel={() => setActiveTab('home')}
              />
            )}

            {activeTab === 'leaderboard' && (
              <CitizenLeaderboard 
                users={users}
                currentUser={currentUser}
              />
            )}
          </>
        )}

      </main>

      {/* 4. Global Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 text-center mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-[11px] font-mono text-slate-500 space-y-1">
          <p>© 2026 CiviShield Platform. Built for Indian Smart Cities Mission initiatives.</p>
          <p className="text-slate-600">Active Nodes: Chennai, Bengaluru, Hyderabad, Mumbai, Pune • Secured with AI-Agentic Audit Pipelines</p>
        </div>
      </footer>

    </div>
  );
}
