import { ReactNode, useEffect, useRef } from 'react';
import gsap from 'gsap';
import './ContactHero.css';

type ContactHeroProps = {
  title: ReactNode;
  description: string;
};

const ContactHero = ({ title, description }: ContactHeroProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(sectionRef.current, {
        opacity: 0,
        duration: 0.8,
        ease: "power2.out"
      });

      gsap.from(titleRef.current, {
        opacity: 0,
        y: -30,
        duration: 0.8,
        delay: 0.2,
        ease: "power2.out"
      });

      gsap.from(descriptionRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.3,
        ease: "power2.out"
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="contact-hero">
      <h1 ref={titleRef} className="contact-hero__title">{title}</h1>
      <p ref={descriptionRef} className="contact-hero__description">{description}</p>
    </section>
  );
};

export default ContactHero;
