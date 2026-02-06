export enum PlanetType {
  FORGE_WORLD = 'Forge World',
  HIVE_WORLD = 'Hive World',
  AGRI_WORLD = 'Agri-World',
  DEATH_WORLD = 'Death World',
  FRONTIER_OUTPOST = 'Frontier Outpost'
}

export enum Commodity {
  PROMETHIUM = 'Promethium', // Fuel equivalent for trade, though we track ship fuel separately
  FOOD = 'Corpse-Starch',
  PARTS = 'Manufactorum Parts',
  ARTIFACTS = 'Xenos Artifacts',
  RELICS = 'Warp-Relics',
  MEDICINE = 'Narthecium Supplies'
}

export interface Coordinates {
  x: number;
  y: number;
}

export interface Planet {
  id: string;
  name: string;
  type: PlanetType;
  coordinates: Coordinates;
  market: Record<Commodity, number>; // Price per unit
  inventory: Record<Commodity, number>; // Quantity available
  description: string;
}

export interface MapNode {
  planet: Planet;
  visited: boolean;
  connections: string[]; // IDs of connected nodes
}

export interface ShipUpgrades {
  reinforcedProw: number; // Reduces hull damage
  sanctionedNavigator: number; // Reduces warp peril chance
  tradeMandate: number; // Improves buy/sell prices
  cargoExpansion: number; // Increases max cargo capacity
}

export interface ShipState {
  hull: number;
  maxHull: number;
  fuel: number;
  maxFuel: number;
  supplies: number; // Used for traveling
  morale: number;
  corruption: number; // 0-100
  profitFactor: number; // Currency/Score
  cargo: Record<Commodity, number>;
  locationId: string;
  upgrades: ShipUpgrades;
}

export interface LogEntry {
  id: number;
  timestamp: string;
  message: string;
  type: 'neutral' | 'danger' | 'success' | 'warp';
}

export interface GameState {
  ship: ShipState;
  map: Record<string, MapNode>;
  logs: LogEntry[];
  turn: number;
  isGameOver: boolean;
  legacyPoints: number; // Persistent across runs
}

export const COMMODITY_LIST = [
  Commodity.PROMETHIUM,
  Commodity.FOOD,
  Commodity.PARTS,
  Commodity.ARTIFACTS,
  Commodity.RELICS,
  Commodity.MEDICINE
];