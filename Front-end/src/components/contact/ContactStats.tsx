import './ContactStats.css';

type Stat = {
  title: string;
  value: string;
};

type ContactStatsProps = {
  stats: Stat[];
};

const ContactStats = ({ stats }: ContactStatsProps) => (
  <section className="contact-stats">
    {stats.map((stat) => (
      <div className="contact-stats__card" key={stat.title}>
        <span className="contact-stats__value">{stat.value}</span>
        <span className="contact-stats__label">{stat.title}</span>
      </div>
    ))}
  </section>
);

export default ContactStats;
