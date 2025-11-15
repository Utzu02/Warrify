import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './AboutValues.css';

gsap.registerPlugin(ScrollTrigger);

interface Value {
    title: string;
    copy: string;
}

interface AboutValuesProps {
    values: Value[];
}

function AboutValues({ values }: AboutValuesProps) {
    const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            cardsRef.current.forEach((card, index) => {
                if (card) {
                    gsap.from(card, {
                        opacity: 0,
                        y: 30,
                        duration: 0.6,
                        delay: index * 0.15,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: card,
                            start: "top 85%",
                            toggleActions: "play none none none"
                        }
                    });
                }
            });
        });

        return () => ctx.revert();
    }, [values]);

    return (
        <section className="about-values">
            <div className="about-values-header">
                <div>
                    <p className="about-section-eyebrow">Our principles</p>
                    <h2 className="about-values-title">Values that keep teams calm</h2>
                </div>
            </div>
            <div className="about-values-grid">
                {values.map((value, index) => (
                    <div
                        key={value.title}
                        className="about-value-card"
                        ref={(el) => { cardsRef.current[index] = el; }}
                    >
                        <span className="about-value-index">
                            {String(index + 1).padStart(2, '0')}
                        </span>
                        <div>
                            <h4 className="about-value-title">{value.title}</h4>
                            <p className="about-value-copy">{value.copy}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default AboutValues;
