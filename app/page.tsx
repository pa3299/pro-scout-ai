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
    setPlayers([]); // Clear previous results

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          player_name: playerName,
          language: selectedLanguage 
        })
      });

      // 1. Get the raw text first
      const rawText = await res.text();

      // 2. Try to understand what it is
      try {
        // If it looks like a list (starts with '['), parse it!
        if (rawText.trim().startsWith('[')) {
          const data = JSON.parse(rawText);
          setPlayers(data);
        } else {
          // It's not a list, so it must be the Report HTML
          throw new Error("Not a list");
        }
      } catch (e) {
        // If it failed to parse as JSON, treat it as HTML Report
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.write(rawText);
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
