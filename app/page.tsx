'use client';
import { useState } from 'react';

export default function Home() {
  const [player, setPlayer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!player) return;
    setLoading(true);
    
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_name: player })
      });
      
      const html = await res.text();
      
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(html);
        newWindow.document.close();
      } else {
        alert("Please allow popups to see the report!");
      }
    } catch (e) {
      alert("Error generating report.");
    }
    
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4 font-sans">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700">
        <h1 className="text-3xl font-bold mb-2 text-center text-blue-400">Scout Report</h1>
        <p className="text-slate-400 text-center mb-8">AI-Powered Player Analysis</p>
        
        <div className="space-y-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Player Name (e.g. Lamine Yamal)" 
              className="w-full p-4 bg-slate-900 border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-white placeholder-slate-500 transition-all"
              value={player}
              onChange={(e) => setPlayer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          
          <button 
            onClick={handleSearch}
            disabled={loading || !player}
            className={`w-full p-4 font-bold rounded-xl text-lg transition-all transform active:scale-95 ${
              loading 
                ? 'bg-slate-600 cursor-not-allowed text-slate-400' 
                : 'bg-blue-600 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/20'
            }`}
          >
            {loading ? 'Scouting...' : 'Generate Report'}
          </button>
        </div>
      </div>
    </div>
  );
}