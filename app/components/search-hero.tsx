"use client";

import { useState } from "react";
import { Search, Loader2, ChevronDown, Globe, Shield } from "lucide-react"; 

const languages = [
  { code: "English", name: "English", flag: "🇬🇧" },
  { code: "Spanish", name: "Spanish", flag: "🇪🇸" },
  { code: "French", name: "French", flag: "🇫🇷" },
  { code: "German", name: "German", flag: "🇩🇪" },
  { code: "Italian", name: "Italian", flag: "🇮🇹" },
  { code: "Portuguese", name: "Portuguese", flag: "🇵🇹" },
  { code: "Chinese", name: "Chinese", flag: "🇨🇳" },
  { code: "Arabic", name: "Arabic", flag: "🇸🇦" },
];

interface SearchHeroProps {
  onSearch: (playerName: string, clubName: string) => void;
  isLoading: boolean;
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
}

export function SearchHero({
  onSearch,
  isLoading,
  selectedLanguage,
  onLanguageChange,
}: SearchHeroProps) {
  const [playerName, setPlayerName] = useState("");
  const [clubName, setClubName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(playerName, clubName);
  };

  return (
    <div className="w-full max-w-4xl relative z-10">
      <div className="text-center mb-8">
        
        {/* --- HEADER SECTION START --- */}
        {/* Adjusted: gap-4 (tighter) and -ml-4 (shifts slightly left to center nicely) */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8 -ml-2 md:-ml-4">
          
          {/* LOGO: Scaled slightly for balance */}
          <div className="relative w-28 h-28 md:w-32 md:h-32 transition-transform hover:scale-105 duration-500 shrink-0">
            <img 
              src="/logo.png" 
              alt="Pro Scout AI Logo" 
              className="w-full h-full object-contain drop-shadow-[0_0_35px_rgba(59,130,246,0.6)]" 
            />
          </div>

          {/* TITLE */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white flex items-center gap-3">
            <span>Pro Scout</span>
            <span className="text-blue-400">AI</span>
          </h1>
          
        </div>
        {/* --- HEADER SECTION END --- */}
        
        <p className="text-slate-400 text-lg font-mono tracking-wide">
          Elite Player Analysis & Data Recruitment
        </p>
      </div>

      <div className="relative group max-w-2xl mx-auto">
        <div className="absolute -inset-1 bg-blue-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition duration-500" />
        
        <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 md:p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Player Name Input */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Search className="w-4 h-4" />
                Player Name
              </label>
              <input
                type="text"
                placeholder="e.g. Harry (Leave empty to search Club squad)"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full h-14 pl-5 pr-5 text-lg bg-slate-950/50 border border-slate-700 rounded-xl placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white transition-all outline-none"
                disabled={isLoading}
              />
            </div>

            {/* Club Name Input */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Club Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Fulham"
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
                className="w-full h-14 pl-5 pr-5 text-lg bg-slate-950/50 border border-slate-700 rounded-xl placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white transition-all outline-none"
                disabled={isLoading}
              />
            </div>

            <div className="h-px bg-slate-700/50" />

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Language</span>
              </div>
              <div className="relative">
                <select 
                  value={selectedLanguage}
                  onChange={(e) => onLanguageChange(e.target.value)}
                  className="appearance-none bg-slate-950/50 border border-slate-700 text-white pl-4 pr-10 py-2 rounded-lg cursor-pointer hover:border-blue-500/50 focus:outline-none focus:border-blue-500 transition-colors"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>{lang.flag} {lang.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || (!playerName.trim() && !clubName.trim())}
              className={`w-full h-14 text-lg font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                isLoading ? 'bg-slate-700 cursor-not-allowed text-slate-400' : 'bg-blue-600 hover:bg-blue-500 text-white hover:shadow-lg hover:shadow-blue-500/25'
              }`}
            >
              {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</> : <><Search className="w-5 h-5" /> Scout</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}