import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '../Button';
import PriceBadge from './PriceBadge';
import PlanFeatureList from './PlanFeatureList';
import './PlanCard.css';

gsap.registerPlugin(ScrollTrigger);

interface Feature {
  text: string;
  included: boolean;
}

interface PlanCardProps {
  title: string;
  description: string;
  price: string | number;
  period: string;
  features: Feature[];
  ctaText: string;
  ctaVariant?: 'primary' | 'secondary';
  isPopular?: boolean;
  onCtaClick?: () => void;
  index?: number;
}

const PlanCard = ({
  title,
  description,
  price,
  period,
  features,
  ctaText,
  ctaVariant = 'primary',
  isPopular = false,
  onCtaClick,
  index = 0
}: PlanCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(cardRef.current, {
        opacity: 0,
        y: 50,
        scale: 0.95,
        duration: 0.7,
        delay: index * 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 85%",
          toggleActions: "play none none none"
        }
      });
    });

    return () => ctx.revert();
  }, [index]);

  return (
    <div 
      ref={cardRef}
      className={`plan-card ${isPopular ? 'plan-card-popular' : ''}`}
    >
      {isPopular && <PriceBadge text="Most Popular" />}
      
      <div className="plan-card-header">
        <h3 className="plan-card-title">{title}</h3>
        <p className="plan-card-description">{description}</p>
      </div>

      <div className="plan-card-price">
        <div className="plan-card-price-amount">{price} RON</div>
        <div className="plan-card-price-period">*{period}</div>
      </div>

      <PlanFeatureList features={features} />

      <div className="plan-card-cta">
        <Button 
          variant={ctaVariant} 
          size="medium" 
          fullWidth
          onClick={onCtaClick}
        >
          {ctaText}
        </Button>
      </div>
    </div>
  );
};

export default PlanCard;
