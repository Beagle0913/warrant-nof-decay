import {
  GameState,
  MapNode,
  Planet,
  PlanetType,
  Commodity,
  COMMODITY_LIST,
  ShipState,
  ShipUpgrades,
  LogEntry
} from '../types';
import {
  MAP_SIZE,
  NODE_COUNT,
  CONNECTION_DISTANCE,
  ECONOMY_MODIFIERS,
  BASE_PRICES,
  INITIAL_HULL,
  INITIAL_FUEL,
  INITIAL_SUPPLIES,
  INITIAL_PF,
  BASE_CARGO_CAPACITY,
  CARGO_CAPACITY_PER_UPGRADE,
  FUEL_COST_PER_UNIT,
  SUPPLIES_COST_PER_UNIT,
  CLEANSE_BASE_COST,
  CLEANSE_AMOUNT
} from '../constants';

// --- UTILS ---
const uuid = () => Math.random().toString(36).substring(2, 9);
const distance = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));

const FLAVOR_TEXTS = {
  travel: [
    "The Geller Field flickers. Shadows dance on the bridge.",
    "Navigators report whispers in the warp. Morale holds, for now.",
    "Engine spirits scream as we translate back to real-space.",
    "Void-seals hiss. We have arrived.",
    "The Astronomican's light was dim, but we endured.",
    "Hull stress critical during translation. We stabilized at the last second.",
    "The Astropathic choir is bleeding from their eyes. Transition complete.",
    "We passed through a shoal of void-whales. Beautiful and terrifying.",
    "Time dilation detected. We have arrived 3 days before we left.",
    "The warp was calm, like a predator holding its breath."
  ],
  cleanse: [
    "Tech-priests anoint the bulkheads with sacred oils.",
    "The choir broadcasts hexagrammatic wards.",
    "Mutants are purged from the lower decks. Order restored.",
    "Incense clouds the bridge as the rites of banishment conclude.",
    "Sacred texts are recited over the ship's intercom.",
    "The Navigator has been sedated. The nightmare recedes."
  ],
  buy: [
      "Acquisition authorized. Servitors loading cargo.",
      "The local guilders accept our throne gelt.",
      "Supplies secured. The Quartermaster is pleased.",
      "Cargo bays filling. Heavy machinery active.",
      "Trade writ verified. The goods are ours."
  ],
  sell: [
      "Goods offloaded. The dynasty's coffers swell.",
      "A lucrative contract fulfilled.",
      "The planetary governor accepts our tithe.",
      "Cargo jettisoned into local orbiters. Payment received.",
      "Credits transferred. The deal is sealed."
  ],
  fail: [
      "Transaction denied. Servitors stand down.",
      "The Cogitator rejects the trade manifest.",
      "Local customs refuse our authority.",
      "Insufficient resources for this exchange."
  ]
};

// --- CLASSES ---

export class MapSystem {
  static generateMap(): Record<string, MapNode> {
    const nodes: Record<string, MapNode> = {};
    const planetNames = [
      "Vraks Prime", "Golgotha", "Necromunda Secundus", "Catachan IV", "Badab",
      "Cadia (Remnant)", "Armageddon", "Fenris System", "Baal", "Macragge",
      "Medusa", "Nocturne", "Prospero's Ash", "Tallarn", "Tanith's Ghost"
    ];
    
    const planetTypes = Object.values(PlanetType);

    // 1. Create Nodes
    for (let i = 0; i < NODE_COUNT; i++) {
      const id = uuid();
      const type = planetTypes[Math.floor(Math.random() * planetTypes.length)];
      
      const planet: Planet = {
        id,
        name: planetNames[i] || `Sector ${id.toUpperCase()}`,
        type,
        coordinates: {
          x: Math.floor(Math.random() * MAP_SIZE),
          y: Math.floor(Math.random() * MAP_SIZE)
        },
        market: {} as Record<Commodity, number>,
        inventory: {} as Record<Commodity, number>,
        description: `A ${type.toLowerCase()} in the dark void.`
      };

      // Initial Market Generation
      EconomyManager.refreshMarket(planet);

      nodes[id] = {
        planet,
        visited: false,
        connections: []
      };
    }

    // 2. Connect Nodes (Simple distance threshold)
    const nodeIds = Object.keys(nodes);
    
    // Ensure at least one connection for every node (Minimum Spanning Tree-ish)
    // First, connect strictly by distance
    for (let i = 0; i < nodeIds.length; i++) {
      for (let j = i + 1; j < nodeIds.length; j++) {
        const a = nodes[nodeIds[i]].planet.coordinates;
        const b = nodes[nodeIds[j]].planet.coordinates;
        if (distance(a, b) < CONNECTION_DISTANCE) {
          nodes[nodeIds[i]].connections.push(nodeIds[j]);
          nodes[nodeIds[j]].connections.push(nodeIds[i]);
        }
      }
    }

    // Safety pass: Ensure everyone has at least one neighbor
    for (const id of nodeIds) {
      if (nodes[id].connections.length === 0) {
        let closestId = "";
        let minDist = Infinity;
        for (const otherId of nodeIds) {
          if (id === otherId) continue;
          const dist = distance(nodes[id].planet.coordinates, nodes[otherId].planet.coordinates);
          if (dist < minDist) {
            minDist = dist;
            closestId = otherId;
          }
        }
        if (closestId) {
          nodes[id].connections.push(closestId);
          nodes[closestId].connections.push(id);
        }
      }
    }

    return nodes;
  }
}

