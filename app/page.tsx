"use client";

import { useState } from "react";
import { SearchHero } from "@/app/components/search-hero";
import { PlayerDisambiguation } from "@/app/components/player-disambiguation";
import { TacticalBackground } from "@/app/components/tactical-background";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  const handleSearch = async (playerName: string) => {
    if (!playerName.trim()) return;
    setIsLoading(true);
    setPlayers([]);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          player_name: playerName,
          language: selectedLanguage 
        })
      });

      // 1. Check the Label (Header) from the Server
      const contentType = res.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        // CASE A: It is a List! (JSON)
        const data = await res.json();
        
        // Clean the names (remove |12345 ID)
        const cleanPlayers = Array.isArray(data) ? data.map((p: any) => ({
          ...p,
          name: p.name ? p.name.split('|')[0].trim() : "Unknown",
          id: p.name ? p.name.split('|')[1] : null 
        })) : [];

        setPlayers(cleanPlayers);

      } else {
        // CASE B: It is the Report! (HTML)
        const html = await res.text();
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.write(html);
          newWindow.document.close();
        } else {
          alert("Report generated! Please check your popup blocker.");
        }
      }

    } catch (e) {
      alert("Error connecting to Scout AI.");
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
        
        {players.length > 0 && (
          <PlayerDisambiguation
            players={players}
            onSelectPlayer={(name) => handleSearch(name)}
          />
        )}
      </div>
    </main>
  );
}