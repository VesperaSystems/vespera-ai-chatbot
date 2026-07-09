import { ventureEdges, ventureNodes } from "@/data/venture-seed";
import {
  MarketGraphFilters,
  PositionedVentureNode,
  VentureEdge,
  VentureNode,
} from "@/types/venture";

const NODE_COLORS: Record<VentureNode["type"], string> = {
  company: "#FAFAFA",
  investor: "#D4D4D8",
  founder: "#A1A1AA",
  university: "#71717A",
  sector: "#E4E4E7",
};

const TYPE_ORDER: VentureNode["type"][] = [
  "sector",
  "investor",
  "company",
  "founder",
  "university",
];

export const defaultFilters: MarketGraphFilters = {
  valuationBand: "all",
  sector: "all",
  country: "all",
  stage: "all",
  investor: "all",
  year: "all",
  search: "",
};

function valuationBandMatches(value: number | null, band: MarketGraphFilters["valuationBand"]) {
  if (band === "all") return true;
  if (value === null) return false;
  if (band === "under50m") return value < 50000000;
  if (band === "50m-250m") return value >= 50000000 && value < 250000000;
  if (band === "250m-1b") return value >= 250000000 && value < 1000000000;
  return value >= 1000000000;
}

function searchMatches(node: VentureNode, search: string) {
  if (!search) return true;
  const haystack = [
    node.name,
    node.description,
    node.country ?? "",
    node.sector ?? "",
    node.stage ?? "",
    node.tags.join(" "),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(search.toLowerCase());
}

export function getFilterOptions() {
  const companies = ventureNodes.filter((node) => node.type === "company");
  const investors = ventureNodes.filter((node) => node.type === "investor");

  const sectors = [
    ...new Set(companies.map((node) => node.sector).filter((value): value is string => Boolean(value))),
  ].sort();
  const countries = [
    ...new Set(companies.map((node) => node.country).filter((value): value is string => Boolean(value))),
  ].sort();
  const stages: string[] = [
    ...new Set(companies.flatMap((node) => (node.stage ? [node.stage] : []))),
  ].sort();

  return {
    sectors,
    countries,
    stages,
    investors: investors.map((node) => node.name).sort(),
    years: [...new Set(ventureEdges.map((edge) => String(edge.year)))].sort(),
  };
}

export function getVisibleGraph(filters: MarketGraphFilters) {
  const companyNodes = ventureNodes.filter((node) => node.type === "company");
  const investorMap = new Map(
    ventureNodes.filter((node) => node.type === "investor").map((node) => [node.id, node.name]),
  );

  const matchedCompanies = companyNodes.filter((node) => {
    const passesBaseFilters =
      valuationBandMatches(node.valuationGBP, filters.valuationBand) &&
      (filters.sector === "all" || node.sector === filters.sector) &&
      (filters.country === "all" || node.country === filters.country) &&
      (filters.stage === "all" || node.stage === filters.stage) &&
      searchMatches(node, filters.search);

    if (!passesBaseFilters) return false;

    if (filters.investor !== "all") {
      const hasInvestor = ventureEdges.some(
        (edge) =>
          edge.type === "invested_in" &&
          edge.target === node.id &&
          investorMap.get(edge.source) === filters.investor,
      );

      if (!hasInvestor) return false;
    }

    if (filters.year !== "all") {
      const activeInYear = ventureEdges.some(
        (edge) => edge.target === node.id && String(edge.year) === filters.year,
      );

      if (!activeInYear) return false;
    }

    return true;
  });

  const matchedCompanyIds = new Set(matchedCompanies.map((node) => node.id));
  const relatedEdges = ventureEdges.filter(
    (edge) => matchedCompanyIds.has(edge.source) || matchedCompanyIds.has(edge.target),
  );
  const relatedNodeIds = new Set<string>([
    ...matchedCompanyIds,
    ...relatedEdges.flatMap((edge) => [edge.source, edge.target]),
  ]);

  const matchedOtherNodes = ventureNodes.filter(
    (node) => node.type !== "company" && relatedNodeIds.has(node.id) && searchMatches(node, filters.search),
  );

  const focusIds = new Set<string>([
    ...matchedCompanies.map((node) => node.id),
    ...matchedOtherNodes.map((node) => node.id),
  ]);

  ventureEdges.forEach((edge) => {
    if (focusIds.has(edge.source) || focusIds.has(edge.target)) {
      focusIds.add(edge.source);
      focusIds.add(edge.target);
    }
  });

  const visibleNodes = ventureNodes.filter((node) => focusIds.has(node.id));
  const visibleEdges = ventureEdges.filter(
    (edge) => focusIds.has(edge.source) && focusIds.has(edge.target),
  );

  return {
    nodes: projectNodes(visibleNodes),
    edges: visibleEdges,
  };
}

function projectNodes(nodes: VentureNode[]): PositionedVentureNode[] {
  const counts = TYPE_ORDER.reduce<Record<VentureNode["type"], number>>(
    (accumulator, type) => ({ ...accumulator, [type]: nodes.filter((node) => node.type === type).length }),
    {
      company: 0,
      investor: 0,
      founder: 0,
      university: 0,
      sector: 0,
    },
  );

  const typeIndices = {
    company: 0,
    investor: 0,
    founder: 0,
    university: 0,
    sector: 0,
  };

  return nodes
    .slice()
    .sort(
      (a, b) => TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type) || a.name.localeCompare(b.name),
    )
    .map((node) => {
      const index = typeIndices[node.type]++;
      const total = counts[node.type] || 1;
      const angle = (index / total) * Math.PI * 2;

      const layout = getTypeLayout(node.type, angle, index);
      const influenceBase = node.valuationGBP
        ? Math.min(2.8, 0.82 + Math.log10(node.valuationGBP / 1000000 + 1) * 0.34)
        : 0.76 + node.metrics.influenceScore / 180;

      return {
        ...node,
        position: layout,
        radius: Number(influenceBase.toFixed(2)),
        color: NODE_COLORS[node.type],
      };
    });
}

function getTypeLayout(type: VentureNode["type"], angle: number, index: number): [number, number, number] {
  switch (type) {
    case "company":
      return [Math.cos(angle) * 9, Math.sin(angle * 2) * 2.8, Math.sin(angle) * 9];
    case "investor":
      return [Math.cos(angle) * 16, 6 + Math.sin(angle * 2) * 2, Math.sin(angle) * 12];
    case "founder":
      return [Math.cos(angle) * 14, -7 + Math.cos(angle * 2) * 2, Math.sin(angle) * 11];
    case "university":
      return [Math.cos(angle) * 19, -1 + Math.sin(angle) * 4, Math.sin(angle) * 19];
    case "sector":
      return [Math.cos(angle) * 23, 11 + Math.sin(index) * 1.2, Math.sin(angle) * 23];
    default:
      return [0, 0, 0];
  }
}

export function getNodeById(nodeId: string | null) {
  if (!nodeId) return null;
  return ventureNodes.find((node) => node.id === nodeId) ?? null;
}

export function getConnectedEdges(nodeId: string | null, edges: VentureEdge[]) {
  if (!nodeId) return [];
  return edges.filter((edge) => edge.source === nodeId || edge.target === nodeId);
}

export function formatCurrency(value: number | null) {
  if (value === null) return "N/A";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    notation: value >= 1000000000 ? "compact" : "standard",
    maximumFractionDigits: value >= 1000000000 ? 1 : 0,
  }).format(value);
}

export function formatTypeLabel(value: string) {
  return value.replaceAll("_", " ");
}
