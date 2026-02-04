"use client";

import { useState } from "react";
import { User, ChevronRight, Shield, FileText, X, Search, Users, AlertCircle } from "lucide-react"; 
import { SearchHero } from "@/app/components/search-hero";
import { TacticalBackground } from "@/app/components/tactical-background";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [players, setPlayers] = useState<any[]>([]);
  const [reportHtml, setReportHtml] = useState<string | null>(null);
  const [clubFilter, setClubFilter] = useState(""); 
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSearch = async (query: string | number) => {
    if (!query) return;
    
    setIsLoading(true);
    setPlayers([]); 
    setReportHtml(null);
    setErrorMsg(null);

    // Combine player name + club if available
    const finalQuery = typeof query === 'string' && clubFilter 
      ? `${query} ${clubFilter}` 
      : query;

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          player_name: finalQuery.toString(), 
          language: "en" 
        })
      });

      const contentType = res.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        
        // --- THE FIX IS HERE ---
        // We now check if data is an Array OR if it has a 'candidates' list
        let rawList = [];
        if (Array.isArray(data)) {
          rawList = data;
        } else if (data.candidates && Array.isArray(data.candidates)) {
          rawList = data.candidates;
        } else if (data.error) {
           setErrorMsg(data.error);
           setIsLoading(false);
           return;
        }

        if (rawList.length === 0) {
           setErrorMsg("No players found. Try a different spelling.");
        }

        const cleanPlayers = rawList.map((p: any) => ({
          ...p,
          name: (p.name || "Unknown").split('|')[0].trim(),
          id: p.id,
          team: p.team || "Unknown",
          type: p.type || "player"
        }));
        
        setPlayers(cleanPlayers);

      } else {
        // If it's HTML, it's the final report
        const html = await res.text();
        setReportHtml(html);
      }
    } catch (e: any) {
      setErrorMsg("Connection failed: " + e.message);
    }
    setIsLoading(false);
  };

  return (
    <main className="relative min-h-screen bg-slate-950 overflow-hidden font-sans">
      <TacticalBackground />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        
        <div className="w-full max-w-2xl text-center space-y-6">
          <SearchHero
            onSearch={handleSearch}
            isLoading={isLoading}
            selectedLanguage="en"
            onLanguageChange={() => {}}
          />
          
          {/* CLUB FILTER */}
          {!players.length && !reportHtml && (
            <div className="flex gap-2 max-w-md mx-auto mt-4 animate-in fade-in slide-in-from-top-2">
              <div className="relative flex-1">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input 
                  type="text"
                  placeholder="Optional: Filter by Club (e.g. Barcelona)"
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-300 focus:border-blue-500 outline-none transition-all"
                  value={clubFilter}
                  onChange={(e) => setClubFilter(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* ERROR MESSAGE DISPLAY */}
          {errorMsg && (
             <div className="flex items-center justify-center gap-2 text-red-400 bg-red-900/20 p-3 rounded-lg border border-red-900/50">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{errorMsg}</span>
             </div>
          )}
        </div>

        {/* REPORT READY BUTTON */}
        {reportHtml && (
          <div className="mt-8">
            <button onClick={() => {
              const win = window.open();
              win?.document.write(reportHtml);
            }} className="flex items-center gap-4 p-6 bg-blue-600 rounded-xl hover:bg-blue-500 transition-all">
              <FileText className="h-8 w-8 text-white" />
              <div className="text-left">
                <h3 className="font-bold text-white">Report Generated!</h3>
                <p className="text-blue-100 text-sm">Click to view analysis</p>
              </div>
            </button>
          </div>
        )}
        
        {/* PLAYER LIST */}
        {players.length > 0 && !reportHtml && (
          <div className="w-full max-w-2xl mt-8 grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in zoom-in-95 duration-300">
            {players.map((player) => (
              <button
                key={player.id}
                onClick={() => handleSearch(player.id)} 
                className="flex items-center gap-4 p-4 bg-slate-900/80 border border-slate-800 rounded-xl hover:border-blue-500 transition-all text-left group"
              >
                <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-blue-900/50 transition-colors">
                  {player.type === 'team' ? <Users className="h-5 w-5 text-blue-400" /> : <User className="h-5 w-5 text-slate-400" />}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-200 text-sm">{player.name}</h3>
                  <p className="text-xs text-slate-500">{player.team}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}