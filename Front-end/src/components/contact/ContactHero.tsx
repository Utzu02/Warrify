import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './ContactHero.css';

type ContactHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

const ContactHero = ({ eyebrow, title, description }: ContactHeroProps) => {
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Eyebrow fade in
      gsap.from(eyebrowRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.6,
        ease: "power2.out"
      });

      // Title slide down
      gsap.from(titleRef.current, {
        opacity: 0,
        y: -30,
        duration: 0.8,
        delay: 0.2,
        ease: "power2.out"
      });

      // Description fade up
      gsap.from(descriptionRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.4,
        ease: "power2.out"
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="contact-hero">
      <p ref={eyebrowRef} className="contact-hero__eyebrow">{eyebrow}</p>
      <h1 ref={titleRef} className="contact-hero__title">{title}</h1>
      <p ref={descriptionRef} className="contact-hero__description">{description}</p>
    </section>
  );
};

export default ContactHero;
