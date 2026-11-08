"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import type { ShopifyFilter } from "@/lib/shopify/types";

const sortOptions = [
  ["featured", "Atelier Featured"],
  ["best-selling", "Best Selling"],
  ["title-ascending", "Alphabetically, A–Z"],
  ["title-descending", "Alphabetically, Z–A"],
  ["price-ascending", "Price: Low to High"],
  ["price-descending", "Price: High to Low"],
  ["created-descending", "New Arrivals"],
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
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`?${params.toString()}`, { scroll: false });
  }

  return (
    <>
      <div className="collection-toolbar">
        <button
          type="button"
          className="filter-toggle"
          onClick={() => setOpen(true)}
        >
          <SlidersHorizontal size={14} className="text-emerald-800" />
          <span>FILTER &amp; SORT</span>
          {activeFilters.length > 0 && <span>{activeFilters.length}</span>}
        </button>

        <label className="sort-control">
          <span>SORT:</span>
          <select
            value={sort}
            onChange={(event) => updateParams("sort", event.target.value)}
          >
            {sortOptions.map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
          <ChevronDown size={14} />
        </label>
      </div>

      <div className="filter-sidebar">
        {filters.map((filter) => (
          <FilterGroup
            key={filter.id}
            filter={filter}
            activeFilters={activeFilters}
            onToggle={(value) => {
              const next = new Set(activeFilters);
              if (next.has(value)) next.delete(value);
              else next.add(value);
              const params = new URLSearchParams(searchParams.toString());
              params.delete("after");
              params.delete("filter");
              for (const selected of next) params.append("filter", selected);
              router.push(`?${params.toString()}`, { scroll: false });
            }}
          />
        ))}
      </div>

      {open && (
        <div className="filter-modal-wrap">
          <button
            type="button"
            className="filter-modal-scrim"
            onClick={() => setOpen(false)}
            aria-label="Close filters"
          />
          <aside
            className="filter-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Filter products"
          >
            <header className="flex items-center justify-between pb-4 border-b border-slate-200">
              <span className="eyebrow">
                <i /> REFINE COLLECTION
              </span>
              <button
                type="button"
                className="icon-button"
                onClick={() => setOpen(false)}
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </header>

            <div className="py-4 border-b border-slate-200">
              <label className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                <span>Sort order</span>
              </label>
              <select
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-sm font-semibold"
                value={sort}
                onChange={(event) => updateParams("sort", event.target.value)}
              >
                {sortOptions.map(([value, label]) => (
                  <option value={value} key={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 overflow-y-auto py-2">
              {filters.map((filter) => (
                <FilterGroup
                  key={filter.id}
                  filter={filter}
                  activeFilters={activeFilters}
                  onToggle={(value) => {
                    const next = new Set(activeFilters);
                    if (next.has(value)) next.delete(value);
                    else next.add(value);
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete("after");
                    params.delete("filter");
                    for (const selected of next) params.append("filter", selected);
                    router.push(`?${params.toString()}`, { scroll: false });
                  }}
                />
              ))}
            </div>

            <button
              type="button"
              className="button button-dark filter-done w-full mt-4"
              onClick={() => setOpen(false)}
            >
              VIEW RESULTS
            </button>
          </aside>
        </div>
      )}
    </>
  );
}

function FilterGroup({
  filter,
  activeFilters,
  onToggle,
}: {
  filter: ShopifyFilter;
  activeFilters: string[];
  onToggle: (value: string) => void;
}) {
  if (!filter.values.length) return null;
  return (
    <details className="filter-group" open>
      <summary>
        <span>{filter.label}</span>
        <ChevronDown size={14} className="text-slate-400" />
      </summary>
      <div className="filter-values">
        {filter.values.map((value) => (
          <label key={value.id} className="filter-value">
            <input
              type="checkbox"
              checked={activeFilters.includes(value.input)}
              onChange={() => onToggle(value.input)}
            />
            <span>{value.label}</span>
            {value.count !== undefined && <small className="text-slate-400">({value.count})</small>}
          </label>
        ))}
      </div>
    </details>
  );
}
