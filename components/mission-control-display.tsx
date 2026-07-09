'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  defaultMissionControlConfig,
  MISSION_CONTROL_STORAGE_KEY,
  missionDensityMap,
  missionFocusLabels,
  type MissionControlConfig,
} from '@/lib/mission-control-config';
import Link from 'next/link';

interface GraphNode {
  id: string;
  x: number;
  y: number;
  size: number;
  type: 'company' | 'investor' | 'founder' | 'sector';
  label: string;
  accent: string;
  drift: number;
}

interface GraphEdge {
  id: string;
  source: GraphNode;
  target: GraphNode;
  strength: number;
}

const labels = [
  'Astra Meridian',
  'North Quay Capital',
  'SignalForge',
  'Orchid Dynamics',
  'Vector Harbor',
  'Pioneer Axis',
  'Helix Foundry',
  'Cinder Lake',
  'Sable Systems',
  'Arc Ledger',
  'Blackreef Ventures',
  'Juniper Atlas',
  'Kestrel Grid',
  'Lumen Wharf',
  'Mercury Stack',
  'Nightglass',
  'Oxbow Bio',
  'Praxis Loop',
  'Quartz Valley',
  'Redline Labs',
  'Summit Relay',
  'Torchline',
  'Umbra Works',
  'Vantage Tide',
  'West Pier',
  'Yellowgate',
  'Zenith Orbital',
  'Crown Delta',
  'Blue March',
  'Steadfast One',
];

const paletteMap = {
  asteroids: {
    background: '#04070b',
    grid: 'rgba(110, 255, 225, 0.12)',
    edge: 'rgba(110, 255, 225, 0.22)',
    node: '#9dfcff',
    investor: '#ffb347',
    founder: '#e7f08d',
    sector: '#ff6767',
    signal: '#7dffb3',
  },
  bond: {
    background: '#040608',
    grid: 'rgba(142, 233, 255, 0.1)',
    edge: 'rgba(142, 233, 255, 0.18)',
    node: '#d7fbff',
    investor: '#6fe8ff',
    founder: '#ffc76a',
    sector: '#ff7b72',
    signal: '#95ff9f',
  },
} as const;

function readConfig(): MissionControlConfig {
  if (typeof window === 'undefined') {
    return defaultMissionControlConfig;
  }

  try {
    const raw = window.localStorage.getItem(MISSION_CONTROL_STORAGE_KEY);
    if (!raw) return defaultMissionControlConfig;
    return { ...defaultMissionControlConfig, ...JSON.parse(raw) };
  } catch {
    return defaultMissionControlConfig;
  }
}

function createNodes(config: MissionControlConfig): GraphNode[] {
  const count = missionDensityMap[config.density];
  const palette = paletteMap[config.palette];

  return Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2;
    const ring = 18 + ((index * 11) % 30);
    const wobble = ((index * 17) % 9) - 4;
    const x = 50 + Math.cos(angle) * ring + wobble;
    const y = 50 + Math.sin(angle * 1.17) * (ring * 0.68) + wobble;
    const typePool: GraphNode['type'][] = ['company', 'investor', 'founder', 'sector'];
    const type = typePool[index % typePool.length];
    const accent =
      type === 'investor'
        ? palette.investor
        : type === 'founder'
          ? palette.founder
          : type === 'sector'
            ? palette.sector
            : palette.node;

    return {
      id: `node-${index}`,
      x,
      y,
      size: 7 + (index % 5) * 2,
      type,
      label: labels[index % labels.length],
      accent,
      drift: 18 + (index % 7) * 4,
    };
  });
}

function createEdges(nodes: GraphNode[]): GraphEdge[] {
  return nodes.flatMap((node, index) => {
    const next = nodes[(index + 3) % nodes.length];
    const alternate = nodes[(index + 9) % nodes.length];

    return [
      {
        id: `${node.id}-${next.id}`,
        source: node,
        target: next,
        strength: 0.3 + ((index % 5) + 1) / 10,
      },
      {
        id: `${node.id}-${alternate.id}`,
        source: node,
        target: alternate,
        strength: 0.18 + ((index % 3) + 1) / 10,
      },
    ];
  });
}

