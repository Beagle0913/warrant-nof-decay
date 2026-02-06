import React from 'react';
import { GameState, MapNode } from '../types';
import { MAP_SIZE } from '../constants';

interface StarMapProps {
  state: GameState;
  onTravel: (nodeId: string) => void;
}

export const StarMap: React.FC<StarMapProps> = ({ state, onTravel }) => {
  const currentNode = state.map[state.ship.locationId];
  
  // Scale factor for SVG
  const SCALE = 5; 
  
  return (
    <div className="w-full h-full bg-black relative overflow-hidden flex flex-col">
        <div className="absolute top-4 left-4 text-amber-500 text-xs font-bold z-10 bg-black/80 px-3 py-2 border border-amber-900/50 shadow-lg backdrop-blur-md">
            SECTOR SCAN: {currentNode.planet.name.toUpperCase()}
        </div>
        
      <svg 
        viewBox={`0 0 ${MAP_SIZE * SCALE} ${MAP_SIZE * SCALE}`} 
        className="w-full h-full max-h-[500px] bg-stone-950"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#1c1917" strokeWidth="0.5"/>
            </pattern>
            <filter id="glow">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>

        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Connections */}
        {Object.values(state.map).map((node: MapNode) => 
          node.connections.map(targetId => {
            const target = state.map[targetId];
            // Only draw if one end is visited or visible
            const isVisible = node.visited || target.visited || 
                              state.map[state.ship.locationId].connections.includes(node.planet.id) ||
                              state.map[state.ship.locationId].connections.includes(target.planet.id);
            
            if (!isVisible) return null;

            // Charted = Both ends visited. Uncharted = One end unvisited.
            const isCharted = node.visited && target.visited;

            return (
              <line
                key={`${node.planet.id}-${target.planet.id}`}
                x1={node.planet.coordinates.x * SCALE}
                y1={node.planet.coordinates.y * SCALE}
                x2={target.planet.coordinates.x * SCALE}
                y2={target.planet.coordinates.y * SCALE}
                stroke={isCharted ? "#d97706" : "#44403c"}
                strokeWidth={isCharted ? "1.5" : "1"}
                strokeDasharray={isCharted ? "none" : "4 4"}
                opacity={isCharted ? "0.8" : "0.5"}
              />
            );
          })
        )}

        {/* Nodes */}
        {Object.values(state.map).map((node: MapNode) => {
            const isCurrent = node.planet.id === state.ship.locationId;
            const isConnected = currentNode.connections.includes(node.planet.id);
            const isVisited = node.visited;
            
            // Fog of War
            const isVisible = isCurrent || isVisited || isConnected;

            if (!isVisible) return null;

            const isTravelable = isConnected && !isCurrent;

            return (
                <g 
                    key={node.planet.id} 
                    onClick={() => isTravelable ? onTravel(node.planet.id) : null}
                    className={isTravelable ? 'cursor-pointer hover:brightness-125 transition-all duration-200' : ''}
                >
                     {/* Interaction Hit Area (Invisible but large) */}
                     <circle
                        cx={node.planet.coordinates.x * SCALE}
                        cy={node.planet.coordinates.y * SCALE}
                        r={15}
                        fill="transparent"
                    />

                    {/* Current Location Ping */}
                    {isCurrent && (
                        <circle
                            cx={node.planet.coordinates.x * SCALE}
                            cy={node.planet.coordinates.y * SCALE}
                            r={25}
                            fill="none"
                            stroke="#00ff41"
                            strokeWidth="0.5"
                            opacity="0.3"
                            className="animate-pulse"
                        />
                    )}

                    {/* Selection Ring for Travel Targets */}
                    {isTravelable && (
                        <circle 
                            cx={node.planet.coordinates.x * SCALE}
                            cy={node.planet.coordinates.y * SCALE}
                            r={9}
                            fill="none"
                            stroke="#fbbf24" 
                            strokeWidth="1"
                            strokeDasharray="3 3"
                            className="animate-spin opacity-70 origin-center"
                            style={{ 
                                animationDuration: '8s', 
                                transformBox: 'fill-box', 
                                transformOrigin: 'center' 
                            }}
                        />
                    )}

                    {/* Node Body */}
                    <circle
                        cx={node.planet.coordinates.x * SCALE}
                        cy={node.planet.coordinates.y * SCALE}
                        r={isCurrent ? 7 : 5}
                        fill={isCurrent ? '#00ff41' : (isVisited ? '#f59e0b' : '#1c1917')} // Green / Amber / Dark Stone
                        stroke={isCurrent ? '#003300' : (isVisited ? '#78350f' : '#57534e')}
                        strokeWidth={isTravelable ? "2" : "1"}
                        filter={isCurrent ? "url(#glow)" : ""}
                        className="transition-all duration-300"
                    />
                    
                    {/* Planet Name */}
                    <text
                        x={node.planet.coordinates.x * SCALE}
                        y={(node.planet.coordinates.y * SCALE) + 16}
                        textAnchor="middle"
                        fill={isCurrent ? '#4ade80' : (isVisited ? '#fbbf24' : '#a8a29e')} // Text Colors: Green / Amber / Stone
                        fontSize="10"
                        fontWeight="bold"
                        className="font-mono uppercase tracking-wider select-none pointer-events-none"
                        style={{ 
                            textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,1)' 
                        }}
                    >
                        {node.planet.name.split(' ')[0]}
                    </text>
                </g>
            );
        })}
      </svg>

      {/* Legend & Stats */}
      <div className="absolute bottom-2 right-2 text-[10px] text-amber-900 font-mono text-right bg-black/90 p-3 border border-amber-900/30 backdrop-blur-md rounded-tl-lg">
        <div className="flex items-center justify-end gap-2 mb-1">
            <span className="text-stone-400 font-bold">UNKNOWN</span>
            <div className="w-2 h-2 rounded-full bg-[#1c1917] border border-stone-600"></div>
        </div>
        <div className="flex items-center justify-end gap-2 mb-1">
            <span className="text-amber-500 font-bold">VISITED</span>
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
        </div>
        <div className="flex items-center justify-end gap-2 mb-2">
            <span className="text-green-500 font-bold">CURRENT</span>
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]"></div>
        </div>
        <div className="h-px bg-amber-900/30 w-full mb-2"></div>
        <p className="text-stone-500">TRAVEL_COST: <span className="text-amber-600">1 FUEL/LY</span></p>
        <p className="text-stone-500">SUPPLY_DRAIN: <span className="text-amber-600">0.5 /LY</span></p>
      </div>
    </div>
  );
};