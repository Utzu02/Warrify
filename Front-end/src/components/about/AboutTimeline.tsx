import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './AboutTimeline.css';

gsap.registerPlugin(ScrollTrigger);

interface Milestone {
    year: string;
    title: string;
    copy: string;
}

interface AboutTimelineProps {
    milestones: Milestone[];
}

function AboutTimeline({ milestones }: AboutTimelineProps) {
    const sectionRef = useRef<HTMLElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Section and title animation
            gsap.from(sectionRef.current, {
                opacity: 0,
                y: 30,
                duration: 0.8,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 80%",
                    toggleActions: "play none none none"
                }
            });

            gsap.from(titleRef.current, {
                opacity: 0,
                x: -20,
                duration: 0.6,
                delay: 0.2,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: titleRef.current,
                    start: "top 85%",
                    toggleActions: "play none none none"
                }
            });

            // Timeline items cascade
            itemsRef.current.forEach((item, index) => {
                if (item) {
                    gsap.from(item, {
                        opacity: 0,
                        x: -30,
                        duration: 0.6,
                        delay: 0.4 + (index * 0.15),
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: item,
                            start: "top 85%",
                            toggleActions: "play none none none"
                        }
                    });
                }
            });
        });

        return () => ctx.revert();
    }, [milestones]);

    return (
        <section ref={sectionRef} className="about-timeline-card">
            <h2 ref={titleRef} className="about-timeline-title">Our journey</h2>
            <div className="about-timeline">
                {milestones.map((milestone, index) => (
                    <div 
                        key={milestone.year} 
                        className="about-timeline-item"
                        ref={(el) => { itemsRef.current[index] = el; }}
                    >
                        <div className="about-timeline-dot" />
                        <div className="about-timeline-content">
                            <span className="about-timeline-year">{milestone.year}</span>
                            <h5 className="about-timeline-item-title">{milestone.title}</h5>
                            <p className="about-timeline-item-copy">{milestone.copy}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default AboutTimeline;
