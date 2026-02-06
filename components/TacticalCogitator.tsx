import React, { useState } from 'react';
import { GameState, Commodity, COMMODITY_LIST } from '../types';
import { StarMap } from './StarMap';
import { EconomyManager } from '../services/GameLogic';
import { BASE_CARGO_CAPACITY, CARGO_CAPACITY_PER_UPGRADE, CLEANSE_BASE_COST } from '../constants';

interface TacticalCogitatorProps {
  state: GameState;
  onTravel: (id: string) => void;
  onBuy: (c: Commodity, q: number) => void;
  onSell: (c: Commodity, q: number) => void;
  onCleanse: () => void;
}

export const TacticalCogitator: React.FC<TacticalCogitatorProps> = ({ state, onTravel, onBuy, onSell, onCleanse }) => {
  const [activeTab, setActiveTab] = useState<'MAP' | 'TRADE' | 'CARGO'>('MAP');
  const currentPlanet = state.map[state.ship.locationId].planet;
  const totalCargo = Object.values(state.ship.cargo).reduce((a, b) => a + b, 0);
  const maxCapacity = BASE_CARGO_CAPACITY + (state.ship.upgrades.cargoExpansion * CARGO_CAPACITY_PER_UPGRADE);
  
  // Calculate Cleanse Cost dynamically
  const cleanseCost = Math.floor(CLEANSE_BASE_COST * (1 + (state.ship.corruption / 50)));

  const getTabStyle = (tab: string) => `
    flex items-center justify-between p-4 cursor-pointer transition-all duration-200 border-l-2
    ${activeTab === tab 
      ? 'bg-amber-900/20 border-amber-500 text-amber-400 shadow-[inset_0_0_10px_rgba(245,158,11,0.1)]' 
      : 'border-transparent text-stone-600 hover:bg-amber-900/10 hover:text-amber-700'}
  `;

  return (
    <div className="flex-1 bg-stone-950 p-4 flex flex-col md:flex-row gap-4 overflow-hidden relative">
      {/* Background Grid for the whole cogitator */}
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none"></div>

      {/* Sidebar / Menu */}
      <div className="w-full md:w-64 flex flex-col gap-3 z-10 shrink-0">
        <div className="text-[10px] text-stone-600 uppercase tracking-widest mb-1 border-b border-stone-800 pb-1">
            // INTERFACE_MAIN
        </div>
        
        <button onClick={() => setActiveTab('MAP')} className={getTabStyle('MAP')}>
            <span className="font-bold tracking-wider">[1] NAVIS MAP</span>
            <div className={`w-2 h-2 rounded-sm ${activeTab === 'MAP' ? 'bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.8)]' : 'bg-stone-800'}`}></div>
        </button>
        
        <button onClick={() => setActiveTab('TRADE')} className={getTabStyle('TRADE')}>
            <span className="font-bold tracking-wider">[2] MERCANTILE</span>
            <div className={`w-2 h-2 rounded-sm ${activeTab === 'TRADE' ? 'bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.8)]' : 'bg-stone-800'}`}></div>
        </button>
        
        <button onClick={() => setActiveTab('CARGO')} className={getTabStyle('CARGO')}>
            <span className="font-bold tracking-wider">[3] MANIFEST</span>
            <div className={`w-2 h-2 rounded-sm ${activeTab === 'CARGO' ? 'bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.8)]' : 'bg-stone-800'}`}></div>
        </button>
        
        <div className="mt-auto flex flex-col gap-2">
            {/* Cleanse Button */}
            <button
                disabled={state.ship.profitFactor < cleanseCost || state.ship.corruption === 0}
                onClick={onCleanse}
                className="group border border-purple-900/50 hover:border-purple-500 bg-purple-900/10 p-2 text-left disabled:opacity-30 disabled:border-stone-800 transition-all"
            >
                <div className="text-[10px] text-purple-400 uppercase tracking-widest mb-1 group-hover:text-purple-300">
                    RITUAL: SANCTIFY SHIP
                </div>
                <div className="flex justify-between items-end">
                    <span className="text-stone-400 text-xs">-10 WARP</span>
                    <span className="text-yellow-600 text-xs font-bold">{cleanseCost} PF</span>
                </div>
            </button>

            <div className="tech-border p-4 bg-black/60">
                <div className="tech-panel-header px-2 py-1 mb-2">
                    <h3 className="text-amber-700 text-[10px] font-bold tracking-widest">LOCAL SYSTEM SCAN</h3>
                </div>
                <p className="text-lg text-amber-500 mb-1 font-bold">{currentPlanet.name}</p>
                <p className="text-xs text-stone-400 mb-4 uppercase">{currentPlanet.type}</p>
                <p className="text-xs text-stone-500 italic border-l-2 border-stone-800 pl-2 leading-tight">
                    "{currentPlanet.description}"
                </p>
            </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 tech-border bg-black/40 relative flex flex-col min-w-0 z-10">
        {/* Top decoration bar */}
        <div className="h-6 bg-stone-900/50 border-b border-amber-900/20 flex items-center justify-between px-3">
             <span className="text-[10px] text-amber-900">TERMINAL_ID: 492-B // AUTH_USER: ROGUE_TRADER</span>
             <div className="flex gap-1">
                <div className="w-1 h-1 bg-amber-900 rounded-full"></div>
                <div className="w-1 h-1 bg-amber-900 rounded-full"></div>
                <div className="w-1 h-1 bg-amber-900 rounded-full"></div>
             </div>
        </div>

        <div className="flex-1 relative overflow-hidden">
            {activeTab === 'MAP' && (
                <StarMap state={state} onTravel={onTravel} />
            )}

            {activeTab === 'TRADE' && (
                <div className="p-4 h-full overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 gap-2">
                        <div className="flex justify-between text-[10px] text-stone-500 border-b border-stone-800 pb-2 mb-2 font-bold tracking-wider px-2">
                            <span className="w-1/3">COMMODITY</span>
                            <span className="w-1/6 text-right">MKT PRICE</span>
                            <span className="w-1/6 text-right">STOCK</span>
                            <span className="w-1/6 text-right">HOLD</span>
                            <span className="w-1/6 text-right">ACTION</span>
                        </div>

                        {COMMODITY_LIST.map((comm, idx) => {
                            const price = currentPlanet.market[comm];
                            const stock = currentPlanet.inventory[comm];
                            const owned = state.ship.cargo[comm];
                            const isEven = idx % 2 === 0;

                            return (
                                <div key={comm} className={`flex items-center justify-between text-sm py-3 px-2 border-l-2 border-transparent hover:border-amber-500 transition-colors ${isEven ? 'bg-stone-900/20' : ''}`}>
                                    <span className="w-1/3 text-amber-600 font-bold">{comm}</span>
                                    <div className="w-1/6 text-right flex flex-col">
                                        <span className="text-stone-300">{price}</span>
                                    </div>
                                    <span className="w-1/6 text-right text-stone-500">{stock}</span>
                                    <span className="w-1/6 text-right text-amber-400 font-bold">{owned}</span>
                                    <div className="w-1/6 flex justify-end gap-1">
                                        <button 
                                            disabled={stock <= 0 || state.ship.profitFactor < price}
                                            onClick={() => onBuy(comm, 1)}
                                            className="w-6 h-6 flex items-center justify-center bg-stone-800 text-green-500 border border-stone-700 hover:border-green-500 hover:text-green-400 hover:shadow-[0_0_5px_rgba(34,197,94,0.3)] disabled:opacity-20 disabled:border-stone-800 disabled:shadow-none transition-all"
                                        >
                                            +
                                        </button>
                                        <button 
                                            disabled={owned <= 0}
                                            onClick={() => onSell(comm, 1)}
                                            className="w-6 h-6 flex items-center justify-center bg-stone-800 text-red-500 border border-stone-700 hover:border-red-500 hover:text-red-400 hover:shadow-[0_0_5px_rgba(239,68,68,0.3)] disabled:opacity-20 disabled:border-stone-800 disabled:shadow-none transition-all"
                                        >
                                            -
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {activeTab === 'CARGO' && (
                <div className="p-6 h-full overflow-y-auto font-mono custom-scrollbar">
                    <div className="flex justify-between items-end border-b border-amber-900/50 pb-2 mb-6">
                         <h2 className="text-amber-500 text-lg tracking-widest">CARGO MANIFEST</h2>
                         <span className="text-xs text-stone-500">CAPACITY_LIMIT_ENFORCED</span>
                    </div>
                    
                    {/* Capacity Bar */}
                    <div className="mb-8 p-4 border border-dashed border-stone-700 bg-stone-900/30">
                        <div className="flex justify-between text-xs text-amber-700 mb-2 font-bold tracking-wider">
                            <span>STORAGE UTILIZATION</span>
                            <span className={totalCargo >= maxCapacity ? 'text-red-500 animate-pulse' : 'text-amber-500'}>
                                {totalCargo} / {maxCapacity} UNITS
                            </span>
                        </div>
                        <div className="w-full h-4 bg-black border border-stone-600 p-0.5 flex gap-0.5">
                            {Array.from({length: 20}).map((_, i) => {
                                const fillPct = (totalCargo / maxCapacity) * 20;
                                return (
                                    <div 
                                        key={i}
                                        className={`flex-1 ${i < fillPct ? (totalCargo >= maxCapacity ? 'bg-red-700' : 'bg-amber-600') : 'bg-stone-900'}`}
                                    ></div>
                                )
                            })}
                        </div>
                    </div>

                    {/* List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {COMMODITY_LIST.map(comm => {
                            const qty = state.ship.cargo[comm];
                            return (
                                <div key={comm} className={`border p-4 flex justify-between items-center transition-all relative overflow-hidden group ${qty > 0 ? 'border-amber-900/40 bg-amber-900/05' : 'border-stone-800 opacity-50'}`}>
                                    {qty > 0 && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-600"></div>}
                                    <div className="flex flex-col z-10">
                                        <span className="text-amber-600 text-sm tracking-wider uppercase font-bold group-hover:text-amber-400">{comm}</span>
                                        {qty > 0 && <span className="text-[10px] text-stone-500">STASIS_FIELD_ACTIVE</span>}
                                    </div>
                                    <span className={`text-2xl font-bold z-10 ${qty > 0 ? 'text-amber-400' : 'text-stone-700'}`}>
                                        {qty}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};