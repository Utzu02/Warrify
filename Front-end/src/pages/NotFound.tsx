import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import Button from '../components/Button';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(cardRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.7,
        ease: 'power2.out'
      });

      gsap.from(titleRef.current, {
        opacity: 0,
        y: -25,
        duration: 0.6,
        delay: 0.2,
        ease: 'power2.out'
      });

      gsap.from(textRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.6,
        delay: 0.35,
        ease: 'power2.out'
      });

      gsap.from(actionsRef.current, {
        opacity: 0,
        y: 25,
        duration: 0.6,
        delay: 0.5,
        ease: 'power2.out'
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="notfound-page">
      <div ref={cardRef} className="notfound-card">
        <button
          type="button"
          className="auth-card-back"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <span aria-hidden="true">←</span>
          Back
        </button>

        <div className="notfound-icon">🧭</div>
        <h1 ref={titleRef}>Lost in the grid</h1>
        <p ref={textRef}>
          We couldn’t find the page you’re looking for. The link might be outdated or
          the page could have moved.
        </p>

        <div ref={actionsRef} className="notfound-actions">
          <Button to="/home" variant="primary" size="large">
            Go home
          </Button>
          <Button to="/contact" variant="secondary" size="large">
            Contact support
          </Button>
        </div>
      </div>
    </section>
  );
};

export default NotFound;
