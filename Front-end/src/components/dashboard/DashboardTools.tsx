import { useEffect, useRef, useState } from 'react';
import './DashboardTools.css';

type Option = {
  label: string;
  value: string | number;
};

type DashboardToolsProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortOptions: string[];
  selectedSort: string;
  isSortOpen: boolean;
  onToggleSort: () => void;
  onSelectSort: (option: string) => void;
  filters: Array<{ key: string; label: string; options: Option[] }>;
  activeFilters: Record<string, Array<string | number>>;
  onFilterChange: (key: string, value: string | number) => void;
};

const DashboardTools = ({
  searchQuery,
  onSearchChange,
  sortOptions,
  selectedSort,
  isSortOpen,
  onToggleSort,
  onSelectSort,
  filters,
  activeFilters,
  onFilterChange
}: DashboardToolsProps) => {
  const [openFilterKey, setOpenFilterKey] = useState<string | null>(null);
  const filterRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!openFilterKey) return;
      const ref = filterRefs.current[openFilterKey];
      if (ref && !ref.contains(event.target as Node)) {
        setOpenFilterKey(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [openFilterKey]);

  return (
  <section className="dashboard-tools">
    <div className="search-container">
      <input
        type="text"
        placeholder="Search products or providers..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="search-input"
      />
      <svg className="search-icon" aria-labelledby="title desc" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19.9 19.7">
        <title id="title">Search Icon</title>
        <desc id="desc">A magnifying glass icon.</desc>
        <g className="search-path" fill="none" stroke="black">
          <path strokeLinecap="square" d="M18.5 18.3l-5.4-5.4" />
          <circle cx="8" cy="8" r="7" />
        </g>
      </svg>
    </div>

    <div className="filters-container">
      <div className="filter-group">
        {filters.map((filter) => (
          <div
            key={filter.key}
            className="filter-chip filter-chip--dropdown"
            ref={(el) => {
              filterRefs.current[filter.key] = el;
            }}
          >
            <button
              type="button"
              className={`chip-label ${(openFilterKey === filter.key || (activeFilters[filter.key]?.length ?? 0) > 0) ? 'chip-label--active' : ''}`}
              onClick={() => setOpenFilterKey(openFilterKey === filter.key ? null : filter.key)}
            >
              <span>{filter.label}</span>
              <svg className="chip-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="7" viewBox="0 0 14 8" fill="none">
                <path d="M1 1L7 7L13 1" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {openFilterKey === filter.key && (
              <div className="chip-dropdown">
                {filter.options.map((option) => (
                  <label key={option.value} className="chip-option">
                    <input
                      type="checkbox"
                      checked={activeFilters[filter.key]?.includes(option.value) ?? false}
                      onChange={() => onFilterChange(filter.key, option.value)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="sort sort--inline">
        <button className="sort-button sort-button--outline" onClick={onToggleSort}>
          <span>{selectedSort ? selectedSort : 'Sort list'}</span>
          <svg className="dropdown-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="7" viewBox="0 0 14 8" fill="none">
            <path d="M1 1L7 7L13 1" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {isSortOpen && (
          <div className="dropdown sort">
            {sortOptions.map((option) => (
              <button key={option} type="button" onClick={() => onSelectSort(option)} className="sort-option">
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  </section>
);
};

export default DashboardTools;
