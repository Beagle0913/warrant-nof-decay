import React from 'react';
import { ShipState } from '../types';

interface BridgeProps {
  ship: ShipState;
}

export const Bridge: React.FC<BridgeProps> = ({ ship }) => {
  const getStatusColor = (current: number, max: number) => {
    const pct = current / max;
    if (pct < 0.25) return 'text-red-600 animate-pulse';
    if (pct < 0.5) return 'text-yellow-600';
    return 'text-green-500';
  };

  return (
    <div className="w-full bg-stone-950 border-b border-stone-800 p-4 grid grid-cols-2 md:grid-cols-5 gap-4 font-mono text-sm z-10 relative">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDUwNTA1Ii8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMxMTEiLz4KPC9zdmc+')] opacity-20 pointer-events-none"></div>

      {/* HULL */}
      <div className="flex flex-col tech-border p-2">
        <div className="flex justify-between items-center mb-1">
            <span className="text-amber-800 uppercase text-[10px] tracking-widest font-bold">Hull Integrity</span>
            <span className="text-[10px] text-stone-600">STRC</span>
        </div>
        <div className="flex items-end justify-between mb-1">
            <span className={`text-xl font-bold ${getStatusColor(ship.hull, ship.maxHull)}`}>
            {ship.hull}
            </span>
            <span className="text-xs text-stone-600">/{ship.maxHull}</span>
        </div>
        <div className="w-full bg-stone-900 h-1.5 flex gap-0.5">
            {Array.from({length: 10}).map((_, i) => (
                <div 
                    key={i} 
                    className={`flex-1 ${i < (ship.hull/ship.maxHull)*10 ? 'bg-amber-600' : 'bg-stone-800'}`}
                ></div>
            ))}
        </div>
      </div>

      {/* FUEL */}
      <div className="flex flex-col tech-border p-2">
        <div className="flex justify-between items-center mb-1">
            <span className="text-amber-800 uppercase text-[10px] tracking-widest font-bold">Promethium</span>
            <span className="text-[10px] text-stone-600">FUEL</span>
        </div>
        <div className="flex items-end justify-between">
            <span className={`text-xl font-bold ${getStatusColor(ship.fuel, ship.maxFuel)}`}>
            {ship.fuel}
            </span>
            <span className="text-xs text-stone-600">LITRES</span>
        </div>
        <div className="w-full h-0.5 bg-stone-800 mt-2 relative">
            <div className="absolute top-0 left-0 h-full bg-amber-600" style={{width: `${(ship.fuel/ship.maxFuel)*100}%`}}></div>
        </div>
      </div>

      {/* MORALE */}
      <div className="flex flex-col tech-border p-2">
        <div className="flex justify-between items-center mb-1">
            <span className="text-amber-800 uppercase text-[10px] tracking-widest font-bold">Morale</span>
            <span className="text-[10px] text-stone-600">OBDT</span>
        </div>
        <div className="flex items-center justify-between h-full">
            <span className={`text-xl font-bold ${ship.morale < 30 ? 'text-red-500' : 'text-amber-500'}`}>
            {ship.morale}%
            </span>
            <div className={`w-3 h-3 rounded-full ${ship.morale > 50 ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-red-500 animate-pulse'}`}></div>
        </div>
      </div>

      {/* CORRUPTION */}
      <div className="flex flex-col tech-border p-2 relative overflow-hidden">
        {ship.corruption > 50 && <div className="absolute inset-0 bg-purple-900/10 animate-pulse pointer-events-none"></div>}
        <div className="flex justify-between items-center mb-1">
            <span className="text-purple-900 uppercase text-[10px] tracking-widest font-bold">Corruption</span>
            <span className="text-[10px] text-stone-600">WARP</span>
        </div>
        <div className="flex items-end justify-between">
            <span className={`text-xl font-bold ${ship.corruption > 50 ? 'text-purple-400 text-glow' : 'text-stone-400'}`}>
            {ship.corruption}%
            </span>
        </div>
        <div className="w-full bg-stone-900 h-1 mt-2">
            <div className="bg-purple-700 h-full transition-all" style={{ width: `${Math.min(ship.corruption, 100)}%`}}></div>
        </div>
      </div>

      {/* PROFIT FACTOR */}
      <div className="flex flex-col tech-border p-2 border-amber-500/30">
        <div className="flex justify-between items-center mb-1">
            <span className="text-yellow-700 uppercase text-[10px] tracking-widest font-bold">Profit Factor</span>
            <span className="text-[10px] text-stone-600">GELD</span>
        </div>
        <div className="flex items-end justify-between mt-1">
            <span className="text-xl font-bold text-yellow-400 text-glow tracking-tighter">
            {ship.profitFactor.toLocaleString()}
            </span>
        </div>
      </div>

    </div>
  );
};