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
      <div className="contact-stat-card" key={stat.title}>
        <span className="stat-value">{stat.value}</span>
        <span className="stat-label">{stat.title}</span>
      </div>
    ))}
  </section>
);

export default ContactStats;
