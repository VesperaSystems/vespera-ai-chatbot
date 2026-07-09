export const MISSION_CONTROL_STORAGE_KEY = 'vespera:mission-control-config';

export type MissionFocus =
  | 'all'
  | 'ai'
  | 'fintech'
  | 'climate'
  | 'defence'
  | 'biotech';

export type MissionTimeWindow = '1Y' | '3Y' | '5Y' | '10Y';
export type MissionDensity = 'standard' | 'dense' | 'maximum';
export type MissionMotion = 'ambient' | 'elevated' | 'alert';
export type MissionPalette = 'asteroids' | 'bond';

export interface MissionControlConfig {
  focus: MissionFocus;
  timeWindow: MissionTimeWindow;
  density: MissionDensity;
  motion: MissionMotion;
  palette: MissionPalette;
  showLabels: boolean;
  showRipples: boolean;
  showTimeline: boolean;
  showSignals: boolean;
}

export const defaultMissionControlConfig: MissionControlConfig = {
  focus: 'all',
  timeWindow: '5Y',
  density: 'dense',
  motion: 'ambient',
  palette: 'asteroids',
  showLabels: true,
  showRipples: true,
  showTimeline: true,
  showSignals: true,
};

export const missionDensityMap: Record<MissionDensity, number> = {
  standard: 18,
  dense: 28,
  maximum: 40,
};

export const missionFocusLabels: Record<MissionFocus, string> = {
  all: 'All Sectors',
  ai: 'Artificial Intelligence',
  fintech: 'Fintech',
  climate: 'Climate',
  defence: 'Defence',
  biotech: 'Biotech',
};
