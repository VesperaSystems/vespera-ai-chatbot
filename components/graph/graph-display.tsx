"use client";

import { useMemo, useState } from "react";

import type { ClientGraphConfig } from "@/lib/client-graphs";
import { GraphCanvas } from "@/components/market-graph/graph-canvas";
import { getVisibleGraph } from "@/lib/market-graph";

export function GraphDisplay({ config }: { config: ClientGraphConfig }) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const graph = useMemo(() => getVisibleGraph(config.filters), [config.filters]);

  return (
    <div className="flex min-h-screen w-full flex-1 flex-col bg-[#050505]">
      <GraphCanvas
        nodes={graph.nodes}
        edges={graph.edges}
        selectedNodeId={selectedNodeId}
        onSelectNode={setSelectedNodeId}
        compact
        fullscreen
      />
    </div>
  );
}
