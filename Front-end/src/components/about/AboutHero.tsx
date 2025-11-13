import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './AboutHero.css';

function AboutHero() {
    const eyebrowRef = useRef<HTMLParagraphElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const leadRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Eyebrow fade in
            gsap.from(eyebrowRef.current, {
                opacity: 0,
                y: -20,
                duration: 0.6,
                ease: "power2.out"
            });

            // Title slide down
            gsap.from(titleRef.current, {
                opacity: 0,
                y: -30,
                duration: 0.8,
                delay: 0.2,
                ease: "power2.out"
            });

            // Lead paragraph fade up
            gsap.from(leadRef.current, {
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
            <p ref={eyebrowRef} className="about-hero-eyebrow">About Warrify</p>
            <h1 ref={titleRef} className="about-hero-title">
                We help teams reclaim time by taming chaotic warranty data.
            </h1>
            <p ref={leadRef} className="about-hero-lead">
                Warrify unifies every warranty certificate, invoice, and service note inside a calm, searchable hub.
                Businesses stay ahead of expirations, customers get faster answers, and no one has to dig through crowded inboxes again.
            </p>
        </section>
    );
}

export default AboutHero;
