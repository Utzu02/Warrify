import { Link } from 'react-router-dom';

type DashboardHeroProps = {
  activeCount: number;
};

const DashboardHero = ({ activeCount }: DashboardHeroProps) => (
  <section className="dashboard-hero card">
    <div>
      <p className="eyebrow">Control center</p>
      <h1>Stay ahead of every warranty</h1>
      <p>
        Monitor documents, spot upcoming expirations, and keep your inbox tidy from this single view. Everything you need is just a click
        away.
      </p>
    </div>
    <div className="hero-actions">
      <Link to="/gmail-status" className="dashboard-btn primary">
        Sync Gmail
      </Link>
      <a href="#warranties" className="dashboard-btn ghost">
        View {activeCount} warranties
      </a>
    </div>
  </section>
);

export default DashboardHero;
