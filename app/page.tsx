"use client";

import { useState } from "react";
import { User, ChevronRight, Shield } from "lucide-react";
import { SearchHero } from "@/app/components/search-hero";
import { TacticalBackground } from "@/app/components/tactical-background";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const handleSearch = async (query: string) => {
    // Safety check: Prevent empty searches
    if (!query || (!query.trim() && typeof query === 'string')) return;
    
    setIsLoading(true);
    setPlayers([]);

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
        // --- IT IS A LIST (Ask user to choose) ---
        const data = await res.json();
        
        const cleanPlayers = Array.isArray(data) ? data.map((p: any) => {
          // Logic: Split "Name|ID"
          const parts = p.name ? p.name.split('|') : ["Unknown"];
          return {
            ...p,
            name: parts[0].trim(), 
            id: parts[1] || p.id, // Save the ID for the click
            team: p.team || "Unknown Team",
            country: p.country || "",
            position: p.position || "Player"
          };
        }) : [];

        setPlayers(cleanPlayers);

      } else {
        // --- IT IS THE REPORT (Open Popup) ---
        const html = await res.text();
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.write(html);
          newWindow.document.close();
        } else {
          alert("Report ready! Please check your popup blocker.");
        }
      }

    } catch (e) {
      console.error(e);
      alert("Connection error. Please try again.");
    }
    
    setIsLoading(false);
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
        
        {/* --- INLINE PLAYER LIST (Guaranteed to work) --- */}
        {players.length > 0 && (
          <div className="w-full max-w-2xl mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
                  onClick={() => {
                     // DEBUG: Verify we are sending the ID
                     console.log("Searching for ID:", player.id); 
                     handleSearch(player.id || player.name);
                  }} 
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
                      {/* Optional: Show ID for debugging */}
                      {/* <span className="text-xs text-slate-600">({player.id})</span> */}
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