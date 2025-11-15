import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ContactStats.css';

gsap.registerPlugin(ScrollTrigger);

type Stat = {
  title: string;
  value: string;
};

type ContactStatsProps = {
  stats: Stat[];
};

const ContactStats = ({ stats }: ContactStatsProps) => {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, index) => {
        if (card) {
          gsap.from(card, {
            opacity: 0,
            scale: 0.9,
            y: 30,
            duration: 0.6,
            delay: index * 0.15,
            ease: "back.out(1.2)",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none none"
            }
          });
        }
      });
    });

    return () => ctx.revert();
  }, [stats]);

  return (
    <section className="contact-stats">
      {stats.map((stat, index) => (
        <div 
          className="contact-stats-card" 
          key={stat.title}
          ref={(el) => { cardsRef.current[index] = el; }}
        >
          <span className="contact-stats-value">{stat.value}</span>
          <span className="contact-stats-label">{stat.title}</span>
        </div>
      ))}
    </section>
  );
};

export default ContactStats;
