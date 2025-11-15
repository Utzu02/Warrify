import './About.css';
import Footer from "../components/Footer/Footer";
import AboutHero from "../components/about/AboutHero";
import AboutValues from "../components/about/AboutValues";
import AboutTimeline from "../components/about/AboutTimeline";
import AboutCTA from "../components/about/AboutCTA";

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
    <>
      <div className="about-page">
        <div className="about-page__inner">
          <AboutHero />
          <AboutValues values={values} />
          <AboutTimeline milestones={milestones} />
          <AboutCTA />
        </div>
      </div>
      <Footer />
    </>
  );
}

export default About;
