import linieorizontala from '../../assets/linie-orizontala.svg';
import './DashboardTools.css';

type DashboardToolsProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortOptions: string[];
  selectedSort: string;
  isSortOpen: boolean;
  onToggleSort: () => void;
  onSelectSort: (option: string) => void;
};

const DashboardTools = ({
  searchQuery,
  onSearchChange,
  sortOptions,
  selectedSort,
  isSortOpen,
  onToggleSort,
  onSelectSort
}: DashboardToolsProps) => (
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
      <div className="sort">
        <button className="sort-button" onClick={onToggleSort}>
          <p>{selectedSort ? selectedSort : 'Sort list'}</p>
          <svg className="dropdown-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="14" viewBox="0 0 39 18" fill="none">
            <line
              y1="-1.5"
              x2="24.6981"
              y2="-1.5"
              transform="matrix(-0.761791 -0.647822 0.761791 -0.647823 21.7222 16)"
              stroke="white"
              strokeWidth="3"
            />
            <line
              y1="-1.5"
              x2="24.6981"
              y2="-1.5"
              transform="matrix(0.761791 -0.647823 -0.761791 -0.647822 17.0186 16)"
              stroke="white"
              strokeWidth="3"
            />
          </svg>
        </button>

        {isSortOpen && (
          <div className="dropdown sort">
            {sortOptions.map((option) => (
              <div key={option}>
                <p onClick={() => onSelectSort(option)}>{option}</p>
                {option !== sortOptions[sortOptions.length - 1] && <img className="linieoriz" src={linieorizontala} alt="divider" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </section>
);

export default DashboardTools;
