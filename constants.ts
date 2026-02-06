import { PlanetType, Commodity } from './types';

export const MAP_SIZE = 100;
export const NODE_COUNT = 15;
export const CONNECTION_DISTANCE = 35;

export const INITIAL_HULL = 100;
export const INITIAL_FUEL = 500;
export const INITIAL_SUPPLIES = 50;
export const INITIAL_PF = 1000;

export const BASE_CARGO_CAPACITY = 250;
export const CARGO_CAPACITY_PER_UPGRADE = 50;

export const FUEL_COST_PER_UNIT = 1;
export const SUPPLIES_COST_PER_UNIT = 0.5;

export const CLEANSE_BASE_COST = 200; // PF cost to remove corruption
export const CLEANSE_AMOUNT = 10;

// Base prices for commodities
export const BASE_PRICES: Record<Commodity, number> = {
  [Commodity.PROMETHIUM]: 50,
  [Commodity.FOOD]: 10,
  [Commodity.PARTS]: 100,
  [Commodity.ARTIFACTS]: 500,
  [Commodity.RELICS]: 1000,
  [Commodity.MEDICINE]: 75
};

// Modifiers: [Sell Multiplier (Player sells to planet), Buy Multiplier (Player buys from planet)]
// < 1.0 means cheap/low value. > 1.0 means expensive/high value.
export const ECONOMY_MODIFIERS: Record<PlanetType, Record<Commodity, [number, number]>> = {
  [PlanetType.FORGE_WORLD]: {
    [Commodity.PROMETHIUM]: [1.2, 1.2],
    [Commodity.FOOD]: [1.5, 1.5], // Needs food
    [Commodity.PARTS]: [0.5, 0.6], // Produces parts
    [Commodity.ARTIFACTS]: [1.5, 2.0], // Researches
    [Commodity.RELICS]: [1.0, 1.0],
    [Commodity.MEDICINE]: [1.2, 1.2]
  },
  [PlanetType.HIVE_WORLD]: {
    [Commodity.PROMETHIUM]: [1.0, 1.0],
    [Commodity.FOOD]: [2.0, 2.5], // Starving
    [Commodity.PARTS]: [1.0, 1.0],
    [Commodity.ARTIFACTS]: [0.8, 0.8],
    [Commodity.RELICS]: [0.5, 0.5], // Illegal/Dangerous
    [Commodity.MEDICINE]: [1.5, 1.8] // High demand
  },
  [PlanetType.AGRI_WORLD]: {
    [Commodity.PROMETHIUM]: [1.2, 1.5],
    [Commodity.FOOD]: [0.3, 0.4], // Produces food
    [Commodity.PARTS]: [1.5, 1.8], // Needs machinery
    [Commodity.ARTIFACTS]: [0.5, 0.5],
    [Commodity.RELICS]: [0.5, 0.5],
    [Commodity.MEDICINE]: [1.0, 1.0]
  },
  [PlanetType.DEATH_WORLD]: {
    [Commodity.PROMETHIUM]: [2.0, 2.5], // Hard to get
    [Commodity.FOOD]: [2.0, 2.0],
    [Commodity.PARTS]: [2.0, 2.0],
    [Commodity.ARTIFACTS]: [1.5, 1.5],
    [Commodity.RELICS]: [0.5, 0.5],
    [Commodity.MEDICINE]: [2.0, 3.0] // Desperate
  },
  [PlanetType.FRONTIER_OUTPOST]: {
    [Commodity.PROMETHIUM]: [0.8, 1.0], // Often mining
    [Commodity.FOOD]: [1.2, 1.2],
    [Commodity.PARTS]: [1.3, 1.5],
    [Commodity.ARTIFACTS]: [0.5, 0.5], // Doesn't care
    [Commodity.RELICS]: [1.5, 2.0], // High value for black market
    [Commodity.MEDICINE]: [1.5, 1.5]
  }
};