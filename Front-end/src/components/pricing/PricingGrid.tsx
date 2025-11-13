import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import PlanCard from './PlanCard';
import './PricingGrid.css';

gsap.registerPlugin(ScrollTrigger);

interface Feature {
  text: string;
  included: boolean;
}

interface Plan {
  icon: string;
  title: string;
  description: string;
  price: string | number;
  period: string;
  features: Feature[];
  ctaText: string;
  ctaVariant?: 'primary' | 'secondary';
  isPopular?: boolean;
  onCtaClick?: () => void;
}

interface PricingGridProps {
  plans: Plan[];
  title?: string;
}

const PricingGrid = ({ plans, title }: PricingGridProps) => {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (title && titleRef.current) {
      const ctx = gsap.context(() => {
        gsap.from(titleRef.current, {
          opacity: 0,
          y: 30,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top 85%",
            toggleActions: "play none none none"
          }
        });
      });

      return () => ctx.revert();
    }
  }, [title]);

  return (
    <div className="pricing-grid-section">
      {title && (
        <h2 ref={titleRef} className="pricing-grid-title">
          {title}
        </h2>
      )}
      
      <div className="pricing-grid">
        {plans.map((plan, index) => (
          <PlanCard 
            key={plan.title}
            {...plan}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

export default PricingGrid;
