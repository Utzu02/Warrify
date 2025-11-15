import Button from '../button';
import './DashboardHero.css';

type DashboardHeroProps = {
  activeCount: number;
  onSyncGmail: () => void;
};

const DashboardHero = ({ activeCount, onSyncGmail }: DashboardHeroProps) => {
  return (
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
      <Button onClick={onSyncGmail} variant="primary" size="medium">
        Sync Gmail
      </Button>
      <Button href="#warranties" variant="ghost" size="medium">
        View {activeCount} warranties
      </Button>
    </div>
  </section>
  );
};

export default DashboardHero;
