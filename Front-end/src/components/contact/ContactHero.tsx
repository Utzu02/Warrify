type ContactHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

const ContactHero = ({ eyebrow, title, description }: ContactHeroProps) => (
  <section className="contact-hero">
    <p className="eyebrow">{eyebrow}</p>
    <h1>{title}</h1>
    <p>{description}</p>
  </section>
);

export default ContactHero;
