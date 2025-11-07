import { useMemo, useState } from 'react';
import Warranties from '../Warranties';
import type { Warranty } from '../../types/dashboard';

type DashboardTableProps = {
  warranties: Warranty[];
};

const MAX_VISIBLE = 10;

const DashboardTable = ({ warranties }: DashboardTableProps) => {
  const [visibleCount, setVisibleCount] = useState(MAX_VISIBLE);

  const canShowMore = useMemo(() => warranties.length > visibleCount, [warranties.length, visibleCount]);

  const handleShowMore = () => {
    setVisibleCount((prev) => Math.min(prev + MAX_VISIBLE, warranties.length));
  };

  return (
    <section id="warranties" className="table-card card">
      <div className="table-header">
        <div>
          <p className="eyebrow">Documents</p>
          <h2>Your warranties</h2>
        </div>
        <span className="pill">{warranties.length} active</span>
      </div>
      <Warranties warranties={warranties} limit={visibleCount} />
      {canShowMore && (
        <div className="table-footer">
          <button className="button ghost" onClick={handleShowMore}>
            View more
          </button>
        </div>
      )}
    </section>
  );
};

export default DashboardTable;
