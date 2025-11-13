import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './PricingHero.css';

interface PricingHeroProps {
  subtitle?: string;
}

function PricingHero({ 
  subtitle = "Choose the perfect Warrify plan to keep your purchases protected, effortlessly organized, and always at your fingertips."
}: PricingHeroProps) {
    const titleRef = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(titleRef.current, {
                opacity: 0,
                y: -30,
                duration: 0.8,
                ease: "power2.out"
            });
            
            gsap.from(subtitleRef.current, {
                opacity: 0,
                y: -20,
                duration: 0.8,
                delay: 0.2,
                ease: "power2.out"
            });
        });

        return () => ctx.revert();
    }, []);

    return (
        <div className="pricing-hero">
            <h1 ref={titleRef} className="pricing-hero-title">
                Unlock <span className="pricing-hero-highlight">Smart Warranty</span> Management
            </h1>
            <p ref={subtitleRef} className="pricing-hero-subtitle">
                {subtitle}
            </p>
        </div>
    );
}

export default PricingHero;
