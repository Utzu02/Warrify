import './ContactHero.css';

type ContactHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

const ContactHero = ({ eyebrow, title, description }: ContactHeroProps) => (
  <section className="contact-hero">
    <p className="contact-hero__eyebrow">{eyebrow}</p>
    <h1 className="contact-hero__title">{title}</h1>
    <p className="contact-hero__description">{description}</p>
  </section>
);

export default ContactHero;
