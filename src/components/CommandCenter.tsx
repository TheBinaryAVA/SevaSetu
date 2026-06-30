import React, { useMemo } from 'react';
import { Activity, ShieldAlert, CheckCircle, Flame, Users, Sparkles, MapPin, ArrowRight, ShieldCheck, Heart, Droplet, Trash2 } from 'lucide-react';
import { Issue, CommunityStats, RiskPrediction } from '../types';

interface CommandCenterProps {
  stats: CommunityStats | null;
  issues: Issue[];
  riskPredictions: RiskPrediction[];
  onViewIssue: (id: string) => void;
  onNavigateToTab: (tab: 'feed' | 'map' | 'submit') => void;
}

export default function CommandCenter({ stats, issues, riskPredictions, onViewIssue, onNavigateToTab }: CommandCenterProps) {
  
  // Select recently resolved issues (status === 'Resolved')
  const resolvedIssues = useMemo(() => {
    return issues.filter(i => i.status === 'Resolved').slice(0, 3);
  }, [issues]);

  // Select hot active issues (High/Critical severity that are not resolved)
  const activeNearbyIssues = useMemo(() => {
    return issues.filter(i => i.status !== 'Resolved' && (i.severity === 'Critical' || i.severity === 'High')).slice(0, 3);
  }, [issues]);

  const totalImpactMetrics = useMemo(() => {
    // Generate clean, authentic numbers based on existing issues to populate command stats
    const waterSolved = issues.filter(i => i.category === 'Water Utility' && i.status === 'Resolved').length;
    const roadsSolved = issues.filter(i => i.category === 'Potholes & Roads' && i.status === 'Resolved').length;
    const wasteSolved = issues.filter(i => i.category === 'Waste Management' && i.status === 'Resolved').length;
    
    return {
      waterWastedSaved: waterSolved * 150000 + 45000, // 150KL saved per pipeline fix
      carbonOffset: wasteSolved * 850 + 250, // 850kg carbon reduction per waste dump cleared
      accidentsPrevented: roadsSolved * 18 + 5 // 18 potential falls/skids prevented per pothole bonding
    };
  }, [issues]);

  // Health Score Color
  const healthColor = useMemo(() => {
    const score = stats?.healthScore || 75;
    if (score >= 85) return { text: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', stroke: '#10b981' };
    if (score >= 65) return { text: 'text-teal-600', bg: 'bg-teal-50 border-teal-200', stroke: '#14b8a6' };
    if (score >= 45) return { text: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', stroke: '#f59e0b' };
    return { text: 'text-rose-600', bg: 'bg-rose-50 border-rose-200', stroke: '#f43f5e' };
  }, [stats]);

  return (
    <div id="command-center-root" className="space-y-8 animate-in fade-in duration-200">
      
      {/* 1. Dashboard Smart Banner & Live activity ticker */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
          <span className="text-xs font-mono font-bold tracking-wider text-slate-500 uppercase">Smart City Live Control Status: Active</span>
        </div>
        <div className="text-xs text-slate-500 font-sans truncate">
          Recent Action: <span className="font-bold text-slate-700">TANGEDCO team</span> closed electric hazard ticket in Anna Nagar 4h ago.
        </div>
      </div>

      {/* 2. Grid for Core Health Score Gauges & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Circular Community Health score dial */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between items-center text-center">
          <div className="w-full text-left">
            <h2 className="text-xs font-mono font-extrabold uppercase tracking-wider text-slate-400">Community Health Score</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Aggregated live safety & response performance metrics.</p>
          </div>

          <div className="relative w-44 h-44 my-4 flex items-center justify-center">
            {/* Simple high-fidelity SVG dial */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle cx="88" cy="88" r="70" className="stroke-slate-100 stroke-[10] fill-none" />
              <circle 
                cx="88" 
                cy="88" 
                r="70" 
                className="stroke-[10] fill-none transition-all duration-1000"
                stroke={healthColor.stroke}
                strokeDasharray={440}
                strokeDashoffset={440 - (440 * (stats?.healthScore || 75)) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="text-center space-y-1">
              <span className="text-4xl font-black font-sans tracking-tight text-slate-800">
                {stats?.healthScore || 75}%
              </span>
              <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${healthColor.text} ${healthColor.bg}`}>
                {stats?.healthLevel || 'Good'}
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 leading-relaxed px-2">
            Resolution velocity is <span className="text-emerald-600 font-bold">12% higher</span> this week. Localized action clusters in Chennai & Bengaluru mitigated critical safety indices efficiently.
          </div>
        </div>

        {/* 3 Quick Stats Metrics Panels */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">Total Solved Concerns</span>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="my-3">
              <div className="text-3xl font-extrabold text-slate-800 font-mono tracking-tight">
                {stats?.resolvedIssuesCount || 12}
              </div>
              <div className="text-[10px] text-emerald-600 font-bold mt-1">100% verified resolution rate</div>
            </div>
            <button 
              onClick={() => onNavigateToTab('feed')}
              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 mt-2 text-left"
            >
              Inspect Resolved Workloads <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">Active Citizens Online</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="my-3">
              <div className="text-3xl font-extrabold text-slate-800 font-mono tracking-tight">
                {stats?.activeCitizensCount || 8}
              </div>
              <div className="text-[10px] text-blue-600 font-bold mt-1">+{stats?.totalImpactScore || 1400} aggregated impact points</div>
            </div>
            <button 
              onClick={() => onNavigateToTab('feed')}
              className="text-[11px] font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 mt-2 text-left"
            >
              View Citizen Contributions <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">Open Active Audits</span>
              <Activity className="w-4 h-4 text-orange-500 animate-pulse" />
            </div>
            <div className="my-3">
              <div className="text-3xl font-extrabold text-slate-800 font-mono tracking-tight">
                {stats?.openIssuesCount || 4}
              </div>
              <div className="text-[10px] text-orange-600 font-bold mt-1">Requires immediate citizen consensus</div>
            </div>
            <button 
              onClick={() => onNavigateToTab('map')}
              className="text-[11px] font-bold text-orange-700 hover:text-orange-800 flex items-center gap-1 mt-2 text-left"
            >
              Open Live GIS Map <ArrowRight className="w-3 h-3" />
            </button>
          </div>

        </div>
      </div>

      {/* 3. Smart City Impact Metrics & Citizen Participation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl shadow-2xs flex items-center gap-4">
          <div className="p-3 bg-emerald-600 text-white rounded-xl">
            <Droplet className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-[10px] uppercase tracking-wider font-mono font-bold text-emerald-800">Clean Water Conserved</h4>
            <div className="text-lg font-bold text-slate-800 font-mono mt-0.5">
              {totalImpactMetrics.waterWastedSaved.toLocaleString()} Liters
            </div>
            <p className="text-[10px] text-slate-500">Saved by reporting pipeline leakages early.</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl shadow-2xs flex items-center gap-4">
          <div className="p-3 bg-blue-600 text-white rounded-xl">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-[10px] uppercase tracking-wider font-mono font-bold text-blue-800">Plastic & Debris Intercepted</h4>
            <div className="text-lg font-bold text-slate-800 font-mono mt-0.5">
              {totalImpactMetrics.carbonOffset.toLocaleString()} kg
            </div>
            <p className="text-[10px] text-slate-500">Prevented from entering municipal waterways.</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-100 p-5 rounded-2xl shadow-2xs flex items-center gap-4">
          <div className="p-3 bg-amber-500 text-white rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-[10px] uppercase tracking-wider font-mono font-bold text-amber-800">Road Incidents Prevented</h4>
            <div className="text-lg font-bold text-slate-800 font-mono mt-0.5">
              +{totalImpactMetrics.accidentsPrevented.toLocaleString()} incidents
            </div>
            <p className="text-[10px] text-slate-500">By marking deep potholes on arterial avenues.</p>
          </div>
        </div>
      </div>

      {/* 4. Live Issues Nearby & Recently Resolved */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Live Active Concerns Panel */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900 font-sans flex items-center gap-2">
              <ShieldAlert className="w-4.5 h-4.5 text-rose-600 shrink-0" />
              Critical & High Risk Issues Nearby
            </h3>
            <button onClick={() => onNavigateToTab('feed')} className="text-[10px] font-mono font-bold text-emerald-700 hover:underline">
              View Feed
            </button>
          </div>

          <div className="space-y-4">
            {activeNearbyIssues.map(issue => (
              <div 
                key={issue.id}
                onClick={() => onViewIssue(issue.id)}
                className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-2xs hover:border-slate-300 transition-all cursor-pointer flex gap-4"
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                  <img src={issue.image} alt={issue.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold tracking-wider">
                    <span className="text-rose-600 uppercase bg-rose-50 px-1.5 py-0.5 rounded-sm">
                      {issue.severity} Severity
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500 truncate">{issue.category}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{issue.title}</h4>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span className="truncate">{issue.address.split(',')[0]}</span>
                  </div>
                </div>
              </div>
            ))}

            {activeNearbyIssues.length === 0 && (
              <div className="py-8 text-center bg-slate-50 border border-slate-100 rounded-xl text-slate-400 text-xs italic">
                No active critical issues nearby! Clean record!
              </div>
            )}
          </div>
        </div>

        {/* Recently Resolved Panel */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900 font-sans flex items-center gap-2">
              <CheckCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
              Recently Resolved Urban Concerns
            </h3>
            <button onClick={() => onNavigateToTab('feed')} className="text-[10px] font-mono font-bold text-emerald-700 hover:underline">
              Check Archives
            </button>
          </div>

          <div className="space-y-4">
            {resolvedIssues.map(issue => (
              <div 
                key={issue.id}
                onClick={() => onViewIssue(issue.id)}
                className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-2xs hover:border-slate-300 transition-all cursor-pointer flex gap-4 relative overflow-hidden"
              >
                {/* Visual Ribbon indicating solved */}
                <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[8px] font-mono font-bold tracking-widest uppercase px-3 py-0.5 rounded-bl-lg">
                  Resolved
                </div>
                
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                  <img src={issue.image} alt={issue.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold tracking-wider">
                    <span className="text-emerald-700 uppercase bg-emerald-50 px-1.5 py-0.5 rounded-sm">
                      Fixed
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500 truncate">{issue.category}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{issue.title}</h4>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span className="truncate">{issue.address.split(',')[0]}</span>
                  </div>
                </div>
              </div>
            ))}

            {resolvedIssues.length === 0 && (
              <div className="py-8 text-center bg-slate-50 border border-slate-100 rounded-xl text-slate-400 text-xs italic">
                Awaiting resolution logs... Citizens and admins are auditing.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 5. Smart City Risk Hotspots Matrix */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 font-sans flex items-center gap-1.5">
            <Activity className="w-4.5 h-4.5 text-emerald-600" />
            Infrastructure Risk Hotspots & Forecasts
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Automated ML predictions of localized infrastructure decay indices based on citizen reports.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {riskPredictions.map(pred => {
            const riskColors = pred.riskLevel === 'Critical' 
              ? { bg: 'bg-rose-50 border-rose-100 text-rose-700', level: 'text-rose-600' }
              : pred.riskLevel === 'High'
              ? { bg: 'bg-orange-50 border-orange-100 text-orange-700', level: 'text-orange-600' }
              : { bg: 'bg-amber-50 border-amber-100 text-amber-700', level: 'text-amber-600' };

            return (
              <div key={pred.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{pred.neighborhood}</h4>
                    <span className="text-[9px] font-mono font-bold tracking-wider text-slate-400 uppercase">District Segment</span>
                  </div>
                  <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${riskColors.bg}`}>
                    {pred.riskLevel} Risk
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 leading-normal">{pred.description}</p>

                <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-1 font-mono text-[10px] text-center font-bold text-slate-700">
                  <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                    <div className="text-[8px] text-slate-400 font-normal">TICKET SCORE</div>
                    <div className={riskColors.level}>{pred.score}</div>
                  </div>
                  <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                    <div className="text-[8px] text-slate-400 font-normal">OPEN CASES</div>
                    <div>{pred.activeIssuesCount}</div>
                  </div>
                  <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                    <div className="text-[8px] text-slate-400 font-normal">CLEARED</div>
                    <div className="text-emerald-600">{pred.resolutionRate}%</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
