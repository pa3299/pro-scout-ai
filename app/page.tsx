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

      // 1. Get raw text
      const rawText = await res.text();
      
      // 2. NUCLEAR CLEAN: Remove invisible BOM characters and whitespace
      // The \uFEFF is a common invisible character that breaks JSON
      const cleanText = rawText.trim().replace(/^\uFEFF/, '');

      try {
        // 3. Try parsing the Clean Text
        const data = JSON.parse(cleanText);

        if (Array.isArray(data)) {
          // IT WORKED! It is a list.
          // Clean up the names (remove the "|12345" ID part)
          const cleanPlayers = data.map((p: any) => ({
            ...p,
            name: p.name ? p.name.split('|')[0].trim() : "Unknown",
            // Keep the ID hidden but available for the next search
            id: p.name ? p.name.split('|')[1] : null 
          }));
          
          setPlayers(cleanPlayers);
        } else {
          // Valid JSON, but not a list? Must be an error or unexpected object.
          throw new Error("Not an array");
        }

      } catch (jsonError) {
        // 4. If Parsing Fails, it's the HTML Report. Open it.
        // We only open the popup if we are SURE it's not a list.
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.write(rawText);
          newWindow.document.close();
        } else {
          alert("Report generated! Please allow popups to view it.");
        }
      }

    } catch (e) {
      alert("System Error: Could not connect to the Scout Brain.");
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
            // When user clicks a button, we run the search again with the specific name
            onSelectPlayer={(name) => handleSearch(name)}
          />
        )}
      </div>
    </main>
  );
}