export class EconomyManager {
  static refreshMarket(planet: Planet) {
    const modifiers = ECONOMY_MODIFIERS[planet.type];
    
    COMMODITY_LIST.forEach(comm => {
      // Fluctuation: +/- 20%
      const fluctuation = 0.8 + Math.random() * 0.4;
      
      // Buy Price: How much the PLANET sells it for (Player Buys)
      // Base * Modifier * Fluctuation
      const buyMult = modifiers[comm][1]; // Note: Modifier structure is [PlayerSell, PlayerBuy]
      planet.market[comm] = Math.floor(BASE_PRICES[comm] * buyMult * fluctuation);

      // Inventory
      planet.inventory[comm] = Math.floor(Math.random() * 50) + 10;
    });
  }

  static getSellPrice(planet: Planet, commodity: Commodity): number {
    const modifiers = ECONOMY_MODIFIERS[planet.type];
    const sellMult = modifiers[commodity][0]; // Player selling to planet
    // Sell price is usually lower than buy price to prevent infinite loops, unless demand is crazy
    return Math.floor(planet.market[commodity] * (sellMult / modifiers[commodity][1]) * 0.8);
  }
}

export class GameEngine {
  static createNewGame(legacyPoints: number, upgrades: ShipUpgrades): GameState {
    const map = MapSystem.generateMap();
    const startNodeId = Object.keys(map)[0];
    
    map[startNodeId].visited = true;

    return {
      ship: {
        hull: INITIAL_HULL + (upgrades.reinforcedProw * 20),
        maxHull: INITIAL_HULL + (upgrades.reinforcedProw * 20),
        fuel: INITIAL_FUEL,
        maxFuel: INITIAL_FUEL,
        supplies: INITIAL_SUPPLIES,
        morale: 100,
        corruption: 0,
        profitFactor: INITIAL_PF + (upgrades.tradeMandate * 200),
        cargo: {
          [Commodity.PROMETHIUM]: 0,
          [Commodity.FOOD]: 0,
          [Commodity.PARTS]: 0,
          [Commodity.ARTIFACTS]: 0,
          [Commodity.RELICS]: 0,
          [Commodity.MEDICINE]: 0
        },
        locationId: startNodeId,
        upgrades: upgrades
      },
      map,
      logs: [{
        id: Date.now(),
        timestamp: "000.M42",
        message: "Warrant of Trade authenticated. Systems online. The void awaits.",
        type: 'neutral'
      }],
      turn: 1,
      isGameOver: false,
      legacyPoints
    };
  }

