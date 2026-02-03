import { motion } from "framer-motion";
import { User, ChevronRight, Shield } from "lucide-react";

interface Player {
  id: string;
  name: string;
  team: string;
  country?: string;
  position?: string;
}

interface Props {
  players: Player[];
  onSelectPlayer: (id: string) => void;
}

export function PlayerDisambiguation({ players, onSelectPlayer }: Props) {
  return (
    <div className="w-full max-w-2xl mt-8 space-y-4">
      <div className="flex items-center gap-4 mb-2">
        <div className="h-px flex-1 bg-border/50" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
          Select Player
        </span>
        <div className="h-px flex-1 bg-border/50" />
      </div>

      <div className="grid gap-3">
        {players.map((player, i) => (
          <motion.button
            key={player.id || i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            // --- THE FIX IS HERE ---
            // We force it to send the ID. If no ID exists, we fallback to name.
            onClick={() => onSelectPlayer(player.id || player.name)} 
            className="group relative flex items-center gap-4 p-4 w-full bg-slate-900/50 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 rounded-xl transition-all duration-300 text-left"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 group-hover:bg-blue-500/10 transition-colors">
              <User className="h-6 w-6 text-slate-400 group-hover:text-blue-400" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-200 group-hover:text-white">
                  {player.name}
                </h3>
                {player.position && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                    {player.position}
                  </span>
                )}
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

            <div className="pr-2">
              <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}