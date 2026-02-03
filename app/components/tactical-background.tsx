'use client';

export function TacticalBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-slate-950" />
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120, 119, 198, 0.3), transparent),
            radial-gradient(ellipse 60% 40% at 100% 50%, rgba(56, 189, 248, 0.1), transparent),
            radial-gradient(ellipse 60% 40% at 0% 50%, rgba(56, 189, 248, 0.1), transparent)
          `
        }}
      />
      <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.05
        }} 
      />
    </div>
  );
}