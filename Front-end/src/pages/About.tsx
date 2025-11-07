import { Link } from 'react-router-dom';
import './styles/About.css';

const milestones = [
  { year: '2022', title: 'Product idea', copy: 'Mapped the frustration of service managers that were losing coverage because of lost invoices.' },
  { year: '2023', title: 'First pilots', copy: 'Launched a closed beta with 6 Romanian retail chains and processed 30K invoices automatically.' },
  { year: '2024', title: 'Automation engine', copy: 'Introduced AI-powered parsing and Gmail sync that removes 80% of manual work.' },
  { year: '2025', title: 'Scaling up', copy: 'Cross-country expansion with multilingual support and enterprise-grade compliance.' },
];

const values = [
  {
    title: 'People first',
    copy: 'Every flow is designed around real operators, not dashboards. We listen, iterate, and keep humans in control.',
  },
  {
    title: 'Trust by design',
    copy: 'Encrypted storage, audit-ready logs, and transparent AI decisions keep compliance teams calm and confident.',
  },
  {
    title: 'Momentum matters',
    copy: 'We ship fast, measure impact, and celebrate incremental wins that move businesses toward zero manual paperwork.',
  },
];

function About() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <p className="eyebrow">About Warrify</p>
        <h1>We help teams reclaim time by taming chaotic warranty data.</h1>
        <p className="lead">
          Warrify unifies every warranty certificate, invoice, and service note inside a calm, searchable hub.
          Businesses stay ahead of expirations, customers get faster answers, and no one has to dig through crowded inboxes again.
        </p>
        <div className="hero-stats">
          <div className="stat-card">
            <span className="stat-number">120k+</span>
            <span className="stat-label">documents parsed</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">68%</span>
            <span className="stat-label">faster service approvals</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">24/7</span>
            <span className="stat-label">monitoring & alerts</span>
          </div>
        </div>
      </section>

      <section className="about-story card">
        <div className="story-copy">
          <h2>Purpose-built for operations teams that juggle thousands of warranties</h2>
          <p>
            We noticed a pattern across retail, construction, and IT service companies: warranty documents were scattered across inboxes, USB sticks,
            and forgotten binders. Warrify was born to centralize those touchpoints and make renewals, claims, and audits painless.
          </p>
          <ul>
            <li>Automated Gmail/Outlook ingestion with zero-code setup.</li>
            <li>AI validation that spots missing details and highlights risky certificates.</li>
            <li>Modern dashboard with reminders, search, and collaboration tools.</li>
          </ul>
        </div>
        <div className="story-highlight">
          <h3>What success looks like</h3>
          <p>Teams who adopt Warrify report fewer escalations, predictable renewals, and fewer hours lost to manual work.</p>
          <div className="quote-box">
            “We reduced ticket handling time by 42% because documents are ready before customers even ask.”
            <span>— Operations Director, regional electronics retailer</span>
          </div>
        </div>
      </section>

      <section className="about-values-grid">
        {values.map((value) => (
          <div key={value.title} className="value-card">
            <h4>{value.title}</h4>
            <p>{value.copy}</p>
          </div>
        ))}
      </section>

      <section className="about-timeline card">
        <h2>Our journey</h2>
        <div className="timeline">
          {milestones.map((milestone) => (
            <div key={milestone.year} className="timeline-item">
              <div className="timeline-dot" />
              <div>
                <span className="timeline-year">{milestone.year}</span>
                <h5>{milestone.title}</h5>
                <p>{milestone.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="about-cta card">
        <div>
          <p className="eyebrow">Join the movement</p>
          <h2>Ready to modernize warranties?</h2>
          <p>
            Our team guides every onboarding, migrates historical data, and trains your staff. Start with a friendly discovery call—
            no sales pressure, just real solutions.
          </p>
        </div>
        <div className="cta-actions">
          <Link to="/contact" className="button buttoninvert">
            Talk to us
          </Link>
          <Link to="/pricing" className="button">
            Explore plans
          </Link>
        </div>
      </section>
    </div>
  );
}

export default About;
