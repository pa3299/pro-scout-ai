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

  const handleSearch = async (query: string | number) => {
    if (!query) return;
    
    // Reset states
    setIsLoading(true);
    setPlayers([]); 
    setReportHtml(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          player_name: query.toString(), 
          language: selectedLanguage 
        })
      });

      const contentType = res.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        // --- IT IS A LIST (Show Buttons) ---
        const data = await res.json();
        
        const cleanPlayers = Array.isArray(data) ? data.map((p: any) => {
          const parts = p.name ? p.name.split('|') : ["Unknown"];
          return {
            ...p,
            name: parts[0].trim(),         
            id: parts[1] || p.id,          
            team: p.team || "Unknown Team",
            country: p.country || "",
            position: p.position || "Player"
          };
        }) : [];

        setPlayers(cleanPlayers);

      } else {
        // --- IT IS THE REPORT (Save it, don't open yet) ---
        const html = await res.text();
        setReportHtml(html); // Save HTML to state
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
    if (newWindow) {
      newWindow.document.write(reportHtml);
      newWindow.document.close();
    } else {
      alert("Please allow popups to view the report.");
    }
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

        {/* --- SUCCESS: REPORT READY BUTTON --- */}
        {reportHtml && (
          <div className="mt-8 animate-in fade-in zoom-in duration-500">
            <button
              onClick={openReport}
              className="group relative flex items-center gap-4 p-6 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-2xl shadow-blue-900/50 transition-all hover:scale-105"
            >
              <div className="p-3 bg-white/20 rounded-full">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold">Report Generated Successfully!</h3>
                <p className="text-blue-100 text-sm">Click here to view the full analysis</p>
              </div>
              <ChevronRight className="h-6 w-6 ml-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              
              {/* Close Button */}
              <div 
                onClick={(e) => { e.stopPropagation(); setReportHtml(null); }}
                className="absolute -top-2 -right-2 bg-slate-800 text-slate-400 p-1.5 rounded-full hover:bg-red-500 hover:text-white cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
              </div>
            </button>
          </div>
        )}
        
        {/* --- INLINE PLAYER LIST --- */}
        {players.length > 0 && !reportHtml && (
          <div className="w-full max-w-2xl mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-2">
              <div className="h-px flex-1 bg-slate-800" />
              <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">
                Select Player
              </span>
              <div className="h-px flex-1 bg-slate-800" />
            </div>

            <div className="grid gap-3">
              {players.map((player, i) => (
                <button
                  key={player.id || i}
                  onClick={() => handleSearch(player.id)} 
                  className="group relative flex items-center gap-4 p-4 w-full bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 rounded-xl transition-all duration-300 text-left"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 group-hover:bg-blue-500/10 transition-colors">
                    <User className="h-6 w-6 text-slate-400 group-hover:text-blue-400" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-200 group-hover:text-white">
                        {player.name}
                      </h3>
                      <span className="text-[10px] text-slate-600 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                        #{player.id}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-slate-500 group-hover:text-slate-400">
                      <Shield className="h-3 w-3" />
                      <span>{player.team}</span>
                      {player.country && (
                        <>
                          <span className="text-slate-700">•</span>
                          <span>{player.country}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}