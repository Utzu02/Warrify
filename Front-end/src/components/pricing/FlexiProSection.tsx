import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '../button';
import PlanFeatureList from './PlanFeatureList';
import { flexiProPlan, calculateFlexiProPrice } from './pricingData';
import './FlexiProSection.css';

gsap.registerPlugin(ScrollTrigger);

interface FlexiProSectionProps {
  onCtaClick?: (warrantyCount: number) => void;
}

const FlexiProSection = ({ onCtaClick }: FlexiProSectionProps) => {
  const [warrantyCount, setWarrantyCount] = useState(50);
  const sectionRef = useRef<HTMLDivElement>(null);
  const calculatedPrice = calculateFlexiProPrice(warrantyCount);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(sectionRef.current, {
        opacity: 0,
        y: 50,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          toggleActions: "play none none none"
        }
      });
    });

    return () => ctx.revert();
  }, []);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWarrantyCount(Number(e.target.value));
  };

  return (
    <div className="flexipro-section">
      <h2 className="flexipro-section-title">
        Unlock <span className="highlight-teal">Flexible Storage</span> and Pay for What You Use
      </h2>
      
      <div ref={sectionRef} className="flexipro-container">
        {/* Left Side: Plan Info */}
        <div className="flexipro-info">
          <div className="flexipro-header">
            <h3 className="flexipro-title">
              {flexiProPlan.title}
            </h3>
            <p className="flexipro-description">{flexiProPlan.description}</p>
            
            <div className="flexipro-price">
              <div className="flexipro-price-label">Starting at</div>
              <div className="flexipro-price-amount">{flexiProPlan.basePrice} RON</div>
              <div className="flexipro-price-period">*per month</div>
            </div>
          </div>

          <div className="flexipro-features">
            <PlanFeatureList features={flexiProPlan.features} />
          </div>
        </div>

        {/* Right Side: Calculator */}
        <div className="flexipro-calculator">
          <div className="calculator-card">
            <h4 className="calculator-title">Estimated Price Calculator</h4>
            
            <div className="calculator-slider-container">
              <div className="calculator-value">
                Number of Warranties: {warrantyCount}
              </div>

              <input
                type="range"
                id="warranty-slider"
                min="50"
                max="1000"
                step="10"
                value={warrantyCount}
                onChange={handleSliderChange}
                className="calculator-slider"
              />

              <div className="calculator-range">
                <span>50</span>
                <span>1000+</span>
              </div>
            </div>

            <div className="calculator-result">
              <div className="calculator-result-label">Total monthly estimate</div>
              <div className="calculator-result-price">{calculatedPrice.toFixed(2)} RON</div>
              <div className="calculator-result-breakdown">
                *price calculated for {warrantyCount} warranties
              </div>
            </div>

            <div className="calculator-cta">
              <Button 
                variant={flexiProPlan.ctaVariant} 
                size="large"
                fullWidth
                onClick={() => onCtaClick?.(warrantyCount)}
              >
                {flexiProPlan.ctaText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlexiProSection;
