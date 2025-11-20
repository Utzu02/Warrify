import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '../button';
import PlanFeatureList from './PlanFeatureList';
import { freeTierPlan } from './pricingData';
import './FreeTierSection.css';

gsap.registerPlugin(ScrollTrigger);

interface FreeTierSectionProps {
    onCtaClick?: () => void;
    isCurrent?: boolean;
    disabled?: boolean;
}

const FreeTierSection = ({ onCtaClick, isCurrent = false, disabled = false }: FreeTierSectionProps) => {
    const sectionRef = useRef<HTMLDivElement>(null);

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

    return (
        <div className="free-tier-section">
            <div ref={sectionRef} className="free-tier-card">
                <div className="free-tier-left">
                    <h2 className="free-tier-section-title">
                        Get started with our <span className="highlight-blue">Free Subscription</span>
                    </h2>
                    <p className="free-tier-description">{freeTierPlan.description}</p>
                    <PlanFeatureList features={freeTierPlan.features} />
                </div>

                <div className="free-tier-right">
                    <div className="free-tier-price">
                        <div className="free-tier-price-amount">{freeTierPlan.price} RON</div>
                    </div>
                    {isCurrent && <span className="free-tier-choice-badge">Your choice</span>}
                    <div className="free-tier-cta">
                        <Button
                            variant={freeTierPlan.ctaVariant}
                            size="large"
                            onClick={onCtaClick}
                            disabled={disabled}
                        >
                            {isCurrent ? 'Current plan' : freeTierPlan.ctaText}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FreeTierSection;
