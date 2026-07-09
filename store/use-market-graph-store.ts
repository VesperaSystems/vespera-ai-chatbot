"use client";

import { create } from "zustand";

import { defaultFilters } from "@/lib/market-graph";
import { MarketGraphFilters } from "@/types/venture";

interface MarketGraphState {
  filters: MarketGraphFilters;
  selectedNodeId: string | null;
  setFilter: <K extends keyof MarketGraphFilters>(key: K, value: MarketGraphFilters[K]) => void;
  resetFilters: () => void;
  selectNode: (nodeId: string | null) => void;
}

export const useMarketGraphStore = create<MarketGraphState>((set) => ({
  filters: defaultFilters,
  selectedNodeId: null,
  setFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
    })),
  resetFilters: () => set({ filters: defaultFilters }),
  selectNode: (selectedNodeId) => set({ selectedNodeId }),
}));
