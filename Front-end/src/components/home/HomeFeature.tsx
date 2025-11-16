import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './HomeFeature.css';

gsap.registerPlugin(ScrollTrigger);

interface FeatureItem {
  text: string;
}

interface HomeFeatureProps {
  label: string;
  title: string;
  description: string;
  features: FeatureItem[];
  imageSrc: string;
  imageAlt: string;
  reversed?: boolean;
  cardColor?: 'blue' | 'pink';
}

function HomeFeature({
  label,
  title,
  description,
  features,
  imageSrc,
  imageAlt,
  reversed = false,
  cardColor = 'blue'
}: HomeFeatureProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const listItemsRef = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Section fade in
      gsap.from(sectionRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none none"
        }
      });

      // Content slide from left or right based on reversed
      gsap.from(contentRef.current, {
        opacity: 0,
        x: reversed ? 50 : -50,
        duration: 0.8,
        delay: 0.3,
        ease: "power2.out",
        scrollTrigger: {
          trigger: contentRef.current,
          start: "top 80%",
          toggleActions: "play none none none"
        }
      });

      // Visual slide from opposite direction
      gsap.from(visualRef.current, {
        opacity: 0,
        x: reversed ? -50 : 50,
        duration: 0.8,
        delay: 0.3,
        ease: "power2.out",
        scrollTrigger: {
          trigger: visualRef.current,
          start: "top 90%",
          toggleActions: "play none none none"
        }
      });

      // List items cascade animation
      listItemsRef.current.forEach((item, index) => {
        if (item) {
          gsap.from(item, {
            opacity: 0,
            x: -20,
            duration: 0.5,
            delay: 0.6 + (index * 0.2),
            ease: "power2.out",
            scrollTrigger: {
              trigger: item,
              start: "top 85%",
              toggleActions: "play none none none"
            }
          });
        }
      });
    });

    return () => ctx.revert();
  }, [reversed]);

  return (
    <section ref={sectionRef} className={`home-feature-section ${reversed ? 'home-feature-alt' : ''}`}>
      <div className="home-feature-container">
        {!reversed && <span className="home-feature-pill-label">{label}</span>}
        <div className={`home-feature-grid ${reversed ? 'home-feature-grid-reversed' : ''}`}>
          <div ref={contentRef} className="home-feature-content">
            <h2 className="home-feature-title">{title}</h2>
            <p className="home-feature-description">{description}</p>
            <ul className="home-feature-list">
              {features.map((feature, index) => (
                <li 
                  key={index} 
                  className="home-feature-list-item"
                  ref={(el) => {
                    listItemsRef.current[index] = el;
                  }}
                >
                  <svg className="home-feature-check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#16a34a"/>
                    <path d="M8 12.5l2.5 2.5L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {feature.text}
                </li>
              ))}
            </ul>
          </div>
          <div ref={visualRef} className="home-feature-visual">
            <div className={`home-feature-visual-card ${cardColor === 'blue' ? 'home-feature-card-soft-blue' : 'home-feature-card-soft-pink'}`}>
              <img src={imageSrc} alt={imageAlt} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeFeature;

