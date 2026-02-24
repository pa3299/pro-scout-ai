"use client";

import { useState } from "react";
import { User, ChevronRight, Shield, FileText, X } from "lucide-react"; 
import { SearchHero } from "@/app/components/search-hero";
import { TacticalBackground } from "@/app/components/tactical-background";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [reportHtml, setReportHtml] = useState<string | null>(null);

  const handleSearch = async (query: string | number, clubName: string = "") => {
    if (!query && !clubName) return;
    
    setIsLoading(true);
    setPlayers([]); 
    setReportHtml(null);

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
        
        // FIX: Clean up name/ID string and aggressively extract team ID
        const cleanPlayers = rawList.map((p: any) => {
          let cleanName = p.name || "Unknown";
          let cleanId = p.id;

          // Handle "Name|ID" format if present
          if (cleanName.includes('|')) {
            const parts = cleanName.split('|');
            cleanName = parts[0].trim();
            cleanId = parts[1] || p.id;
          }

          // Force the app to check every possible location for the Team ID
          const teamName = p.team?.name || p.entity?.team?.name || (typeof p.team === 'string' ? p.team : "Unknown Team");
          const teamId = p.team?.id || p.teamId || p.team_id || p.entity?.team?.id || null;

          return {
            ...p,
            name: cleanName,         
            id: cleanId,          
            team: teamName,
            teamId: teamId,
            country: p.country || "",
            position: p.position || "-"
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
        <SearchHero
          onSearch={handleSearch}
          isLoading={isLoading}
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
        />
        
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
        
        {players.length > 0 && !reportHtml && (
          <div className="w-full max-w-2xl mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-2"><div className="h-px flex-1 bg-slate-800" /><span className="text-xs font-medium text-slate-500 uppercase tracking-widest">Select Player</span><div className="h-px flex-1 bg-slate-800" /></div>
            <div className="grid gap-3">
              {players.map((player, i) => (
                <button key={player.id || i} onClick={() => handleSearch(player.id, "")} className="group relative flex items-center gap-4 p-4 w-full bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 rounded-xl transition-all duration-300 text-left">
                  
                  {/* Player Image */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-800 overflow-hidden border border-slate-700 group-hover:border-blue-500/50 transition-colors">
                    <img 
                      src={`https://api.sofascore.app/api/v1/player/${player.id}/image`} 
                      alt={player.name}
                      className="h-full w-full object-cover"
                      onError={(e) => { e.currentTarget.src = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'; }}
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-200 group-hover:text-white">{player.name}</h3>
                      {player.position !== '-' && <span className="text-[10px] text-slate-600 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">#{player.position}</span>}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1 text-sm text-slate-500 group-hover:text-slate-400">
                      
                      {/* UPDATED: Club Logo with perfect 3x3 sizing */}
                      {player.teamId ? (
                        <img 
                          src={`https://api.sofascore.app/api/v1/team/${player.teamId}/image`} 
                          alt={player.team}
                          className="h-3 w-3 object-contain"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <Shield className="h-3 w-3" />
                      )}
                      
                      <span>{player.team}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-blue-400 transition-all" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}