import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './BillingToggle.css';

export type BillingPeriod = 'monthly' | 'yearly';

interface BillingToggleProps {
  billingPeriod: BillingPeriod;
  onToggle: (period: BillingPeriod) => void;
  discount?: string;
}

const BillingToggle = ({ billingPeriod, onToggle, discount = "Save 20%" }: BillingToggleProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(containerRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.6,
        delay: 0.4,
        ease: "power2.out"
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="billing-toggle-container">
      <div className="billing-toggle">
        <button
          className={`billing-toggle-btn ${billingPeriod === 'monthly' ? 'active' : ''}`}
          onClick={() => onToggle('monthly')}
          aria-pressed={billingPeriod === 'monthly'}
          aria-label="Monthly billing"
        >
          Monthly Billing
        </button>
        <button
          className={`billing-toggle-btn ${billingPeriod === 'yearly' ? 'active' : ''}`}
          onClick={() => onToggle('yearly')}
          aria-pressed={billingPeriod === 'yearly'}
          aria-label="Yearly billing with discount"
        >
          Yearly Billing
        </button>
      </div>
    </div>
  );
};

export default BillingToggle;
