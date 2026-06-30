import React, { useState } from 'react';
import { Award, ShieldCheck, Droplet, Trash2, Compass, Zap, Flame, Sparkles, Star } from 'lucide-react';
import { User, Badge } from '../types';

interface CitizenLeaderboardProps {
  users: User[];
  currentUser: User | null;
}

const BADGES_LIST: Badge[] = [
  {
    id: "community-hero",
    name: "Community Hero",
    description: "Awarded to citizens with supreme civic action, high reputation, and 20+ verified community reports.",
    iconName: "Award",
    requirement: "20+ reports approved by community consensus."
  },
  {
    id: "street-guardian",
    name: "Street Guardian",
    description: "Earned by identifying and resolving structural road hazards like potholes, loose signs, or damaged sidewalks.",
    iconName: "Compass",
    requirement: "Submit or verify 5+ roadway issues."
  },
  {
    id: "water-warrior",
    name: "Water Warrior",
    description: "Awarded for rapid logging of high-severity municipal plumbing leaks, burst mains, or sewer concerns.",
    iconName: "Droplet",
    requirement: "First responder on critical water infrastructure issues."
  },
  {
    id: "cleanliness-champion",
    name: "Cleanliness Champion",
    description: "Earned for cataloging garbage buildup, public dumping zones, and tracking their clean-up success.",
    iconName: "Trash2",
    requirement: "Report or coordinate resolution of 5 waste dumps."
  },
  {
    id: "civic-champion",
    name: "Civic Champion",
    description: "Awarded for exceptional validation feedback, helping city planners coordinate emergency teams rapidly.",
    iconName: "ShieldCheck",
    requirement: "Achieve over 100 community verifications."
  }
];

