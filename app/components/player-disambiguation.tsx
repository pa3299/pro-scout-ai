"use client";

import { ArrowRight, User, Shield } from "lucide-react";

interface Player {
  id: string | number;
  name: string;
  team?: string;
  country?: string;
}

interface PlayerDisambiguationProps {
  players: Player[];
  onSelectPlayer: (playerName: string) => void;
}

export function PlayerDisambiguation({
  players,
  onSelectPlayer,
}: PlayerDisambiguationProps) {
  return (
    <div className="w-full max-w-2xl mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-1 bg-slate-700" />
        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider px-3">
          Select Player
        </span>
        <div className="h-px flex-1 bg-slate-700" />
      </div>

      <div className="grid gap-3">
        {players.map((player, index) => (
          <button
            key={index}
            onClick={() => onSelectPlayer(player.name)}
            className="group relative w-full text-left"
          >
            <div className="absolute -inset-0.5 bg-blue-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative flex items-center gap-4 p-4 bg-slate-900/80 border border-slate-700 rounded-xl hover:border-blue-500/50 hover:bg-slate-800 transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700 group-hover:border-blue-500/30 transition-colors">
                <User className="w-6 h-6 text-slate-400 group-hover:text-blue-400 transition-colors" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white text-lg group-hover:text-blue-400 transition-colors truncate">
                  {player.name}
                </h3>
                <div className="flex items-center gap-4 mt-1">
                  {player.team && (
                    <div className="flex items-center gap-1.5 text-sm text-slate-400">
                      <Shield className="w-3.5 h-3.5" />
                      <span className="font-mono truncate">{player.team}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 group-hover:bg-blue-600 group-hover:border-blue-500 transition-all duration-300">
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}