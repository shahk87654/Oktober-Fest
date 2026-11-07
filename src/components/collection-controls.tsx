"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import type { ShopifyFilter } from "@/lib/shopify/types";

const sortOptions = [
  ["featured", "Featured"],
  ["best-selling", "Best selling"],
  ["title-ascending", "Alphabetically, A–Z"],
  ["title-descending", "Alphabetically, Z–A"],
  ["price-ascending", "Price, low to high"],
  ["price-descending", "Price, high to low"],
  ["created-descending", "Newest"],
];

export function CollectionControls({
  filters,
  activeFilters,
  sort,
}: {
  filters: ShopifyFilter[];
  activeFilters: string[];
  sort: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  function updateParams(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("after");
    if (value) params.append(key, value);
    else params.delete(key);
    router.push(`?${params.toString()}`, { scroll: false });
  }

  return (
    <>
      <div className="collection-toolbar">
        <button className="filter-toggle" onClick={() => setOpen(true)}><SlidersHorizontal size={15} /> FILTER & SORT{activeFilters.length > 0 && <span>{activeFilters.length}</span>}</button>
        <label className="sort-control">SORT BY
          <select value={sort} onChange={(event) => updateParams("sort", event.target.value)}>
            {sortOptions.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
          </select><ChevronDown size={13} />
        </label>
      </div>
      <div className="filter-sidebar">
        {filters.map((filter) => <FilterGroup key={filter.id} filter={filter} activeFilters={activeFilters} onToggle={(value) => {
          const next = new Set(activeFilters);
          if (next.has(value)) next.delete(value);
          else next.add(value);
          const params = new URLSearchParams(searchParams.toString());
          params.delete("after");
          params.delete("filter");
          for (const selected of next) params.append("filter", selected);
          router.push(`?${params.toString()}`, { scroll: false });
        }} />)}
      </div>
      {open && (
        <div className="filter-modal-wrap">
          <button className="filter-modal-scrim" onClick={() => setOpen(false)} aria-label="Close filters" />
          <aside className="filter-modal" role="dialog" aria-modal="true" aria-label="Filter products">
            <header><span className="eyebrow">REFINE YOUR EDIT</span><button className="icon-button" onClick={() => setOpen(false)} aria-label="Close filters"><X size={20} /></button></header>
            <label className="sort-modal-label">Sort by
              <select value={sort} onChange={(event) => updateParams("sort", event.target.value)}>
                {sortOptions.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
              </select>
            </label>
            {filters.map((filter) => <FilterGroup key={filter.id} filter={filter} activeFilters={activeFilters} onToggle={(value) => {
              const next = new Set(activeFilters);
              if (next.has(value)) next.delete(value);
              else next.add(value);
              const params = new URLSearchParams(searchParams.toString());
              params.delete("after");
              params.delete("filter");
              for (const selected of next) params.append("filter", selected);
              router.push(`?${params.toString()}`, { scroll: false });
            }} />)}
            <button className="button button-dark filter-done" onClick={() => setOpen(false)}>VIEW RESULTS</button>
          </aside>
        </div>
      )}
    </>
  );
}

function FilterGroup({ filter, activeFilters, onToggle }: { filter: ShopifyFilter; activeFilters: string[]; onToggle: (value: string) => void }) {
  if (!filter.values.length) return null;
  return (
    <details className="filter-group">
      <summary>{filter.label}<ChevronDown size={13} /></summary>
      <div className="filter-values">
        {filter.values.map((value) => (
          <label key={value.id} className="filter-value">
            <input type="checkbox" checked={activeFilters.includes(value.input)} onChange={() => onToggle(value.input)} />
            <span>{value.label}</span>{value.count !== undefined && <small>{value.count}</small>}
          </label>
        ))}
      </div>
    </details>
  );
}
