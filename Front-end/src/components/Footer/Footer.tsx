import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Footer.css';

gsap.registerPlugin(ScrollTrigger);

function Footer() {
    const footerRef = useRef<HTMLElement>(null);
    const brandRef = useRef<HTMLDivElement>(null);
    const sectionsRef = useRef<(HTMLDivElement | null)[]>([]);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Footer container fade in
            gsap.from(footerRef.current, {
                opacity: 0,
                y: 30,
                duration: 0.8,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: footerRef.current,
                    start: "top 90%",
                    toggleActions: "play none none none"
                }
            });

            // Brand section animation
            gsap.from(brandRef.current, {
                opacity: 0,
                x: -30,
                duration: 0.6,
                delay: 0.2,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: brandRef.current,
                    start: "top 90%",
                    toggleActions: "play none none none"
                }
            });

            // Footer sections cascade
            sectionsRef.current.forEach((section, index) => {
                if (section) {
                    gsap.from(section, {
                        opacity: 0,
                        y: 20,
                        duration: 0.5,
                        delay: 0.3 + (index * 0.1),
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: section,
                            start: "top 90%",
                            toggleActions: "play none none none"
                        }
                    });
                }
            });

            // Footer bottom slide up
            gsap.from(bottomRef.current, {
                opacity: 0,
                y: 20,
                duration: 0.6,
                delay: 0.6,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: bottomRef.current,
                    start: "top 95%",
                    toggleActions: "play none none none"
                }
            });
        });

        return () => ctx.revert();
    }, []);

    return (
        <footer ref={footerRef} className="footer">
            <div className="footer-container">
                <div className="footer-content">
                    {/* Brand Section */}
                    <div ref={brandRef} className="footer-section footer-brand">
                        <h3 className="footer-logo">Warrify</h3>
                        <p className="footer-tagline">
                            Modern warranty management for businesses and individuals.
                        </p>
                    </div>

                    {/* Product Links */}
                    <div ref={(el) => { sectionsRef.current[0] = el; }} className="footer-section">
                        <h4 className="footer-heading">Product</h4>
                        <ul className="footer-links">
                            <li><Link to="/dashboard">Dashboard</Link></li>
                            <li><Link to="/pricing">Pricing</Link></li>
                            <li><Link to="/about">About Us</Link></li>
                        </ul>
                    </div>

                    {/* Resources Links */}
                    <div ref={(el) => { sectionsRef.current[1] = el; }} className="footer-section">
                        <h4 className="footer-heading">Resources</h4>
                        <ul className="footer-links">
                            <li><Link to="/contact">Contact</Link></li>
                            <li><Link to="/home">Home</Link></li>
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div ref={(el) => { sectionsRef.current[2] = el; }} className="footer-section">
                        <h4 className="footer-heading">Legal</h4>
                        <ul className="footer-links">
                            <li><a href="#privacy">Privacy Policy</a></li>
                            <li><a href="#terms">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div ref={bottomRef} className="footer-bottom">
                    <p className="footer-copyright">
                        © 2025 Warrify. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;