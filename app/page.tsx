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

      const rawText = await res.text();

      // --- BULLETPROOF LOGIC ---
      try {
        // 1. Force the app to try parsing the text as a List of Players
        const data = JSON.parse(rawText);

        if (Array.isArray(data)) {
          // It IS a list! Clean the names and show buttons.
          // (This removes the "|12345" ID from the name so it looks nice)
          const cleanPlayers = data.map((p: any) => ({
            ...p,
            name: p.name ? p.name.split('|')[0].trim() : "Unknown"
          }));
          
          setPlayers(cleanPlayers);
          
        } else {
          // It's valid JSON but not a list? Treat as error/report.
          throw new Error("Not a player list");
        }
      } catch (e) {
        // 2. If JSON parsing failed, it MUST be the HTML Report. Open the popup.
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