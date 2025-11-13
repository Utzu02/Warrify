import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './PricingFreeTier.css';

gsap.registerPlugin(ScrollTrigger);

function PricingFreeTier() {
    const cardRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const priceRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Card slide up
            gsap.from(cardRef.current, {
                opacity: 0,
                y: 40,
                duration: 0.8,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: cardRef.current,
                    start: "top 80%",
                    toggleActions: "play none none none"
                }
            });

            // Content from left
            gsap.from(contentRef.current, {
                opacity: 0,
                x: -30,
                duration: 0.6,
                delay: 0.2,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: contentRef.current,
                    start: "top 85%",
                    toggleActions: "play none none none"
                }
            });

            // Price from right
            gsap.from(priceRef.current, {
                opacity: 0,
                x: 30,
                duration: 0.6,
                delay: 0.2,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: priceRef.current,
                    start: "top 85%",
                    toggleActions: "play none none none"
                }
            });
        });

        return () => ctx.revert();
    }, []);

    return (
        <div ref={cardRef} className="pricing-free-tier">
            <div ref={contentRef} className="pricing-free-content">
                <h2 className="pricing-free-title">Get started with our free subscription</h2>
                <ul className="pricing-free-list">
                    <li className="pricing-free-item">
                        Management offers 20 monthly guarantees
                    </li>
                    <li className="pricing-free-item">
                        Manually import guarantees from email
                    </li>
                </ul>
            </div>
            <div ref={priceRef} className="pricing-free-price">
                <p className="pricing-free-amount">0 RON</p>
                <Link to="/register" className="pricing-free-button button buttoninvert">
                    Try for free
                </Link>
            </div>
        </div>
    );
}

export default PricingFreeTier;
