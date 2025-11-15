import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '../button';
import './ContactForm.css';

gsap.registerPlugin(ScrollTrigger);

const ContactForm = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const inputsRef = useRef<(HTMLLabelElement | null)[]>([]);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Card fade in and slide up
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

      // Heading section animation
      gsap.from(headingRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.6,
        delay: 0.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: headingRef.current,
          start: "top 85%",
          toggleActions: "play none none none"
        }
      });

      // Form inputs cascade
      inputsRef.current.forEach((input, index) => {
        if (input) {
          gsap.from(input, {
            opacity: 0,
            x: -20,
            duration: 0.5,
            delay: 0.4 + (index * 0.1),
            ease: "power2.out",
            scrollTrigger: {
              trigger: input,
              start: "top 85%",
              toggleActions: "play none none none"
            }
          });
        }
      });

      // Button animation
      gsap.from(buttonRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.6,
        delay: 1.0,
        ease: "power2.out",
        scrollTrigger: {
          trigger: buttonRef.current,
          start: "top 90%",
          toggleActions: "play none none none"
        }
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div ref={cardRef} className="contact-form-card">
      <div ref={headingRef} className="contact-form-card-heading">
        <span className="contact-form-card-badge">Message</span>
        <h3 className="contact-form-card-title">Send us a note</h3>
        <p className="contact-form-card-description">
          Tell us a little about your request and we'll connect you with the right specialist.
        </p>
      </div>
      <form ref={formRef} className="contact-form-card-grid">
        <label ref={(el) => { inputsRef.current[0] = el; }}>
          Full name
          <input type="text" placeholder="Alex Popescu" required />
        </label>
        <label ref={(el) => { inputsRef.current[1] = el; }}>
          Work email
          <input type="email" placeholder="team@company.com" required />
        </label>
        <label ref={(el) => { inputsRef.current[2] = el; }}>
          Company
          <input type="text" placeholder="Your organization" />
        </label>
        <label ref={(el) => { inputsRef.current[3] = el; }}>
          Phone number
          <input type="tel" placeholder="+40 7xx xxx xxx" />
        </label>
        <label ref={(el) => { inputsRef.current[4] = el; }} className="contact-form-card-full-width">
          How can we help?
          <textarea rows={5} placeholder="Share details about your workflow, timeline, or question." />
        </label>
        <div ref={buttonRef} className="contact-form-card-full-width">
          <Button type="submit" variant="primary" size="large" fullWidth>
            Send message
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
