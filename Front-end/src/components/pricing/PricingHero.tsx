import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './PricingHero.css';

function PricingHero() {
    const titleRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(titleRef.current, {
                opacity: 0,
                y: -30,
                duration: 0.8,
                ease: "power2.out"
            });
        });

        return () => ctx.revert();
    }, []);

    return (
        <div ref={titleRef} className="pricing-hero">
            <h1 className="pricing-hero-title">Pick the subscription that suits you best</h1>
        </div>
    );
}

export default PricingHero;
