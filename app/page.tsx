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

      const contentType = res.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        const playerList = Array.isArray(data) ? data : (data.players || []);
        setPlayers(playerList);
      } else {
        const html = await res.text();
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.write(html);
          newWindow.document.close();
        } else {
          alert("Please allow popups to see the report!");
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