import React, { useState, useEffect, useCallback } from 'react';
import { Bridge } from './components/Bridge';
import { VoxArray } from './components/VoxArray';
import { TacticalCogitator } from './components/TacticalCogitator';
import { GameEngine } from './services/GameLogic';
import { GameState, Commodity, ShipUpgrades } from './types';

const INITIAL_UPGRADES: ShipUpgrades = {
  reinforcedProw: 0,
  sanctionedNavigator: 0,
  tradeMandate: 0,
  cargoExpansion: 0
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  
  // Load or Create Game
  useEffect(() => {
    const saved = localStorage.getItem('warrantOfDecay_save');
    if (saved) {
      try {
        setGameState(JSON.parse(saved));
      } catch (e) {
        console.error("Save file corrupted, purging archives.", e);
        startNewRun(0, INITIAL_UPGRADES);
      }
    } else {
      startNewRun(0, INITIAL_UPGRADES);
    }
  }, []);

  // Persistence Hook
  useEffect(() => {
    if (gameState) {
      localStorage.setItem('warrantOfDecay_save', JSON.stringify(gameState));
    }
  }, [gameState]);

  const startNewRun = (legacyPoints: number, upgrades: ShipUpgrades) => {
    const newState = GameEngine.createNewGame(legacyPoints, upgrades);
    setGameState(newState);
  };

  const handleTravel = useCallback((targetId: string) => {
    if (!gameState || gameState.isGameOver) return;
    const newState = GameEngine.travelTo(gameState, targetId);
    setGameState(newState);
  }, [gameState]);

  const handleBuy = useCallback((commodity: Commodity, qty: number) => {
    if (!gameState || gameState.isGameOver) return;
    const newState = GameEngine.buy(gameState, commodity, qty);
    setGameState(newState);
  }, [gameState]);

  const handleSell = useCallback((commodity: Commodity, qty: number) => {
    if (!gameState || gameState.isGameOver) return;
    const newState = GameEngine.sell(gameState, commodity, qty);
    setGameState(newState);
  }, [gameState]);

  const handleCleanse = useCallback(() => {
    if (!gameState || gameState.isGameOver) return;
    const newState = GameEngine.cleanse(gameState);
    setGameState(newState);
  }, [gameState]);

  const handleRebirth = (upgradeKey: keyof ShipUpgrades) => {
    if (!gameState) return;
    
    // Simple cost logic: 1000 PF worth of legacy points = 1 upgrade level
    const cost = 1000 * ((gameState.ship.upgrades[upgradeKey] || 0) + 1);
    
    if (gameState.legacyPoints >= cost) {
      const newUpgrades = { ...gameState.ship.upgrades };
      newUpgrades[upgradeKey]++;
      
      startNewRun(gameState.legacyPoints - cost, newUpgrades);
    }
  };

  // --- RENDER ---

  if (!gameState) return <div className="text-amber-500 font-mono p-10">Initializing Cogitators...</div>;

  // Visual Corruption Effect
  const corruptionLevel = gameState.ship.corruption;
  const getCorruptionStyle = () => {
    if (corruptionLevel < 30) return {};
    if (corruptionLevel < 60) return { filter: 'sepia(0.2) hue-rotate(-10deg)' };
    if (corruptionLevel < 90) return { filter: 'sepia(0.4) hue-rotate(-30deg) blur(0.5px)' };
    return { filter: 'sepia(0.8) hue-rotate(-50deg) blur(1px) contrast(1.2)', animation: 'pulse 2s infinite' };
  };

  if (gameState.isGameOver) {
    return (
      <div className="w-full h-screen bg-black flex flex-col items-center justify-center text-amber-500 font-mono p-4 crt bg-grid">
        <h1 className="text-4xl text-red-600 mb-4 border-b-2 border-red-900 pb-2 tracking-widest uppercase">Critical Failure</h1>
        <p className="text-xl mb-8 text-stone-400">The dynasty has fallen. The Warrant returns to the vaults.</p>
        
        <div className="bg-stone-950 p-8 border border-amber-900 rounded max-w-2xl w-full tech-border">
          <div className="flex justify-between mb-8 border-b border-amber-900/30 pb-4">
            <span className="text-stone-400">LEGACY POINTS AVAILABLE:</span>
            <span className="font-bold text-green-500 text-2xl text-glow">{gameState.legacyPoints}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => handleRebirth('reinforcedProw')}
              className="group flex flex-col p-4 border border-stone-800 hover:border-amber-600 hover:bg-amber-900/10 transition-all text-left"
            >
              <span className="text-amber-500 font-bold mb-1 group-hover:text-amber-400">REINFORCED PROW</span>
              <span className="text-xs text-stone-500 mb-2">Current Lvl: {gameState.ship.upgrades.reinforcedProw}</span>
              <span className="text-xs text-amber-700">Cost: {1000 * (gameState.ship.upgrades.reinforcedProw + 1)}</span>
            </button>
            <button 
              onClick={() => handleRebirth('sanctionedNavigator')}
              className="group flex flex-col p-4 border border-stone-800 hover:border-amber-600 hover:bg-amber-900/10 transition-all text-left"
            >
              <span className="text-amber-500 font-bold mb-1 group-hover:text-amber-400">SANCTIONED NAVIGATOR</span>
              <span className="text-xs text-stone-500 mb-2">Current Lvl: {gameState.ship.upgrades.sanctionedNavigator}</span>
              <span className="text-xs text-amber-700">Cost: {1000 * (gameState.ship.upgrades.sanctionedNavigator + 1)}</span>
            </button>
            <button 
              onClick={() => handleRebirth('tradeMandate')}
              className="group flex flex-col p-4 border border-stone-800 hover:border-amber-600 hover:bg-amber-900/10 transition-all text-left"
            >
              <span className="text-amber-500 font-bold mb-1 group-hover:text-amber-400">TRADE MANDATE</span>
              <span className="text-xs text-stone-500 mb-2">Current Lvl: {gameState.ship.upgrades.tradeMandate}</span>
              <span className="text-xs text-amber-700">Cost: {1000 * (gameState.ship.upgrades.tradeMandate + 1)}</span>
            </button>
            <button 
              onClick={() => handleRebirth('cargoExpansion')}
              className="group flex flex-col p-4 border border-stone-800 hover:border-amber-600 hover:bg-amber-900/10 transition-all text-left"
            >
              <span className="text-amber-500 font-bold mb-1 group-hover:text-amber-400">CARGO EXPANSION</span>
              <span className="text-xs text-stone-500 mb-2">Current Lvl: {gameState.ship.upgrades.cargoExpansion}</span>
              <span className="text-xs text-amber-700">Cost: {1000 * (gameState.ship.upgrades.cargoExpansion + 1)}</span>
            </button>
          </div>

          <button 
            onClick={() => startNewRun(gameState.legacyPoints, gameState.ship.upgrades)}
            className="w-full mt-8 bg-amber-900/20 hover:bg-amber-800 hover:text-white text-amber-500 p-4 font-bold border border-amber-600 uppercase tracking-widest transition-all"
          >
            Initiate Next Heir
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-black crt flex items-center justify-center p-2 md:p-8 bg-grid transition-all duration-1000" style={getCorruptionStyle()}>
        <div className="flex flex-col w-full h-full max-w-7xl mx-auto border border-stone-800 bg-stone-950 shadow-2xl overflow-hidden relative">
            {/* Screen Bezel Decoration */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-900/50 via-amber-500/50 to-amber-900/50 opacity-20 z-20"></div>
            
            <Bridge ship={gameState.ship} />
            <TacticalCogitator 
                state={gameState} 
                onTravel={handleTravel} 
                onBuy={handleBuy} 
                onSell={handleSell}
                onCleanse={handleCleanse}
            />
            <VoxArray logs={gameState.logs} />
        </div>
    </div>
  );
};

export default App;