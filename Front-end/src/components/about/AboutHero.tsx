import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './AboutHero.css';

function AboutHero() {
    const titleRef = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Title slide down
            gsap.from(titleRef.current, {
                opacity: 0,
                y: -30,
                duration: 0.8,
                delay: 0.2,
                ease: "power2.out"
            });

            // Subtitle fade up
            gsap.from(subtitleRef.current, {
                opacity: 0,
                y: 20,
                duration: 0.8,
                delay: 0.4,
                ease: "power2.out"
            });
        });

        return () => ctx.revert();
    }, []);

    return (
        <section className="about-hero">
            <div className="about-hero-heading">
                <h1 ref={titleRef} className="about-hero-title">
                    We help teams reclaim time by taming <span className="about-hero-highlight">chaotic warranty data.</span>
                </h1>
                <p ref={subtitleRef} className="about-hero-subtitle">
                    Warrify unifies every warranty certificate, invoice, and service note inside a calm, searchable hub.
                    Businesses stay ahead of expirations, customers get faster answers, and no one has to dig through crowded inboxes again.
                </p>
            </div>
        </section>
    );
}

export default AboutHero;
