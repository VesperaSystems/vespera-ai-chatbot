'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  defaultMissionControlConfig,
  MISSION_CONTROL_STORAGE_KEY,
  missionFocusLabels,
  type MissionControlConfig,
  type MissionDensity,
  type MissionFocus,
  type MissionMotion,
  type MissionPalette,
  type MissionTimeWindow,
} from '@/lib/mission-control-config';

const timeWindows: MissionTimeWindow[] = ['1Y', '3Y', '5Y', '10Y'];
const densities: MissionDensity[] = ['standard', 'dense', 'maximum'];
const motions: MissionMotion[] = ['ambient', 'elevated', 'alert'];
const palettes: MissionPalette[] = ['asteroids', 'bond'];

export function MissionControlConfigPanel() {
  const [config, setConfig] = useState<MissionControlConfig>(defaultMissionControlConfig);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(MISSION_CONTROL_STORAGE_KEY);
      if (raw) {
        setConfig({ ...defaultMissionControlConfig, ...JSON.parse(raw) });
      }
    } catch {
      setConfig(defaultMissionControlConfig);
    }
  }, []);

  const persist = (nextConfig: MissionControlConfig) => {
    setConfig(nextConfig);
    window.localStorage.setItem(MISSION_CONTROL_STORAGE_KEY, JSON.stringify(nextConfig));
  };

  const update = <K extends keyof MissionControlConfig>(key: K, value: MissionControlConfig[K]) => {
    persist({ ...config, [key]: value });
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 text-foreground md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 border-b border-[rgba(255,255,255,0.14)] pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="hud-label">Local Display Config</div>
            <h1 className="mt-3 text-3xl font-semibold tracking-[0.08em] text-[rgba(250,250,250,0.96)] md:text-4xl">
              Tune the wall.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[rgba(250,250,250,0.64)]">
              This panel controls the local graph presentation only. It is the operator surface for what the room sees on
              <span className="px-1 text-[rgba(250,250,250,0.86)]">vespera.systems</span>
              when the display is in full-screen mode.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" className="border-[rgba(255,255,255,0.16)] bg-transparent text-foreground hover:bg-accent/60">
              <Link href="/">Back to graph</Link>
            </Button>
            <Button asChild className="bg-[rgba(255,255,255,0.12)] text-[rgba(250,250,250,0.94)] hover:bg-[rgba(255,255,255,0.18)]">
              <Link href="/admin">Open admin</Link>
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_1fr]">
          <section className="mission-panel">
            <div className="hud-label">Graph Focus</div>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="mission-focus" className="tactical-text text-[10px] uppercase tracking-[0.28em] text-[rgba(250,250,250,0.6)]">Sector Focus</label>
                <Select value={config.focus} onValueChange={(value) => update('focus', value as MissionFocus)}>
                  <SelectTrigger id="mission-focus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(missionFocusLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="mission-time-window" className="tactical-text text-[10px] uppercase tracking-[0.28em] text-[rgba(250,250,250,0.6)]">Time Horizon</label>
                <Select value={config.timeWindow} onValueChange={(value) => update('timeWindow', value as MissionTimeWindow)}>
                  <SelectTrigger id="mission-time-window">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeWindows.map((value) => (
                      <SelectItem key={value} value={value}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="mission-density" className="tactical-text text-[10px] uppercase tracking-[0.28em] text-[rgba(250,250,250,0.6)]">Network Density</label>
                <Select value={config.density} onValueChange={(value) => update('density', value as MissionDensity)}>
                  <SelectTrigger id="mission-density">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {densities.map((value) => (
                      <SelectItem key={value} value={value} className="capitalize">{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="mission-motion" className="tactical-text text-[10px] uppercase tracking-[0.28em] text-[rgba(250,250,250,0.6)]">Motion Level</label>
                <Select value={config.motion} onValueChange={(value) => update('motion', value as MissionMotion)}>
                  <SelectTrigger id="mission-motion">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {motions.map((value) => (
                      <SelectItem key={value} value={value} className="capitalize">{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          <section className="mission-panel">
            <div className="hud-label">Visual Language</div>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="mission-palette" className="tactical-text text-[10px] uppercase tracking-[0.28em] text-[rgba(250,250,250,0.6)]">Palette</label>
                <Select value={config.palette} onValueChange={(value) => update('palette', value as MissionPalette)}>
                  <SelectTrigger id="mission-palette">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {palettes.map((value) => (
                      <SelectItem key={value} value={value} className="capitalize">{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between border border-[rgba(255,255,255,0.12)] px-4 py-3">
                <div>
                  <div className="text-sm text-[rgba(250,250,250,0.94)]">Entity Labels</div>
                  <div className="text-xs text-[rgba(250,250,250,0.56)]">Show name callouts on the graph.</div>
                </div>
                <Switch checked={config.showLabels} onCheckedChange={(checked) => update('showLabels', checked)} />
              </div>

              <div className="flex items-center justify-between border border-[rgba(255,255,255,0.12)] px-4 py-3">
                <div>
                  <div className="text-sm text-[rgba(250,250,250,0.94)]">Signal Ripples</div>
                  <div className="text-xs text-[rgba(250,250,250,0.56)]">Pulse notable events through the graph.</div>
                </div>
                <Switch checked={config.showRipples} onCheckedChange={(checked) => update('showRipples', checked)} />
              </div>

              <div className="flex items-center justify-between border border-[rgba(255,255,255,0.12)] px-4 py-3">
                <div>
                  <div className="text-sm text-[rgba(250,250,250,0.94)]">Timeline Guides</div>
                  <div className="text-xs text-[rgba(250,250,250,0.56)]">Keep the temporal bands visible.</div>
                </div>
                <Switch checked={config.showTimeline} onCheckedChange={(checked) => update('showTimeline', checked)} />
              </div>

              <div className="flex items-center justify-between border border-[rgba(255,255,255,0.12)] px-4 py-3">
                <div>
                  <div className="text-sm text-[rgba(250,250,250,0.94)]">Signal Headlines</div>
                  <div className="text-xs text-[rgba(250,250,250,0.56)]">Keep operator summaries visible.</div>
                </div>
                <Switch checked={config.showSignals} onCheckedChange={(checked) => update('showSignals', checked)} />
              </div>
            </div>
          </section>
        </div>

        <section className="mission-panel mt-6">
          <div className="hud-label">Operator Actions</div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={() => persist(defaultMissionControlConfig)} variant="outline" className="border-[rgba(255,255,255,0.16)] bg-transparent text-foreground hover:bg-accent/60">
              Reset defaults
            </Button>
            <Button asChild className="bg-[rgba(255,255,255,0.12)] text-[rgba(250,250,250,0.94)] hover:bg-[rgba(255,255,255,0.18)]">
              <Link href="/console">Open analysis console</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