  static travelTo(state: GameState, targetNodeId: string): GameState {
    const startNode = state.map[state.ship.locationId];
    const endNode = state.map[targetNodeId];
    
    const dist = distance(startNode.planet.coordinates, endNode.planet.coordinates);
    const fuelCost = Math.ceil(dist * FUEL_COST_PER_UNIT);
    const supplyCost = Math.ceil(dist * SUPPLIES_COST_PER_UNIT);

    // Check resources
    if (state.ship.fuel < fuelCost) {
      this.log(state, "Engines failed: Insufficient Promethium.", 'danger');
      return { ...state };
    }

    const newState = structuredClone(state);
    
    // Consume resources
    newState.ship.fuel -= fuelCost;
    newState.ship.supplies = Math.max(0, newState.ship.supplies - supplyCost);
    
    // Starvation check
    if (newState.ship.supplies === 0) {
      newState.ship.morale -= 10;
      this.log(newState, "Crew starves. Mutinies suppressed violently.", 'danger');
    }

    // Warp Event
    this.handleWarpTravel(newState, dist);

    // Update location
    newState.ship.locationId = targetNodeId;
    newState.map[targetNodeId].visited = true;
    newState.turn += 1;

    // Flavor Log
    const flavor = FLAVOR_TEXTS.travel[Math.floor(Math.random() * FLAVOR_TEXTS.travel.length)];
    this.log(newState, flavor, 'neutral');

    // Check Death
    if (newState.ship.hull <= 0) {
      newState.isGameOver = true;
      newState.legacyPoints += Math.floor(newState.ship.profitFactor / 10);
      this.log(newState, "HULL BREACH CRITICAL. VESSEL LOST.", 'danger');
    }
    
    // Check Corruption Death
    if (newState.ship.corruption >= 100) {
        newState.isGameOver = true;
        newState.legacyPoints += Math.floor(newState.ship.profitFactor / 20); // Penalty for corruption death
        this.log(newState, "THE GELLER FIELD COLLAPSES. WE ARE LOST.", 'warp');
    }

    return newState;
  }

  static handleWarpTravel(state: GameState, distance: number) {
    // Navigator Upgrade reduces risk
    const safetyBonus = state.ship.upgrades.sanctionedNavigator * 5;
    const currentCorruption = state.ship.corruption;
    
    // Base chance of event increases with corruption
    const eventChance = 20 + (currentCorruption / 2) - safetyBonus;
    const roll = Math.random() * 100;

    if (roll < eventChance) {
        // EVENT TRIGGERED
        // Determine severity based on corruption level
        let severity = 'low';
        if (currentCorruption > 30) severity = 'med';
        if (currentCorruption > 70) severity = 'high';

        // High corruption increases bad outcomes, but grants a small chance of "Warp Insight" (PF)
        
        if (severity === 'low') {
            state.ship.morale -= 5;
            state.ship.corruption += 2;
            this.log(state, "Whispers in the bulkheads. The crew is restless.", 'warp');
        } else if (severity === 'med') {
            const damage = Math.floor(Math.random() * 10) + 5;
            state.ship.hull -= damage;
            state.ship.corruption += 4;
            state.ship.morale -= 10;
            this.log(state, `Manifestation on Deck 9. Hull damaged (${damage}).`, 'danger');
        } else if (severity === 'high') {
            // Very bad things
            const outcome = Math.random();
            if (outcome < 0.3) {
                // Catastrophic Damage
                const damage = Math.floor(Math.random() * 20) + 15;
                state.ship.hull -= damage;
                this.log(state, `REALITY TEAR. Massive structural failure (${damage}).`, 'danger');
            } else if (outcome < 0.6) {
                // Cargo Corruption
                const commodities = Object.keys(state.ship.cargo) as Commodity[];
                const target = commodities[Math.floor(Math.random() * commodities.length)];
                if (state.ship.cargo[target] > 0) {
                    const lost = Math.ceil(state.ship.cargo[target] * 0.5);
                    state.ship.cargo[target] -= lost;
                    this.log(state, `The ${target} has fused into a fleshy mass. ${lost} units jettisoned.`, 'warp');
                } else {
                    state.ship.morale -= 20;
                    this.log(state, "The void stares back. Suicide rates spike.", 'danger');
                }
            } else {
                // Beneficial but corrupting
                const gain = Math.floor(Math.random() * 500);
                state.ship.profitFactor += gain;
                state.ship.corruption += 10;
                this.log(state, `The Warp grants forbidden knowledge. +${gain} PF. The cost is... steep.`, 'warp');
            }
        }
    } else {
      // Safe Travel
      if (Math.random() > 0.9) {
         state.ship.corruption = Math.max(0, state.ship.corruption - 1);
         this.log(state, "A calm tide in the empyrean soothes the machine spirit.", 'success');
      }
    }
  }