export function MissionControlDisplay() {
  const [config, setConfig] = useState<MissionControlConfig>(defaultMissionControlConfig);
  const [clock, setClock] = useState('');

  useEffect(() => {
    setConfig(readConfig());

    const onStorage = () => setConfig(readConfig());
    const tick = () => {
      setClock(
        new Intl.DateTimeFormat('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'Europe/London',
        }).format(new Date()),
      );
    };

    tick();
    window.addEventListener('storage', onStorage);
    const interval = window.setInterval(tick, 1000);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.clearInterval(interval);
    };
  }, []);

  const palette = paletteMap[config.palette];
  const nodes = useMemo(() => createNodes(config), [config]);
  const edges = useMemo(() => createEdges(nodes), [nodes]);

  return (
    <div
      className="relative min-h-screen overflow-hidden text-foreground"
      style={{ backgroundColor: palette.background }}
    >
      <div className="absolute inset-0 scanlines opacity-30" />
      <div className="absolute inset-0 mission-grid opacity-40" />
      <div className="absolute inset-0 radial-fade" />

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {config.showTimeline && (
          <>
            <line x1="0" y1="18" x2="100" y2="18" stroke={palette.grid} strokeWidth="0.08" />
            <line x1="0" y1="50" x2="100" y2="50" stroke={palette.grid} strokeWidth="0.08" />
            <line x1="0" y1="82" x2="100" y2="82" stroke={palette.grid} strokeWidth="0.08" />
          </>
        )}

        {edges.map((edge, index) => (
          <line
            key={edge.id}
            x1={edge.source.x}
            y1={edge.source.y}
            x2={edge.target.x}
            y2={edge.target.y}
            stroke={palette.edge}
            strokeWidth={0.08 + edge.strength * 0.14}
            strokeDasharray={index % 4 === 0 ? '0.7 0.9' : undefined}
            className={config.motion !== 'ambient' ? 'edge-pulse' : undefined}
            style={{ animationDelay: `${(index % 9) * 0.4}s` }}
          />
        ))}

        {config.showRipples && nodes.slice(0, 8).map((node, index) => (
          <circle
            key={`${node.id}-ripple`}
            cx={node.x}
            cy={node.y}
            r={node.size * 0.26}
            fill="none"
            stroke={palette.signal}
            strokeWidth="0.1"
            className="signal-ripple"
            style={{ animationDelay: `${index * 0.8}s` }}
          />
        ))}
      </svg>

      <div className="absolute inset-0">
        {nodes.map((node, index) => (
          <div
            key={node.id}
            className="absolute node-drift"
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              animationDuration: `${node.drift}s`,
              animationDelay: `${(index % 6) * 0.7}s`,
            }}
          >
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: `${node.size}px`,
                height: `${node.size}px`,
                backgroundColor: node.accent,
                boxShadow: `0 0 22px ${node.accent}`,
              }}
            />
            {config.showLabels && index < 12 && (
              <div className="pointer-events-none absolute left-4 top-[-10px] hidden min-w-28 md:block">
                <div className="tactical-text text-[10px] uppercase tracking-[0.32em] text-[rgba(215,251,255,0.92)]">
                  {node.type}
                </div>
                <div className="mt-1 text-xs text-[rgba(215,251,255,0.72)]">{node.label}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-6 p-5 md:p-8">
        <div className="mission-panel max-w-xl">
          <div className="hud-label">Vespera Mission Control</div>
          <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[0.08em] text-[rgba(235,251,255,0.96)] md:text-5xl">
            Map how capital moves.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-[rgba(215,251,255,0.64)] md:text-base">
            Everything important is a graph. Observe venture capital as a living system of founders,
            firms, sectors, influence, and time.
          </p>
        </div>

        <div className="mission-panel hidden min-w-72 md:block">
          <div className="hud-label">System Status</div>
          <div className="mt-4 space-y-3 tactical-text text-xs uppercase tracking-[0.26em] text-[rgba(215,251,255,0.76)]">
            <div className="flex items-center justify-between">
              <span>Display</span>
              <span>Wall Graph</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Focus</span>
              <span>{missionFocusLabels[config.focus]}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Window</span>
              <span>{config.timeWindow}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Clock</span>
              <span>{clock || '--:--:--'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 grid gap-4 p-5 md:grid-cols-[1.2fr_0.9fr_0.8fr] md:p-8">
        <div className="mission-panel">
          <div className="hud-label">Network Readout</div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="tactical-text text-[10px] uppercase tracking-[0.28em] text-[rgba(215,251,255,0.52)]">Tracked Nodes</div>
              <div className="mt-2 text-2xl text-[rgba(240,252,255,0.98)]">{nodes.length}</div>
            </div>
            <div>
              <div className="tactical-text text-[10px] uppercase tracking-[0.28em] text-[rgba(215,251,255,0.52)]">Capital Paths</div>
              <div className="mt-2 text-2xl text-[rgba(240,252,255,0.98)]">{edges.length}</div>
            </div>
            <div>
              <div className="tactical-text text-[10px] uppercase tracking-[0.28em] text-[rgba(215,251,255,0.52)]">Signal Mode</div>
              <div className="mt-2 text-2xl capitalize text-[rgba(240,252,255,0.98)]">{config.motion}</div>
            </div>
          </div>
        </div>

        <div className="mission-panel">
          <div className="hud-label">Event Stream</div>
          <div className="mt-4 space-y-3 text-sm text-[rgba(215,251,255,0.68)]">
            <div>Capital concentration increasing across AI infrastructure.</div>
            <div>Founder-to-investor adjacency cluster widening in frontier software.</div>
            <div>Cross-border signal intensity elevated in late-stage climate platforms.</div>
          </div>
        </div>

        <div className="mission-panel">
          <div className="hud-label">Control Links</div>
          <div className="mt-4 flex flex-col gap-3 text-sm text-[rgba(215,251,255,0.78)]">
            <Link href="/config" className="transition-colors hover:text-white">Open local display config</Link>
            <Link href="/admin" className="transition-colors hover:text-white">Open estate admin</Link>
            <Link href="/console" className="transition-colors hover:text-white">Open analysis console</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
