import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Home.css';
import dash from '../assets/dashboard.png';
import conf2 from '../assets/conf2.png';
import Footer from "../components/Footer/Footer";
import HomeBenefits from "../components/HomeBenefits/HomeBenefits";
import HomeHero from "../components/home/HomeHero";
import HomeFeature from "../components/home/HomeFeature";
import HomeCTA from "../components/home/HomeCTA";

gsap.registerPlugin(ScrollTrigger);

const dashboardFeatures = [
  { text: 'Retain important details of every warranty' },
  { text: 'Reduce administrative work by up to 80%' },
  { text: 'Visualize warranty lifecycles at a glance' }
];

const reminderFeatures = [
  { text: 'Automated push notifications before expiry' },
  { text: 'Customizable reminder schedules' },
  { text: 'Peace of mind with zero manual tracking' }
];

function Home() {
    const benefitsSectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(benefitsSectionRef.current, {
                opacity: 0,
                y: 30,
                duration: 0.8,
                delay: 0.3,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: benefitsSectionRef.current,
                    start: "top 75%",
                    toggleActions: "play none none none"
                }
            });
        });

        return () => ctx.revert();
    }, []);

    return (
        <>
            <HomeHero />

            <HomeFeature
                label="Streamline Your Workflow"
                title="Intuitive Dashboard & Advanced Reporting"
                description="Gain clarity with an easy-to-use dashboard that provides instant access to all your warranty information. Simplify decision-making with data-driven insights and detailed reports."
                features={dashboardFeatures}
                imageSrc={dash}
                imageAlt="Dashboard Preview"
                cardColor="blue"
            />

            <HomeFeature
                label="Never Miss a Deadline"
                title="Smart Push Reminders"
                description="Breathe easy with automated expiry alerts. Never worry again about missing an expiration date—automation handles the heavy lifting for you."
                features={reminderFeatures}
                imageSrc={conf2}
                imageAlt="Reminders Preview"
                reversed={true}
                cardColor="pink"
            />

            <HomeCTA />

            <section ref={benefitsSectionRef} className="home-benefits-section">
                <div className="home-benefits-container">
                    <HomeBenefits />
                </div>
            </section>

            <Footer />
        </>
    );
}

export default Home;

