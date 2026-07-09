import type { MarketGraphFilters } from "@/types/venture";

export interface ClientGraphConfig {
  slug: string;
  label: string;
  summary: string;
  filters: MarketGraphFilters;
}

const baseFilters: MarketGraphFilters = {
  valuationBand: "all",
  sector: "all",
  country: "all",
  stage: "all",
  investor: "all",
  year: "all",
  search: "",
};

const graphConfigs: Record<string, ClientGraphConfig> = {
  demo: {
    slug: "demo",
    label: "Demo Graph",
    summary: "Cross-market demonstration graph for fictional venture relationships.",
    filters: baseFilters,
  },
  "uk-desk": {
    slug: "uk-desk",
    label: "UK Markets Desk",
    summary: "UK fintech and infrastructure lens tuned for bank-side wall display review.",
    filters: {
      ...baseFilters,
      country: "United Kingdom",
      sector: "Fintech",
    },
  },
  "advisory-desk": {
    slug: "advisory-desk",
    label: "Advisory Desk",
    summary: "Wealth, insuretech, and later-stage operating signals across UK and Europe.",
    filters: {
      ...baseFilters,
      stage: "Series B",
      country: "United Kingdom",
    },
  },
  "wealth-desk": {
    slug: "wealth-desk",
    label: "Global Wealth Desk",
    summary: "Cross-border capital patterns around deeptech, climate, and frontier software.",
    filters: {
      ...baseFilters,
      sector: "Climate",
      valuationBand: "250m-1b",
    },
  },
};

function formatFallbackLabel(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.toUpperCase())
    .join(" ");
}

export function getClientGraphConfig(slug?: string): ClientGraphConfig {
  if (!slug) return graphConfigs.demo;
  return (
    graphConfigs[slug.toLowerCase()] ?? {
      slug,
      label: formatFallbackLabel(slug),
      summary: "Client-specific graph preset awaiting local configuration.",
      filters: baseFilters,
    }
  );
}

export function getClientGraphConfigs() {
  return Object.values(graphConfigs);
}
