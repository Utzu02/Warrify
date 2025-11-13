import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './AboutCTA.css';

gsap.registerPlugin(ScrollTrigger);

function AboutCTA() {
    const sectionRef = useRef<HTMLElement>(null);
    const eyebrowRef = useRef<HTMLParagraphElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const descriptionRef = useRef<HTMLParagraphElement>(null);
    const buttonsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Section slide up
            gsap.from(sectionRef.current, {
                opacity: 0,
                y: 40,
                duration: 0.8,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 80%",
                    toggleActions: "play none none none"
                }
            });

            // Content stagger
            const timeline = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 75%",
                    toggleActions: "play none none none"
                }
            });

            timeline
                .from(eyebrowRef.current, {
                    opacity: 0,
                    y: -10,
                    duration: 0.5,
                    ease: "power2.out"
                })
                .from(titleRef.current, {
                    opacity: 0,
                    y: -15,
                    duration: 0.6,
                    ease: "power2.out"
                }, "-=0.3")
                .from(descriptionRef.current, {
                    opacity: 0,
                    y: -10,
                    duration: 0.6,
                    ease: "power2.out"
                }, "-=0.3")
                .from(buttonsRef.current, {
                    opacity: 0,
                    y: 20,
                    duration: 0.6,
                    ease: "power2.out"
                }, "-=0.2");
        });

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="about-cta-card">
            <div className="about-cta-content">
                <p ref={eyebrowRef} className="about-cta-eyebrow">Join the movement</p>
                <h2 ref={titleRef} className="about-cta-title">Ready to modernize warranties?</h2>
                <p ref={descriptionRef} className="about-cta-description">
                    Our team guides every onboarding, migrates historical data, and trains your staff. Start with a friendly discovery call—
                    no sales pressure, just real solutions.
                </p>
            </div>
            <div ref={buttonsRef} className="about-cta-actions">
                <Link to="/contact" className="about-cta-btn about-cta-btn-primary">
                    Talk to us
                </Link>
                <Link to="/pricing" className="about-cta-btn about-cta-btn-secondary">
                    Explore plans
                </Link>
            </div>
        </section>
    );
}

export default AboutCTA;