  static cleanse(state: GameState): GameState {
    const newState = structuredClone(state);
    
    // Scale cost by current corruption (harder to clean deep stains)
    const cost = Math.floor(CLEANSE_BASE_COST * (1 + (newState.ship.corruption / 50)));

    if (newState.ship.profitFactor >= cost && newState.ship.corruption > 0) {
        newState.ship.profitFactor -= cost;
        newState.ship.corruption = Math.max(0, newState.ship.corruption - CLEANSE_AMOUNT);
        newState.ship.morale = Math.min(100, newState.ship.morale + 5); // Cleansing improves morale
        
        const flavor = FLAVOR_TEXTS.cleanse[Math.floor(Math.random() * FLAVOR_TEXTS.cleanse.length)];
        this.log(newState, flavor, 'success');
    } else {
        this.log(newState, "Ritual denied: Insufficient resources or purity.", 'danger');
    }

    return newState;
  }

  static log(state: GameState, message: string, type: LogEntry['type'] = 'neutral') {
    state.logs.unshift({
      id: Date.now() + Math.random(),
      timestamp: `${state.turn.toString().padStart(3, '0')}.M42`,
      message,
      type
    });
    if (state.logs.length > 50) state.logs.pop();
  }

  static buy(state: GameState, commodity: Commodity, quantity: number): GameState {
    const newState = structuredClone(state);
    const planet = newState.map[newState.ship.locationId].planet;
    const price = planet.market[commodity];
    const totalCost = price * quantity;
    
    // Calculate current cargo volume
    const currentCargo = Object.values(newState.ship.cargo).reduce((a, b) => a + b, 0);
    
    // Dynamic Capacity Calculation
    const maxCapacity = BASE_CARGO_CAPACITY + (newState.ship.upgrades.cargoExpansion * CARGO_CAPACITY_PER_UPGRADE);
    
    if (currentCargo + quantity > maxCapacity) {
      this.log(newState, "Transaction denied: Cargo bays at maximum capacity.", 'danger');
      return newState;
    }

    if (newState.ship.profitFactor >= totalCost && planet.inventory[commodity] >= quantity) {
      newState.ship.profitFactor -= totalCost;
      newState.ship.cargo[commodity] += quantity;
      planet.inventory[commodity] -= quantity;
      
      const flavor = FLAVOR_TEXTS.buy[Math.floor(Math.random() * FLAVOR_TEXTS.buy.length)];
      this.log(newState, `${flavor} (${quantity} ${commodity}, -${totalCost} PF)`, 'success');
    } else {
      const flavor = FLAVOR_TEXTS.fail[Math.floor(Math.random() * FLAVOR_TEXTS.fail.length)];
      this.log(newState, `${flavor} (Insufficient funds/stock)`, 'danger');
    }
    return newState;
  }

  static sell(state: GameState, commodity: Commodity, quantity: number): GameState {
    const newState = structuredClone(state);
    const planet = newState.map[newState.ship.locationId].planet;
    // Corruption Bonus: High corruption = unscrupulous trading (+Profit)
    const corruptionBonus = 1 + (newState.ship.corruption / 200); 
    const price = Math.floor(EconomyManager.getSellPrice(planet, commodity) * corruptionBonus);
    const totalValue = price * quantity;

    if (newState.ship.cargo[commodity] >= quantity) {
      newState.ship.cargo[commodity] -= quantity;
      newState.ship.profitFactor += totalValue;
      planet.inventory[commodity] += quantity;
      
      const flavor = FLAVOR_TEXTS.sell[Math.floor(Math.random() * FLAVOR_TEXTS.sell.length)];
      this.log(newState, `${flavor} (${quantity} ${commodity}, +${totalValue} PF)`, 'success');
      
      // Corruption Check for selling illegal goods
      if (commodity === Commodity.RELICS || commodity === Commodity.ARTIFACTS) {
        if (Math.random() > 0.7) {
            newState.ship.corruption += 2;
            this.log(newState, "The trade carries a lingering taint.", 'warp');
        }
      }

    } else {
      this.log(newState, "Transaction denied: Insufficient cargo.", 'danger');
    }
    return newState;
  }
}