"use client";

import { useState } from "react";
import { ChevronRight, Shield, FileText, X, Loader2, ArrowLeft } from "lucide-react"; 
import { SearchHero } from "@/app/components/search-hero";
import { TacticalBackground } from "@/app/components/tactical-background";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [reportHtml, setReportHtml] = useState<string | null>(null);

  // NEW STATES FOR SEASON SELECTION
  const [configuringPlayer, setConfiguringPlayer] = useState<any>(null);
  const [playerSeasons, setPlayerSeasons] = useState<any[]>([]);
  const [selectedTournamentSeason, setSelectedTournamentSeason] = useState("");
  const [isFetchingSeasons, setIsFetchingSeasons] = useState(false); 

  const handleSearch = async (query: string | number, clubName: string = "") => {
    if (!query && !clubName) return;
    
    setIsLoading(true);
    setPlayers([]); 
    setReportHtml(null);
    setConfiguringPlayer(null); 

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          player_name: query.toString(), 
          club_name: clubName,
          language: selectedLanguage 
        })
      });

      const contentType = res.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        const rawList = Array.isArray(data) ? data : (data.candidates || []);
        
        const cleanPlayers = rawList.map((p: any) => {
          let cleanName = p.name || "Unknown";
          let cleanId = p.id;

          if (cleanName.includes('|')) {
            const parts = cleanName.split('|');
            cleanName = parts[0].trim();
            cleanId = parts[1] || p.id;
          }

          const teamName = p.team?.name || p.entity?.team?.name || (typeof p.team === 'string' ? p.team : "Unknown Team");
          const teamId = p.team?.id || p.teamId || p.team_id || p.entity?.team?.id || null;

          return {
            ...p, name: cleanName, id: cleanId, team: teamName, teamId: teamId, country: p.country || "", position: p.position || "-"
          };
        });
        setPlayers(cleanPlayers);
      } else {
        const html = await res.text();
        setReportHtml(html); 
      }
    } catch (e) {
      console.error(e);
      alert("Connection error. Please try again.");
    }
    setIsLoading(false);
  };

  const handleSelectPlayer = async (player: any) => {
    setConfiguringPlayer(player);
    setPlayerSeasons([]); 
    setIsFetchingSeasons(true); 

    try {
      const res = await fetch(`https://api.sofascore.app/api/v1/player/${player.id}/statistics/seasons`, {
        referrerPolicy: "no-referrer"
      });
      
      if (!res.ok) throw new Error("API returned " + res.status);
      
      const data = await res.json();

      let options: any[] = [];
      let utsArray: any[] = [];

      // FIX: Aggressively check for the "types" wrapper (Club vs National stats)
      if (data.uniqueTournamentSeasons) {
        utsArray = data.uniqueTournamentSeasons;
      } else if (data.types) {
        Object.values(data.types).forEach((typeObj: any) => {
          if (typeObj && typeObj.uniqueTournamentSeasons) {
            utsArray = utsArray.concat(typeObj.uniqueTournamentSeasons);
          }
        });
      }

      if (utsArray.length > 0) {
        utsArray.forEach((uts: any) => {
          const tName = uts.uniqueTournament?.name || "Unknown Tournament";
          const tId = uts.uniqueTournament?.id || "";
          
          if (uts.seasons && Array.isArray(uts.seasons)) {
            uts.seasons.forEach((season: any) => {
              options.push({
                label: `${season.year || "Unknown"} - ${tName}`,
                s_id: season.id || "",
                t_id: tId,
                year: season.year || ""
              });
            });
          }
        });
      }

      // Securely cast to string so it never crashes on integer years
      options.sort((a, b) => String(b.year).localeCompare(String(a.year)));
      
      // Deduplicate in case Sofascore returned overlapping data
      const uniqueOptions: any[] = [];
      const seen = new Set();
      options.forEach(opt => {
         const key = `${opt.s_id}|${opt.t_id}`;
         if (!seen.has(key)) {
            seen.add(key);
            uniqueOptions.push(opt);
         }
      });
      
      // Safe fallback ONLY if truly no data exists anywhere
      if (uniqueOptions.length === 0) {
          uniqueOptions.push({
              label: "Latest Available Data",
              s_id: "",
              t_id: "",
              year: "Latest"
          });
      }
      
      setPlayerSeasons(uniqueOptions);
      setSelectedTournamentSeason(`${uniqueOptions[0].s_id}|${uniqueOptions[0].t_id}`);
      
    } catch (e) { 
      console.error("Failed to fetch seasons", e); 
      setPlayerSeasons([{ label: "Latest Available Data", s_id: "", t_id: "", year: "Latest" }]);
      setSelectedTournamentSeason("|");
    }
    
    setIsFetchingSeasons(false); 
  };

  const handleGenerateReport = async () => {
    if (!configuringPlayer || !selectedTournamentSeason) return;
    
    setIsLoading(true);
    setReportHtml(null);
    const [s_id, t_id] = selectedTournamentSeason.split('|');

    const selectedOpt = playerSeasons.find(o => `${o.s_id}|${o.t_id}` === selectedTournamentSeason);
    const campaignName = selectedOpt ? selectedOpt.label : "Latest Campaign";

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          player_name: configuringPlayer.id.toString(), 
          club_name: "", 
          language: selectedLanguage,
          season_id: s_id,       
          tournament_id: t_id,   
          campaign_name: campaignName 
        })
      });
      const html = await res.text();
      setReportHtml(html); 
      setConfiguringPlayer(null); 
    } catch (e) { alert("Generation failed."); }
    setIsLoading(false);
  };

  const openReport = () => {
    if (!reportHtml) return;
    const newWindow = window.open();
    if (newWindow) { newWindow.document.write(reportHtml); newWindow.document.close(); } 
    else { alert("Please allow popups to view the report."); }
  };

  return (
    <main className="relative min-h-screen bg-slate-950 overflow-hidden font-sans">
      <TacticalBackground />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <SearchHero onSearch={handleSearch} isLoading={isLoading} selectedLanguage={selectedLanguage} onLanguageChange={setSelectedLanguage} />
        
        {reportHtml && (
          <div className="mt-8 animate-in fade-in zoom-in duration-500">
            <button onClick={openReport} className="group relative flex items-center gap-4 p-6 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-2xl transition-all hover:scale-105">
              <div className="p-3 bg-white/20 rounded-full"><FileText className="h-8 w-8 text-white" /></div>
              <div className="text-left"><h3 className="text-lg font-bold">Report Generated Successfully!</h3><p className="text-blue-100 text-sm">Click here to view</p></div>
              <ChevronRight className="h-6 w-6 ml-4 opacity-50 group-hover:opacity-100 transition-all" />
              <div onClick={(e) => { e.stopPropagation(); setReportHtml(null); }} className="absolute -top-2 -right-2 bg-slate-800 text-slate-400 p-1.5 rounded-full hover:bg-red-500 hover:text-white cursor-pointer transition-colors"><X className="h-4 w-4" /></div>
            </button>
          </div>
        )}
        
        {/* VIEW 1: PLAYER LIST */}
        {players.length > 0 && !reportHtml && !configuringPlayer && (
          <div className="w-full max-w-2xl mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-2"><div className="h-px flex-1 bg-slate-800" /><span className="text-xs font-medium text-slate-500 uppercase tracking-widest">Select Player</span><div className="h-px flex-1 bg-slate-800" /></div>
            <div className="grid gap-3">
              {players.map((player, i) => (
                <button key={player.id || i} onClick={() => handleSelectPlayer(player)} className="group relative flex items-center gap-4 p-4 w-full bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 rounded-xl transition-all duration-300 text-left">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-800 overflow-hidden border border-slate-700 group-hover:border-blue-500/50 transition-colors">
                    <img src={`https://api.sofascore.app/api/v1/player/${player.id}/image`} alt={player.name} referrerPolicy="no-referrer" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.src = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'; }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2"><h3 className="font-semibold text-slate-200 group-hover:text-white">{player.name}</h3>{player.position !== '-' && <span className="text-[10px] text-slate-600 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">#{player.position}</span>}</div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-slate-500 group-hover:text-slate-400">
                      {player.teamId ? <img src={`https://api.sofascore.app/api/v1/team/${player.teamId}/image`} alt={player.team} referrerPolicy="no-referrer" className="h-3 w-3 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }}/> : <Shield className="h-3 w-3" />}
                      <span>{player.team}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-blue-400 transition-all" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 2: CONFIGURE SELECTED PLAYER (MOBILE OPTIMIZED) */}
        {configuringPlayer && !reportHtml && (
           <div className="w-full max-w-3xl mt-8 space-y-4 animate-in fade-in zoom-in duration-500">
             <div className="flex items-center justify-between gap-4 mb-2">
                <button onClick={() => setConfiguringPlayer(null)} className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-blue-400 transition-colors uppercase tracking-widest"><ArrowLeft className="w-4 h-4"/> Back to List</button>
                <div className="h-px flex-1 bg-slate-800" />
                <span className="text-xs font-medium text-blue-400 uppercase tracking-widest">Select Season</span>
             </div>

             {/* MOBILE FIX: Changed flex direction and alignment breakpoints */}
             <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 p-4 w-full bg-slate-900 border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.1)] rounded-xl">
                {/* Left: Player Info */}
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-800 overflow-hidden border-2 border-blue-500/50">
                    <img src={`https://api.sofascore.app/api/v1/player/${configuringPlayer.id}/image`} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1">
                    <h3 className="font-bold text-white text-lg">{configuringPlayer.name}</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-slate-400">
                        {configuringPlayer.teamId && <img src={`https://api.sofascore.app/api/v1/team/${configuringPlayer.teamId}/image`} referrerPolicy="no-referrer" className="h-3.5 w-3.5 object-contain" />}
                        <span>{configuringPlayer.team}</span>
                    </div>
                    </div>
                </div>

                {/* Right: The Red Circle Area (Dropdown & Generate Button) */}
                {/* MOBILE FIX: Changed flex direction, added w-full, and mt-4 for spacing on mobile */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                   {isFetchingSeasons ? (
                      <div className="flex items-center justify-center md:justify-start gap-2 text-slate-400 text-sm px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg"><Loader2 className="w-4 h-4 animate-spin" /> Loading seasons...</div>
                   ) : (
                      <select 
                        className="bg-slate-950 border border-slate-700 text-white text-sm pl-3 pr-8 py-3 rounded-lg cursor-pointer hover:border-blue-500/50 focus:outline-none focus:border-blue-500 transition-colors w-full md:w-auto"
                        value={selectedTournamentSeason}
                        onChange={(e) => setSelectedTournamentSeason(e.target.value)}
                      >
                        {playerSeasons.map((opt, idx) => (
                          <option key={idx} value={`${opt.s_id}|${opt.t_id}`}>{opt.label}</option>
                        ))}
                      </select>
                   )}
                   <button 
                     onClick={handleGenerateReport} 
                     disabled={isLoading || isFetchingSeasons}
                     className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] flex items-center justify-center gap-2 w-full md:w-auto"
                   >
                     {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Fetching...</> : 'Generate Report'}
                   </button>
                </div>
             </div>
           </div>
        )}
      </div>
    </main>
  );
}