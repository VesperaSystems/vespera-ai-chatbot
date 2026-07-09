"use client";

import { useMemo } from "react";

import { DetailPanel } from "@/components/market-graph/detail-panel";
import { FilterPanel } from "@/components/market-graph/filter-panel";
import { GraphCanvas } from "@/components/market-graph/graph-canvas";
import {
  formatCurrency,
  getConnectedEdges,
  getFilterOptions,
  getNodeById,
  getVisibleGraph,
} from "@/lib/market-graph";
import { useMarketGraphStore } from "@/store/use-market-graph-store";

const filterOptions = getFilterOptions();

export function MarketGraphExperience() {
  const { filters, selectedNodeId, selectNode, resetFilters, setFilter } = useMarketGraphStore();

  const visibleGraph = useMemo(() => getVisibleGraph(filters), [filters]);
  const selectedNode = useMemo(() => getNodeById(selectedNodeId), [selectedNodeId]);
  const connectedEdges = useMemo(
    () => getConnectedEdges(selectedNodeId, visibleGraph.edges),
    [selectedNodeId, visibleGraph.edges],
  );

  const stats = useMemo(() => {
    const visibleCompanies = visibleGraph.nodes.filter((node) => node.type === "company");
    const totalValuation = visibleCompanies.reduce(
      (sum, node) => sum + (node.valuationGBP ?? 0),
      0,
    );

    return {
      nodes: visibleGraph.nodes.length,
      edges: visibleGraph.edges.length,
      companies: visibleCompanies.length,
      valuation: totalValuation,
    };
  }, [visibleGraph]);

  return (
    <div className="mx-auto flex w-full max-w-[1700px] flex-1 flex-col px-4 pb-6 pt-4 lg:px-6">
      <div className="mb-4 hud-panel p-4 lg:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="hud-label">Config</p>
            <h1 className="mt-2 text-3xl font-medium text-white">Configure the current graph.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300">
              Use this operator surface to control the graph that is displayed at the apex route or a client route.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Visible Nodes" value={String(stats.nodes)} />
            <StatCard label="Visible Edges" value={String(stats.edges)} />
            <StatCard label="Companies" value={String(stats.companies)} />
            <StatCard label="Mapped Value" value={formatCurrency(stats.valuation)} />
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex-1 border border-white/12 bg-[rgba(8,8,8,0.88)] px-4 py-3">
            <input
              value={filters.search}
              onChange={(event) => setFilter("search", event.target.value)}
              placeholder="Search nodes..."
              className="w-full bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
            />
          </div>
          <div className="border border-white/12 bg-[rgba(255,255,255,0.02)] px-4 py-3 text-sm text-zinc-300 tactical-copy">
            Filter. Orbit. Inspect.
          </div>
        </div>
      </div>

      <div className="grid flex-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)_340px]">
        <FilterPanel
          filters={filters}
          options={filterOptions}
          onChange={setFilter}
          onReset={resetFilters}
        />
        <GraphCanvas
          nodes={visibleGraph.nodes}
          edges={visibleGraph.edges}
          selectedNodeId={selectedNodeId}
          onSelectNode={selectNode}
        />
        <DetailPanel node={selectedNode} edges={connectedEdges} />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/10 bg-[rgba(255,255,255,0.02)] px-4 py-3">
      <p className="hud-label">{label}</p>
      <p className="mt-2 text-lg text-white">{value}</p>
    </div>
  );
}
