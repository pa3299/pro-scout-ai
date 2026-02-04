"use client";

import { useState } from "react";
import { User, Shield, FileText, AlertCircle } from "lucide-react"; 
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

    // Combine Name + Club for a precise search
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
        
        // Handle both Array or Object formats
        const rawList = Array.isArray(data) ? data : (data.candidates || []);

        if (rawList.length === 0) {
           setErrorMsg("No players found. Check the spelling or club name.");
        }

        const cleanPlayers = rawList.map((p: any) => ({
          ...p,
          name: (p.name || "Unknown").split('|')[0].trim(),
          id: p.id,
          team: p.team || "Unknown"
        }));
        
        setPlayers(cleanPlayers);

      } else {
        const html = await res.text();
        setReportHtml(html);
      }
    } catch (e: any) {
      setErrorMsg("Connection error. Please try again.");
    }
    setIsLoading(false);
  };

  return (
    <main className="relative min-h-screen bg-slate-950 overflow-hidden font-sans">
      <TacticalBackground />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-2xl text-center space-y-4">
          <SearchHero
            onSearch={handleSearch}
            isLoading={isLoading}
            selectedLanguage="en"
            onLanguageChange={() => {}}
          />
          
          {/* CLUB FILTER FIELD - Placed between Search and Language */}
          {!players.length && !reportHtml && (
            <div className="flex flex-col gap-4 max-w-md mx-auto animate-in fade-in slide-in-from-top-2">
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input 
                  type="text"
                  placeholder="Enter Club Name (e.g. Barcelona)"
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-lg py-3 pl-10 pr-4 text-sm text-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  value={clubFilter}
                  onChange={(e) => setClubFilter(e.target.value)}
                />
              </div>
            </div>
          )}

          {errorMsg && (
             <div className="flex items-center justify-center gap-2 text-red-400 bg-red-900/20 p-3 rounded-lg border border-red-900/50 max-w-md mx-auto">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{errorMsg}</span>
             </div>
          )}
        </div>

        {/* REPORT READY BUTTON */}
        {reportHtml && (
          <div className="mt-8 animate-bounce">
            <button onClick={() => {
              const win = window.open();
              win?.document.write(reportHtml);
            }} className="flex items-center gap-4 p-6 bg-blue-600 rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20">
              <FileText className="h-8 w-8 text-white" />
              <div className="text-left">
                <h3 className="font-bold text-white">Report Ready!</h3>
                <p className="text-blue-100 text-sm">Open Full Analysis</p>
              </div>
            </button>
          </div>
        )}
        
        {/* PLAYER LIST (Up to 8 Results) */}
        {players.length > 0 && !reportHtml && (
          <div className="w-full max-w-2xl mt-8 grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in zoom-in-95">
            {players.map((player) => (
              <button
                key={player.id}
                onClick={() => handleSearch(player.id)} 
                className="flex items-center gap-4 p-4 bg-slate-900/80 border border-slate-800 rounded-xl hover:border-blue-500 transition-all text-left group"
              >
                <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-blue-900/50 transition-colors">
                  <User className="h-5 w-5 text-slate-400" />
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