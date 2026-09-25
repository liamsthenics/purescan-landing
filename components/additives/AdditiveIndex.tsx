"use client";

import Link from "next/link";
import { useDeferredValue, useId, useMemo, useState } from "react";
import { filterAdditives, type AdditiveListing } from "@/lib/additive-search";
import { TIERS, type Tier } from "@/lib/tiers";
import { ChevronRightIcon } from "../icons";
import { TierShape } from "../TierShape";

interface AdditiveIndexProps {
  additives: readonly AdditiveListing[];
}

type TierFilter = Tier | "all";

function FilterChip({
  label,
  count,
  isSelected,
  onSelect,
  tier,
}: {
  label: string;
  count: number;
  isSelected: boolean;
  onSelect: () => void;
  tier?: Tier;
}) {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={onSelect}
      className={`inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-[14px] font-medium transition-colors ${
        isSelected ? "bg-ink text-paper" : "bg-surface text-ink hairline-ring hover:bg-surface-tint"
      }`}
    >
      {tier && <TierShape tier={tier} size={10} />}
      {label}
      <span className={`tabular-nums ${isSelected ? "opacity-70" : "text-secondary"}`}>{count}</span>
    </button>
  );
}

function AdditiveRow({ additive }: { additive: AdditiveListing }) {
  return (
    <li>
      <Link
        href={`/additives/${additive.slug}`}
        className="group flex min-h-[60px] items-center gap-4 px-5 py-3 hover:bg-surface-tint"
      >
        <span className="e-number w-[4.75rem] shrink-0 text-[14px] text-secondary">{additive.code}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[16px] font-medium text-ink group-hover:text-brand">{additive.name}</span>
          {additive.functions.length > 0 && (
            <span className="block text-[13px] text-secondary">{additive.functions.join(" · ")}</span>
          )}
        </span>
        <ChevronRightIcon size={14} className="shrink-0 text-ink opacity-40" />
      </Link>
    </li>
  );
}

/** Searchable, filterable list of every additive, grouped by rating. */
export function AdditiveIndex({ additives }: AdditiveIndexProps) {
  const [query, setQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<TierFilter>("all");
  const deferredQuery = useDeferredValue(query);
  const searchId = useId();

  const matchingQuery = useMemo(() => filterAdditives(additives, deferredQuery, "all"), [additives, deferredQuery]);
  const visible = useMemo(
    () => (tierFilter === "all" ? matchingQuery : matchingQuery.filter((additive) => additive.tier === tierFilter)),
    [matchingQuery, tierFilter],
  );
  const countFor = (tier: Tier) => matchingQuery.filter((additive) => additive.tier === tier).length;

  return (
    <div>
      <div className="sticky top-16 z-10 -mx-5 border-b border-separator bg-paper/90 px-5 py-4 backdrop-blur-md md:mx-0 md:rounded-b-2xl md:px-0">
        <label htmlFor={searchId} className="sr-only">
          Search additives by E-number or name
        </label>
        <input
          id={searchId}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by E-number or name, e.g. E211 or benzoate"
          autoComplete="off"
          spellCheck={false}
          className="h-12 w-full rounded-2xl bg-surface px-4 text-[16px] text-ink hairline-ring placeholder:text-secondary focus:outline-2 focus:outline-brand"
        />
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Filter by concern tier">
          <FilterChip
            label="All"
            count={matchingQuery.length}
            isSelected={tierFilter === "all"}
            onSelect={() => setTierFilter("all")}
          />
          {TIERS.map((info) => (
            <FilterChip
              key={info.tier}
              label={info.chipLabel}
              count={countFor(info.tier)}
              tier={info.tier}
              isSelected={tierFilter === info.tier}
              onSelect={() => setTierFilter(info.tier)}
            />
          ))}
        </div>
      </div>

      <p className="mt-6 text-[14px] text-secondary" aria-live="polite">
        {visible.length === 1 ? "1 additive" : `${visible.length} additives`}
      </p>

      {visible.length === 0 && (
        <p className="card mt-4 p-6 text-[16px] text-secondary">
          No additives match “{query}”. Try an E-number like E330, or part of a name.
        </p>
      )}

      {TIERS.map((info) => {
        const group = visible.filter((additive) => additive.tier === info.tier);
        if (group.length === 0) return null;
        return (
          <section key={info.tier} aria-labelledby={`tier-${info.tier}`} className="mt-8">
            <h2 id={`tier-${info.tier}`} className="flex items-center gap-2.5 text-[17px] font-semibold">
              <TierShape tier={info.tier} size={13} />
              <span style={{ color: info.colorVar }}>{info.label}</span>
              <span className="font-normal tabular-nums text-secondary">{group.length}</span>
            </h2>
            <ul className="card mt-3 divide-y divide-separator overflow-hidden">
              {group.map((additive) => (
                <AdditiveRow key={additive.slug} additive={additive} />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
