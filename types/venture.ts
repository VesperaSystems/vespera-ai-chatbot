export type NodeType =
  | "company"
  | "investor"
  | "founder"
  | "university"
  | "sector";

export type EdgeType =
  | "invested_in"
  | "founded_by"
  | "studied_at"
  | "worked_at"
  | "acquired_by"
  | "board_member_of";

export type FundingStage =
  | "Pre-Seed"
  | "Seed"
  | "Series A"
  | "Series B"
  | "Series C"
  | "Growth"
  | null;

export interface VentureNodeMetrics {
  influenceScore: number;
  employeeEstimate: number;
  totalFundingGBP: number;
  connectionCount: number;
}

export interface VentureNode {
  id: string;
  type: NodeType;
  name: string;
  description: string;
  country: string | null;
  sector: string | null;
  stage: FundingStage;
  valuationGBP: number | null;
  foundedYear: number | null;
  website: string | null;
  tags: string[];
  metrics: VentureNodeMetrics;
}

export interface VentureEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  label: string;
  year: number;
  strength: number;
}

export interface MarketGraphFilters {
  valuationBand: "all" | "under50m" | "50m-250m" | "250m-1b" | "1b+";
  sector: string;
  country: string;
  stage: string;
  investor: string;
  year: string;
  search: string;
}

export interface PositionedVentureNode extends VentureNode {
  position: [number, number, number];
  radius: number;
  color: string;
}
