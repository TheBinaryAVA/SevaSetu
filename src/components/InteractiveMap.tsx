import React, { useState, useMemo } from 'react';
import { MapPin, Sliders, Layers, Info, Check, Eye } from 'lucide-react';
import { Issue } from '../types';

interface InteractiveMapProps {
  issues: Issue[];
  selectedCity: string;
  selectedLocality: string;
  onViewIssue: (issueId: string) => void;
}

export default function InteractiveMap({ issues, selectedCity, selectedLocality, onViewIssue }: InteractiveMapProps) {
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterSeverity, setFilterSeverity] = useState<string>('All');
  const [useClustering, setUseClustering] = useState<boolean>(false);
  const [hoveredIssue, setHoveredIssue] = useState<Issue | null>(null);
  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lng: number }>({ lat: 13.0827, lng: 80.2707 });

  // Map limits based on selected city for coordinate projection
  const cityBounds = useMemo(() => {
    switch (selectedCity) {
      case 'Chennai':
        return { latMin: 12.95, latMax: 13.15, lngMin: 80.15, lngMax: 80.30, center: { lat: 13.0827, lng: 80.2707 } };
      case 'Bengaluru':
        return { latMin: 12.85, latMax: 13.05, lngMin: 77.50, lngMax: 77.70, center: { lat: 12.9716, lng: 77.5946 } };
      case 'Hyderabad':
        return { latMin: 17.30, latMax: 17.50, lngMin: 78.35, lngMax: 78.55, center: { lat: 17.3850, lng: 78.4867 } };
      case 'Mumbai':
        return { latMin: 18.90, latMax: 19.15, lngMin: 72.75, lngMax: 72.95, center: { lat: 19.0760, lng: 72.8777 } };
      case 'Pune':
        return { latMin: 18.40, latMax: 18.60, lngMin: 73.75, lngMax: 73.95, center: { lat: 18.5204, lng: 73.8567 } };
      default:
        return { latMin: 12.95, latMax: 13.15, lngMin: 80.15, lngMax: 80.30, center: { lat: 13.0827, lng: 80.2707 } };
    }
  }, [selectedCity]);

  // Project lat/lng coordinates to 0-100% SVG coordinates
  const projectCoords = (lat: number, lng: number) => {
    const { latMin, latMax, lngMin, lngMax } = cityBounds;
    // Map lng to X (horizontal) and lat to Y (vertical, inverted because Y goes down)
    const x = ((lng - lngMin) / (lngMax - lngMin)) * 100;
    const y = (1 - (lat - latMin) / (latMax - latMin)) * 100;
    return { 
      x: Math.max(5, Math.min(95, x)), 
      y: Math.max(5, Math.min(95, y)) 
    };
  };

  // Filter issues belonging to current selected city and selected criteria
  const mappedIssues = useMemo(() => {
    return issues.filter(issue => {
      const isSameCity = issue.address.toLowerCase().includes(selectedCity.toLowerCase());
      const matchesCategory = filterCategory === 'All' || issue.category === filterCategory;
      const matchesSeverity = filterSeverity === 'All' || issue.severity === filterSeverity;
      return isSameCity && matchesCategory && matchesSeverity;
    });
  }, [issues, selectedCity, filterCategory, filterSeverity]);

  // Simulated clustering
  const clusteredItems = useMemo(() => {
    if (!useClustering) return mappedIssues.map(i => ({ type: 'single' as const, issue: i, x: projectCoords(i.lat, i.lng).x, y: projectCoords(i.lat, i.lng).y }));

    // Very simple spatial clustering grid
    const clusters: { [key: string]: Issue[] } = {};
    const clusterGridSize = 15; // Percent distance to merge

    mappedIssues.forEach(issue => {
      const { x, y } = projectCoords(issue.lat, issue.lng);
      const gridX = Math.round(x / clusterGridSize);
      const gridY = Math.round(y / clusterGridSize);
      const key = `${gridX}_${gridY}`;
      if (!clusters[key]) {
        clusters[key] = [];
      }
      clusters[key].push(issue);
    });

    const result: any[] = [];
    Object.entries(clusters).forEach(([key, items]) => {
      if (items.length === 1) {
        const i = items[0];
        result.push({ type: 'single', issue: i, x: projectCoords(i.lat, i.lng).x, y: projectCoords(i.lat, i.lng).y });
      } else {
        // Average the positions
        let avgX = 0;
        let avgY = 0;
        items.forEach(i => {
          const { x, y } = projectCoords(i.lat, i.lng);
          avgX += x;
          avgY += y;
        });
        avgX /= items.length;
        avgY /= items.length;
        result.push({
          type: 'cluster',
          count: items.length,
          issues: items,
          x: avgX,
          y: avgY,
          key
        });
      }
    });

    return result;
  }, [mappedIssues, useClustering, cityBounds]);

  // Track mouse coordinates on SVG container to simulate coordinates ticker
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width;
    const yRatio = (e.clientY - rect.top) / rect.height;
    
    const { latMin, latMax, lngMin, lngMax } = cityBounds;
    const lng = lngMin + xRatio * (lngMax - lngMin);
    const lat = latMax - yRatio * (latMax - latMin);
    setMouseCoords({ lat, lng });
  };

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'Critical': return { bg: 'bg-rose-600', border: 'border-rose-200', text: 'text-rose-600', ring: 'ring-rose-400' };
      case 'High': return { bg: 'bg-orange-500', border: 'border-orange-200', text: 'text-orange-500', ring: 'ring-orange-300' };
      case 'Medium': return { bg: 'bg-amber-500', border: 'border-amber-200', text: 'text-amber-500', ring: 'ring-amber-300' };
      default: return { bg: 'bg-emerald-500', border: 'border-emerald-200', text: 'text-emerald-500', ring: 'ring-emerald-300' };
    }
  };

  const categories = ['All', 'Water Utility', 'Potholes & Roads', 'Electrical & Lighting', 'Waste Management', 'Drainage & Sewer', 'Sidewalks & Transit'];
  const severities = ['All', 'Low', 'Medium', 'High', 'Critical'];

  return (
    <div id="interactive-map-section" className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-200">
      
      {/* 1. Control Rail Panel */}
      <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base font-bold text-slate-900 font-sans">GIS Map Filters</h2>
          </div>
          
          <div className="space-y-4">
            {/* Category Filter */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider font-mono font-bold text-slate-400">Category Filter</label>
              <select 
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            {/* Severity Filter */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider font-mono font-bold text-slate-400">Severity Level</label>
              <select 
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              >
                {severities.map(sev => <option key={sev} value={sev}>{sev}</option>)}
              </select>
            </div>

            {/* Toggle Clustering */}
            <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-100 rounded-xl mt-2">
              <span className="text-xs font-semibold text-slate-700">Cluster Nearby Markers</span>
              <button 
                onClick={() => setUseClustering(!useClustering)}
                className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${useClustering ? 'bg-emerald-600' : 'bg-slate-300'}`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-200 ${useClustering ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Telemetry Info Box */}
        <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[9px] uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            GIS Live Coordinates
          </div>
          <div className="font-mono space-y-1 text-slate-300 text-xs">
            <div className="flex justify-between">
              <span>City Range:</span>
              <span className="font-semibold text-white">{selectedCity}</span>
            </div>
            <div className="flex justify-between">
              <span>LAT:</span>
              <span className="font-semibold text-white">{mouseCoords.lat.toFixed(6)}° N</span>
            </div>
            <div className="flex justify-between">
              <span>LNG:</span>
              <span className="font-semibold text-white">{mouseCoords.lng.toFixed(6)}° E</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center gap-1">
            <Info className="w-3 h-3 text-emerald-500 shrink-0" />
            <span>Hover on map pins to reveal previews. Click pins to open full audit page.</span>
          </div>
        </div>
      </div>

      {/* 2. Map Render Canvas Container */}
      <div className="lg:col-span-9 space-y-4">
        
        {/* Map Header Status bar */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-3 px-4 flex justify-between items-center shadow-2xs">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-700 animate-bounce" />
            <span className="text-xs font-bold text-slate-800 font-sans">
              Smart-Grid Layout: {selectedLocality || 'All Districts'}, {selectedCity}
            </span>
          </div>
          <div className="flex gap-4 text-[10px] font-mono font-bold text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 block"></span> Critical
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 block"></span> High
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block"></span> Medium
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block"></span> Low
            </div>
          </div>
        </div>

        {/* Interactive SVG Street Map Canvas */}
        <div className="relative bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden aspect-video shadow-lg">
          
          {/* Neon Grid Lines Background */}
          <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ backgroundImage: "linear-gradient(#059669 1px, transparent 1px), linear-gradient(90deg, #059669 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>
          
          <svg 
            className="w-full h-full cursor-crosshair"
            onMouseMove={handleMouseMove}
            id="gis-svg-canvas"
          >
            {/* Map Roads & Rivers Design Layout (Dynamic vector aesthetics) */}
            <g className="opacity-10 stroke-emerald-500 stroke-[3] fill-none">
              {/* Vertical Street Arteries */}
              <line x1="20%" y1="0%" x2="20%" y2="100%" />
              <line x1="45%" y1="0%" x2="45%" y2="100%" />
              <line x1="75%" y1="0%" x2="75%" y2="100%" />
              
              {/* Horizontal Street Arteries */}
              <line x1="0%" y1="30%" x2="100%" y2="30%" />
              <line x1="0%" y1="65%" x2="100%" y2="65%" />
              <line x1="0%" y1="85%" x2="100%" y2="85%" />
              
              {/* Diagonals & Local Streets */}
              <line x1="10%" y1="10%" x2="90%" y2="90%" />
              <circle cx="45%" cy="65%" r="120" />
            </g>

            {/* Park and Lake outlines */}
            <rect x="5%" y="10%" width="12%" height="15%" className="fill-emerald-950/40 stroke-emerald-600/20 stroke-[1.5]" rx="6" />
            <text x="6%" y="22%" className="fill-emerald-400 font-mono text-[9px] font-bold tracking-wider opacity-60">GREEN ZONE</text>

            <rect x="65%" y="40%" width="20%" height="18%" className="fill-sky-950/40 stroke-sky-600/20 stroke-[1.5]" rx="10" />
            <text x="70%" y="50%" className="fill-sky-400 font-mono text-[9px] font-bold tracking-wider opacity-60">WATER BASIN</text>

            {/* Distict border dividers */}
            <line x1="50%" y1="0" x2="50%" y2="100%" className="stroke-slate-800 stroke-[1] stroke-dasharray-[4,4] opacity-50" />
            <text x="52%" y="95%" className="fill-slate-600 font-mono text-[8px]">SECTOR BOUNDARY A-B</text>
          </svg>

          {/* Markers overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {clusteredItems.map((item, index) => {
              if (item.type === 'cluster') {
                return (
                  <div
                    key={`cluster-${item.key}-${index}`}
                    style={{ left: `${item.x}%`, top: `${item.y}%` }}
                    className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300"
                    onClick={() => {
                      // Show popup listing clustered issues, or open details of the first one
                      if (item.issues.length > 0) {
                        onViewIssue(item.issues[0].id);
                      }
                    }}
                  >
                    {/* Glowing ring */}
                    <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping"></div>
                    {/* Circle badge */}
                    <div className="w-8 h-8 rounded-full bg-emerald-700 text-emerald-50 border border-emerald-400 flex items-center justify-center text-xs font-mono font-bold shadow-md">
                      {item.count}
                    </div>
                  </div>
                );
              } else {
                const issue = item.issue;
                const colors = getSeverityColor(issue.severity);
                return (
                  <div
                    key={`pin-${issue.id}`}
                    style={{ left: `${item.x}%`, top: `${item.y}%` }}
                    className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                    onMouseEnter={() => setHoveredIssue(issue)}
                    onMouseLeave={() => setHoveredIssue(null)}
                    onClick={() => onViewIssue(issue.id)}
                  >
                    {/* Pulsing Radar Ring */}
                    <div className={`absolute -inset-2.5 rounded-full ${colors.bg} opacity-25 animate-ping pointer-events-none`}></div>
                    
                    {/* Pin Dot */}
                    <div className={`w-4.5 h-4.5 rounded-full ${colors.bg} border-2 border-white flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-125 hover:z-50`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                    </div>

                    {/* Hover preview tooltip */}
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-56 bg-slate-950 text-white rounded-xl shadow-2xl p-3 hidden group-hover:block border border-slate-800 z-50 pointer-events-none space-y-2">
                      <div className="w-full h-24 rounded-lg overflow-hidden bg-slate-900 relative">
                        <img src={issue.image} alt={issue.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        {/* Status Badge */}
                        <span className="absolute top-1.5 right-1.5 bg-slate-950/80 text-emerald-400 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase backdrop-blur-xs">
                          {issue.status}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-[9px] font-mono font-bold tracking-wider text-slate-400 uppercase leading-none">
                          {issue.category}
                        </p>
                        <h4 className="text-[11px] font-bold text-white line-clamp-1 leading-tight">
                          {issue.title}
                        </h4>
                      </div>

                      <div className="space-y-1 text-[9px] text-slate-400 border-t border-slate-800 pt-1.5">
                        <div className="flex justify-between">
                          <span>Area:</span>
                          <span className="text-white font-semibold truncate max-w-[120px]">{issue.address.split(',')[0]}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Severity:</span>
                          <span className={`font-bold uppercase ${colors.text}`}>{issue.severity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Dept:</span>
                          <span className="text-emerald-400 font-medium truncate max-w-[120px]">{issue.advisor?.department || "Pending Triage"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
            })}
          </div>

          {/* No issues indicator */}
          {mappedIssues.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 pointer-events-none">
              <div className="text-center space-y-2 p-6 max-w-sm">
                <Info className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">No matching issues on the map</p>
                <p className="text-xs text-slate-500">Try adjusting your filters or check a different city from the selector at the top.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
