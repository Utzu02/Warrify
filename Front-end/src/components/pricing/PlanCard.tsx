import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '../button';
import PriceBadge from './PriceBadge';
import PlanFeatureList from './PlanFeatureList';
import './PlanCard.css';
import type { PaidPlanKey } from '../../types/billing';
import { PLAN_MAX_WARRANTIES } from '../../config/planLimits';

gsap.registerPlugin(ScrollTrigger);

interface Feature {
  text: string;
  included: boolean;
}

interface PlanCardProps {
  planKey: PaidPlanKey;
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
  ctaLoading?: boolean;
  isCurrent?: boolean;
  disabled?: boolean;
}

const PlanCard = ({
  planKey,
  title,
  description,
  price,
  period,
  features,
  ctaText,
  ctaVariant = 'primary',
  isPopular = false,
  onCtaClick,
  index = 0,
  ctaLoading = false,
  isCurrent = false,
  disabled = false
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
      data-plan-key={planKey}
    >
      {isPopular && <PriceBadge text="Most Popular" />}
      {isCurrent && (
        <span className="plan-card-choice-badge">
          Your choice
        </span>
      )}
      
      <div className="plan-card-header">
        <h3 className="plan-card-title">{title}</h3>
        <p className="plan-card-description">{description}</p>
      </div>

      <div className="plan-card-price">
        <div className="plan-card-price-amount">{price} RON</div>
        <div className="plan-card-price-period">*{period}</div>
        {PLAN_MAX_WARRANTIES[planKey] && (
          <div className="plan-card-limit">Includes {PLAN_MAX_WARRANTIES[planKey]} warranties</div>
        )}
      </div>

      <PlanFeatureList features={features} />

      <div className="plan-card-cta">
        <Button 
          variant={ctaVariant} 
          size="medium" 
          fullWidth
          onClick={onCtaClick}
          loading={ctaLoading}
          disabled={ctaLoading || disabled}
        >
          {isCurrent && disabled ? 'Current plan' : ctaText}
        </Button>
      </div>
    </div>
  );
};

export default PlanCard;