export default function CitizenLeaderboard({ users, currentUser }: CitizenLeaderboardProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Sort users by reputation score (descending)
  const sortedUsers = [...users].sort((a, b) => b.reputationScore - a.reputationScore);

  const getBadgeIcon = (id: string, size = "w-4 h-4") => {
    switch (id) {
      case "community-hero": return <Award className={`${size} text-amber-500`} />;
      case "street-guardian": return <Compass className={`${size} text-indigo-500`} />;
      case "water-warrior": return <Droplet className={`${size} text-sky-500`} />;
      case "cleanliness-champion": return <Trash2 className={`${size} text-emerald-500`} />;
      case "civic-champion": return <ShieldCheck className={`${size} text-rose-500`} />;
      default: return <Star className={`${size} text-amber-400`} />;
    }
  };

  const podiumUsers = sortedUsers.slice(0, 3);
  const remainingUsers = sortedUsers.slice(3);

  return (
    <div id="leaderboard-section" className="space-y-8 animate-in fade-in duration-200">
      
      {/* Overview Card / Hero banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 md:p-8 border border-slate-800 shadow-md">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            Citizen Engagement System
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight font-sans">
            Local Heroes & Community Ranks
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Welcome to the heartbeat of Indian Smart Cities initiatives. These top contributors represent citizens actively auditing roads, water leakages, waste piles, and lighting malfunctions to protect their neighborhoods.
          </p>
          <div className="flex flex-wrap gap-6 pt-2 font-mono text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">+{users.reduce((sum, u) => sum + u.reportsSubmitted, 0)}</span> Reports Filed
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">+{users.reduce((sum, u) => sum + u.verificationsCompleted, 0)}</span> Verifications Made
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-emerald-400">98%</span> Civic Success rate
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Leaderboard Podium & list */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Podium layout */}
          <div className="grid grid-cols-3 gap-3 md:gap-4 items-end pt-8">
            {/* 2nd Place */}
            {podiumUsers[1] && (
              <div 
                className="bg-white border border-slate-200/60 rounded-2xl p-3 md:p-5 text-center shadow-xs cursor-pointer hover:border-slate-300 transition-all"
                onClick={() => setSelectedUser(podiumUsers[1])}
              >
                <div className="relative mx-auto w-12 h-12 md:w-16 md:h-16 mb-2">
                  <img src={podiumUsers[1].avatar} alt={podiumUsers[1].name} className="w-full h-full object-cover rounded-full border-2 border-slate-300" referrerPolicy="no-referrer" />
                  <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-slate-300 text-slate-800 text-xs font-bold border-2 border-white flex items-center justify-center">
                    2
                  </span>
                </div>
                <h3 className="text-xs md:text-sm font-bold text-slate-800 truncate">{podiumUsers[1].name}</h3>
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{podiumUsers[1].role}</p>
                <div className="mt-2 text-xs md:text-sm font-mono font-bold text-slate-600">
                  {podiumUsers[1].reputationScore} <span className="text-[9px] text-slate-400 font-sans font-normal">pts</span>
                </div>
              </div>
            )}

            {/* 1st Place */}
            {podiumUsers[0] && (
              <div 
                className="bg-white border-2 border-amber-300/80 rounded-2xl p-4 md:p-6 text-center shadow-md relative -translate-y-4 cursor-pointer hover:border-amber-400 transition-all"
                onClick={() => setSelectedUser(podiumUsers[0])}
              >
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <Award className="w-8 h-8 text-amber-500 filter drop-shadow-sm" />
                </div>
                <div className="relative mx-auto w-16 h-16 md:w-20 md:h-20 mb-2">
                  <img src={podiumUsers[0].avatar} alt={podiumUsers[0].name} className="w-full h-full object-cover rounded-full border-4 border-amber-200" referrerPolicy="no-referrer" />
                  <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-7 h-7 rounded-full bg-amber-400 text-amber-950 text-xs font-extrabold border-2 border-white flex items-center justify-center">
                    1
                  </span>
                </div>
                <h3 className="text-sm md:text-base font-bold text-slate-800 truncate">{podiumUsers[0].name}</h3>
                <p className="text-[10px] font-mono text-emerald-600 font-bold uppercase tracking-wider">{podiumUsers[0].role}</p>
                <div className="mt-2 text-sm md:text-lg font-mono font-extrabold text-amber-600">
                  {podiumUsers[0].reputationScore} <span className="text-[9px] text-slate-400 font-sans font-normal">pts</span>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {podiumUsers[2] && (
              <div 
                className="bg-white border border-slate-200/60 rounded-2xl p-3 md:p-5 text-center shadow-xs cursor-pointer hover:border-slate-300 transition-all"
                onClick={() => setSelectedUser(podiumUsers[2])}
              >
                <div className="relative mx-auto w-12 h-12 md:w-16 md:h-16 mb-2">
                  <img src={podiumUsers[2].avatar} alt={podiumUsers[2].name} className="w-full h-full object-cover rounded-full border-2 border-amber-700/50" referrerPolicy="no-referrer" />
                  <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-amber-700 text-amber-50 text-xs font-bold border-2 border-white flex items-center justify-center">
                    3
                  </span>
                </div>
                <h3 className="text-xs md:text-sm font-bold text-slate-800 truncate">{podiumUsers[2].name}</h3>
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{podiumUsers[2].role}</p>
                <div className="mt-2 text-xs md:text-sm font-mono font-bold text-slate-600">
                  {podiumUsers[2].reputationScore} <span className="text-[9px] text-slate-400 font-sans font-normal">pts</span>
                </div>
              </div>
            )}
          </div>

          {/* List display of other citizens */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex justify-between text-xs font-bold text-slate-500 font-mono tracking-wider">
              <span>RANK & CITIZEN NAME</span>
              <div className="flex gap-8 text-right pr-4">
                <span>REPORTS</span>
                <span>AUDITS</span>
                <span>REPUTATION</span>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {remainingUsers.map((user, idx) => {
                const rank = idx + 4;
                const isCurrent = currentUser?.id === user.id;
                return (
                  <div 
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors cursor-pointer ${isCurrent ? 'bg-emerald-50/20' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-slate-400 w-5 text-center">
                        {rank}
                      </span>
                      <img src={user.avatar} alt={user.name} className="w-9 h-9 object-cover rounded-full" referrerPolicy="no-referrer" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          {user.name}
                          {isCurrent && <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[8px] uppercase tracking-wider font-bold rounded-sm">You</span>}
                        </h4>
                        <div className="flex gap-1.5 mt-1">
                          {user.earnedBadges.slice(0, 3).map(badgeId => (
                            <span key={badgeId} title={badgeId} className="p-0.5 bg-slate-100 rounded-md">
                              {getBadgeIcon(badgeId, "w-3.5 h-3.5")}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-8 text-right font-mono text-xs font-bold text-slate-700 pr-4">
                      <span className="w-12 text-slate-400">{user.reportsSubmitted}</span>
                      <span className="w-12 text-slate-400">{user.verificationsCompleted}</span>
                      <span className="w-16 text-emerald-600">{user.reputationScore}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. Side Panel - Badges and User Inspect Card */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* User Inspection Modal/Card */}
          {selectedUser && (
            <div className="bg-white rounded-2xl border-2 border-emerald-600/20 p-5 shadow-md animate-in slide-in-from-right duration-200">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[9px] uppercase font-mono font-bold tracking-wider bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-100">
                  Citizen Inspector View
                </span>
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  Close
                </button>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <img src={selectedUser.avatar} alt={selectedUser.name} className="w-14 h-14 object-cover rounded-full border border-slate-200" referrerPolicy="no-referrer" />
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{selectedUser.name}</h3>
                  <p className="text-[10px] text-slate-400 font-mono">{selectedUser.email}</p>
                  <p className="text-xs font-bold text-emerald-600 mt-1">{selectedUser.role}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-center font-mono text-xs mb-4">
                <div>
                  <div className="text-[9px] text-slate-400">REPORTS</div>
                  <div className="font-bold text-slate-800 text-sm mt-0.5">{selectedUser.reportsSubmitted}</div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-400">AUDITS</div>
                  <div className="font-bold text-slate-800 text-sm mt-0.5">{selectedUser.verificationsCompleted}</div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-400">SCORE</div>
                  <div className="font-bold text-emerald-600 text-sm mt-0.5">{selectedUser.reputationScore}</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] uppercase tracking-wider font-mono font-bold text-slate-400">Earned Smart City Badges</h4>
                {selectedUser.earnedBadges.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No badges earned yet. Auditing more complaints unlocks badges!</p>
                ) : (
                  <div className="space-y-1.5">
                    {selectedUser.earnedBadges.map(badgeId => {
                      const badge = BADGES_LIST.find(b => b.id === badgeId);
                      return (
                        <div key={badgeId} className="flex items-center gap-2 p-1.5 bg-slate-50/50 rounded-lg border border-slate-100 text-xs">
                          {getBadgeIcon(badgeId, "w-4 h-4 shrink-0")}
                          <div className="truncate">
                            <span className="font-bold text-slate-800">{badge?.name || badgeId}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Badge Reference Directory */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-sans flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-emerald-600" />
                Municipal Badge System
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Learn how citizens unlock honors by assisting urban inspection pipelines.</p>
            </div>

            <div className="space-y-4">
              {BADGES_LIST.map((badge) => (
                <div key={badge.id} className="flex items-start gap-3 p-3 bg-slate-50/30 rounded-xl border border-slate-100">
                  <div className="p-1.5 bg-white rounded-lg shadow-2xs shrink-0 mt-0.5">
                    {getBadgeIcon(badge.id, "w-5 h-5")}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-800">{badge.name}</h4>
                    <p className="text-[11px] text-slate-500 leading-normal">{badge.description}</p>
                    <div className="text-[9px] font-mono font-bold text-emerald-600 uppercase bg-emerald-50/60 inline-block px-1.5 py-0.5 rounded-sm">
                      Req: {badge.requirement}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
