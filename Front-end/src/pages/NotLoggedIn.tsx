import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import Button from '../components/button';
import './NotLoggedIn.css';

const NotLoggedIn = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // Icon bounce
      gsap.from(iconRef.current, {
        opacity: 0,
        scale: 0,
        duration: 0.7,
        delay: 0.2,
        ease: "back.out(1.7)"
      });

      // Title slide down
      gsap.from(titleRef.current, {
        opacity: 0,
        y: -30,
        duration: 0.6,
        delay: 0.4,
        ease: "power2.out"
      });

      // Text fade in
      gsap.from(textRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.6,
        delay: 0.6,
        ease: "power2.out"
      });

      // Buttons slide up
      gsap.from(buttonsRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.6,
        delay: 0.8,
        ease: "power2.out"
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="not-logged-in-page">
      <div className="not-logged-in-content">
        <button
          type="button"
          className="auth-card-back"
          onClick={() => navigate('/home')}
          aria-label="Go back"
        >
          <span aria-hidden="true">←</span>
          Back
        </button>
        <h1 ref={titleRef} className="not-logged-in-title">
          Authentication Required
        </h1>
        <p ref={textRef} className="not-logged-in-text">
          You need to be logged in to access this page. Please log in or create an account to continue.
        </p>
        <div ref={buttonsRef} className="not-logged-in-buttons">
          <Button to="/login" variant="primary" size="large">
            Log In
          </Button>
          <Button to="/register" variant="secondary" size="large">
            Create Account
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotLoggedIn;
