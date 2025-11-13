import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import './AllStyles.css';

const NotFound = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Container fade in
      gsap.from(containerRef.current, {
        opacity: 0,
        scale: 0.9,
        duration: 0.6,
        ease: "back.out(1.3)"
      });

      // Title bounce in
      gsap.from(titleRef.current, {
        opacity: 0,
        y: -50,
        duration: 0.7,
        delay: 0.2,
        ease: "bounce.out"
      });

      // Text fade in
      gsap.from(textRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.6,
        delay: 0.4,
        ease: "power2.out"
      });

      // Link slide up with pulse
      gsap.from(linkRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.6,
        delay: 0.6,
        ease: "power2.out"
      });

      // Continuous subtle pulse on link
      gsap.to(linkRef.current, {
        scale: 1.05,
        duration: 1.5,
        delay: 1.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    });

    return () => ctx.revert();
  }, []);
    
  return (
    <div ref={containerRef} className="notfound">
      <h1 ref={titleRef}>404 - Page Not Found</h1>
      <p ref={textRef}>The page you are looking for does not exist.</p>
      <Link ref={linkRef} to="/" className='notfoundtext'>Go Back to Homepage</Link>
    </div>
  );
};

export default NotFound;
