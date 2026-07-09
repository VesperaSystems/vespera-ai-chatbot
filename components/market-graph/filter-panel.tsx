"use client";

import type { MarketGraphFilters } from "@/types/venture";

interface FilterPanelProps {
  filters: MarketGraphFilters;
  options: {
    sectors: string[];
    countries: string[];
    stages: string[];
    investors: string[];
    years: string[];
  };
  onChange: <K extends keyof MarketGraphFilters>(key: K, value: MarketGraphFilters[K]) => void;
  onReset: () => void;
}

const valuationOptions = [
  { value: "all", label: "All valuations" },
  { value: "under50m", label: "Under £50M" },
  { value: "50m-250m", label: "£50M to £250M" },
  { value: "250m-1b", label: "£250M to £1B" },
  { value: "1b+", label: "Over £1B" },
] as const;

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <label className="block space-y-2">
      <span className="hud-label">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full border border-white/10 bg-[rgba(8,8,8,0.88)] px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-white/40"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function FilterPanel({ filters, options, onChange, onReset }: FilterPanelProps) {
  return (
    <aside className="hud-panel flex h-full flex-col p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="hud-label">Filters</p>
          <h2 className="mt-2 text-xl font-medium text-white">Graph controls</h2>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="border border-white/10 px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-zinc-300 transition hover:border-white/40 hover:text-white"
        >
          Reset
        </button>
      </div>

      <div className="space-y-4">
        <SelectField
          label="Valuation"
          value={filters.valuationBand}
          onChange={(value) => onChange("valuationBand", value as MarketGraphFilters["valuationBand"])}
          options={valuationOptions.map((option) => ({ label: option.label, value: option.value }))}
        />
        <SelectField
          label="Sector"
          value={filters.sector}
          onChange={(value) => onChange("sector", value)}
          options={[{ label: "All sectors", value: "all" }, ...options.sectors.map((value) => ({ label: value, value }))]}
        />
        <SelectField
          label="Country"
          value={filters.country}
          onChange={(value) => onChange("country", value)}
          options={[{ label: "All countries", value: "all" }, ...options.countries.map((value) => ({ label: value, value }))]}
        />
        <SelectField
          label="Funding Stage"
          value={filters.stage}
          onChange={(value) => onChange("stage", value)}
          options={[{ label: "All stages", value: "all" }, ...options.stages.map((value) => ({ label: value, value }))]}
        />
        <SelectField
          label="Investor"
          value={filters.investor}
          onChange={(value) => onChange("investor", value)}
          options={[{ label: "All investors", value: "all" }, ...options.investors.map((value) => ({ label: value, value }))]}
        />
        <SelectField
          label="Year"
          value={filters.year}
          onChange={(value) => onChange("year", value)}
          options={[{ label: "All years", value: "all" }, ...options.years.map((value) => ({ label: value, value }))]}
        />
      </div>

      <div className="mt-6 border border-white/10 bg-[rgba(255,255,255,0.02)] p-4 text-sm text-zinc-300">
        <p className="font-medium text-white">Mock data only</p>
        <p className="mt-2 leading-6 text-zinc-500">
          This operator view still controls a fictional graph so the route and display model can settle before client data is onboarded.
        </p>
      </div>
    </aside>
  );
}
