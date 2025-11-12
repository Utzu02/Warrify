import { useEffect, useRef, useState } from 'react';
import './DashboardTools.css';

type Option = {
  label: string;
  value: string | number;
  count?: number;
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
  const [filterSearchQueries, setFilterSearchQueries] = useState<Record<string, string>>({});
  const filterRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!openFilterKey) return;
      const ref = filterRefs.current[openFilterKey];
      if (ref && !ref.contains(event.target as Node)) {
        setOpenFilterKey(null);
        // Clear search query when closing
        setFilterSearchQueries(prev => ({
          ...prev,
          [openFilterKey]: ''
        }));
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [openFilterKey]);

  return (
  <section className="dashboard-tools">
    <div className="search-container">
      <svg className="search-icon" aria-labelledby="title desc" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19.9 19.7">
        <title id="title">Search Icon</title>
        <desc id="desc">A magnifying glass icon.</desc>
        <g className="search-path" fill="none" stroke="#94a3b8">
          <path strokeLinecap="square" d="M18.5 18.3l-5.4-5.4" />
          <circle cx="8" cy="8" r="7" />
        </g>
      </svg>
      <input
        type="text"
        placeholder="Search by ID, provider, product, amount, or location..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="search-input"
        title="Search your warranties"
      />
    </div>

    <div className="filters-wrapper">
      <div className="filters-header">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
        </svg>
        <span>Advanced Filters</span>
      </div>
      <div className="filters-container">
      <div className="sort sort--inline">
        <button className="sort-button sort-button--outline" onClick={onToggleSort}>
          <span>{selectedSort ? selectedSort : 'Sort list'}</span>
          {selectedSort ? (
            <svg
              className="dropdown-icon dropdown-icon--close"
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              onClick={(event) => {
                event.stopPropagation();
                onSelectSort('');
              }}
            >
              <path d="M3 3L9 9M9 3L3 9" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg className="dropdown-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="7" viewBox="0 0 14 8" fill="none">
              <path d="M1 1L7 7L13 1" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
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
              onClick={() => {
                const isClosing = openFilterKey === filter.key;
                setOpenFilterKey(isClosing ? null : filter.key);
                if (isClosing) {
                  // Clear search when closing
                  setFilterSearchQueries(prev => ({
                    ...prev,
                    [filter.key]: ''
                  }));
                }
              }}
            >
              <span>{filter.label}</span>
              <svg className="chip-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="7" viewBox="0 0 14 8" fill="none">
                <path d="M1 1L7 7L13 1" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {openFilterKey === filter.key && (
              <div className="chip-dropdown">
                <input
                  type="text"
                  placeholder={`Search ${filter.label.toLowerCase()}...`}
                  className="chip-dropdown-search"
                  value={filterSearchQueries[filter.key] || ''}
                  onChange={(e) => setFilterSearchQueries(prev => ({
                    ...prev,
                    [filter.key]: e.target.value
                  }))}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="chip-options-list">
                  {(() => {
                    const searchQuery = filterSearchQueries[filter.key] || '';
                    const filteredOptions = filter.options.filter((option) => {
                      if (!searchQuery) return true;
                      return option.label.toLowerCase().includes(searchQuery.toLowerCase());
                    });

                    if (filteredOptions.length === 0) {
                      return (
                        <div className="chip-no-results">
                          No results found for "{searchQuery}"
                        </div>
                      );
                    }

                    return filteredOptions.map((option) => (
                      <label key={option.value} className="chip-option">
                        <div className="chip-option-label">
                          <input
                            type="checkbox"
                            checked={activeFilters[filter.key]?.includes(option.value) ?? false}
                            onChange={() => onFilterChange(filter.key, option.value)}
                          />
                          <span>{option.label}</span>
                        </div>
                        <span className="chip-option-count">{option.count ?? 0}</span>
                      </label>
                    ));
                  })()}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
    </div>
  </section>
);
};

export default DashboardTools;
