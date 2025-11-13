import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Button from '../Button';
import './HomeCTA.css';

gsap.registerPlugin(ScrollTrigger);

function HomeCTA() {
    const sectionRef = useRef<HTMLElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const descriptionRef = useRef<HTMLParagraphElement>(null);
    const buttonRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Container fade up
            gsap.from(containerRef.current, {
                opacity: 0,
                y: 30,
                duration: 0.8,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 75%",
                    toggleActions: "play none none none"
                }
            });

            // Title slide from top
            gsap.from(titleRef.current, {
                opacity: 0,
                y: -20,
                duration: 0.6,
                delay: 0.2,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: titleRef.current,
                    start: "top 80%",
                    toggleActions: "play none none none"
                }
            });

            // Description slide from top
            gsap.from(descriptionRef.current, {
                opacity: 0,
                y: -20,
                duration: 0.6,
                delay: 0.4,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: descriptionRef.current,
                    start: "top 80%",
                    toggleActions: "play none none none"
                }
            });

            // Button slide from top with pulse
            gsap.from(buttonRef.current, {
                opacity: 0,
                y: -20,
                duration: 0.6,
                delay: 0.6,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: buttonRef.current,
                    start: "top 85%",
                    toggleActions: "play none none none"
                }
            });

            // Button pulse animation (continuous)
            gsap.to(buttonRef.current, {
                scale: 1.03,
                duration: 2,
                delay: 1.2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        });

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="home-cta-band">
            <div ref={containerRef} className="home-cta-container">
                <h2 ref={titleRef} className="home-cta-title">Power Your Business Growth with Warrify</h2>
                <p ref={descriptionRef} className="home-cta-description">
                    Whether you're a freelancer, a startup, or an established business, Warrify is the online tool designed to bring your team together, safeguard your guarantees, and transform how you collaborate.
                </p>
                <div ref={buttonRef}>
                    <Button to="/pricing" variant="primary" size="large">
                        Explore Our Plans
                    </Button>
                </div>
            </div>
        </section>
    );
}

export default HomeCTA;

