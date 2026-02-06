import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';

interface VoxArrayProps {
  logs: LogEntry[];
}

export const VoxArray: React.FC<VoxArrayProps> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'danger': return 'text-red-500 text-glow';
      case 'success': return 'text-green-500 text-glow';
      case 'warp': return 'text-purple-400 text-glow';
      default: return 'text-amber-500';
    }
  };

  return (
    <div className="h-48 md:h-64 border-t border-stone-800 bg-black p-4 font-mono text-sm overflow-hidden flex flex-col relative z-20">
      <div className="absolute top-0 right-0 p-2 opacity-30 pointer-events-none">
        <span className="text-[100px] leading-none text-amber-900 font-bold">VOX</span>
      </div>

      <div className="flex items-center justify-between mb-2 border-b border-dashed border-stone-800 pb-2 z-10">
        <span className="text-stone-500 font-bold tracking-widest text-xs flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-900 animate-pulse"></span>
            VOX-CASTER LOG // INCOMING STREAM
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar z-10 pr-2">
        {/* Render logs in reverse chronological order visually, but logic keeps them ordered */}
        {logs.slice().reverse().map((log) => (
          <div key={log.id} className="flex gap-3 text-xs md:text-sm font-mono leading-tight hover:bg-white/5 p-0.5 transition-colors">
            <span className="text-stone-600 shrink-0 font-bold opacity-70">[{log.timestamp}]</span>
            <span className={`${getColor(log.type)}`}>
              <span className="mr-2 opacity-50">{'>'}</span>
              {log.message}
            </span>
          </div>
        ))}
        <div className="h-4 w-2 bg-amber-500 animate-blink mt-1 inline-block"></div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
};