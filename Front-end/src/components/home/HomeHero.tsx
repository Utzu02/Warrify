import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import './HomeHero.css';

function HomeHero() {
    const sectionRef = useRef<HTMLElement>(null);
    const pillRef = useRef<HTMLSpanElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);
    const ctaGroupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Section fade in
            gsap.from(sectionRef.current, {
                opacity: 0,
                duration: 0.8,
                ease: "power2.out"
            });

            // Pill label slide down
            gsap.from(pillRef.current, {
                opacity: 0,
                y: -30,
                duration: 0.6,
                delay: 0.2,
                ease: "power2.out"
            });

            // Title slide down
            gsap.from(titleRef.current, {
                opacity: 0,
                y: -30,
                duration: 0.8,
                delay: 0.4,
                ease: "power2.out"
            });

            // Subtitle slide down
            gsap.from(subtitleRef.current, {
                opacity: 0,
                y: -30,
                duration: 0.8,
                delay: 0.6,
                ease: "power2.out"
            });

            // CTA group slide up
            gsap.from(ctaGroupRef.current, {
                opacity: 0,
                y: 30,
                duration: 0.8,
                delay: 0.8,
                ease: "power2.out"
            });
        });

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="home-hero-section">
            <div className="home-hero-container">
                <span ref={pillRef} className="home-hero-pill-label">Streamline Your Workflow</span>
                <h1 ref={titleRef} className="home-hero-title">
                    Organize Invoices. <span className="home-hero-highlight">Simplify Warranties.</span>
                </h1>
                <p ref={subtitleRef} className="home-hero-subtitle">
                    Warrify offers a modern, intelligent way to manage all your warranties, bringing you peace of mind and effortless organization.
                </p>
                <div ref={ctaGroupRef} className="home-hero-cta-group">
                    <Link to="/register" className="home-hero-btn-primary">
                        Start Your Free Trial
                    </Link>
                    <Link to="/pricing" className="home-hero-btn-secondary">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polygon points="10 8 16 12 10 16 10 8"/>
                        </svg>
                        Learn More
                    </Link>
                </div>
            </div>
        </section>
    );
}

export default HomeHero;
