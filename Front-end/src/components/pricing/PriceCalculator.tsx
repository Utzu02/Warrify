import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './PriceCalculator.css'

gsap.registerPlugin(ScrollTrigger);

const PRICE_PER_TB = 0.30;

const PriceCalculator = () => {
  const [storage, setStorage] = useState<number>(100);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const columnRef = useRef<HTMLDivElement>(null);
  const calculatorRef = useRef<HTMLDivElement>(null);

  const calculatePrice = () => {
    return storage * PRICE_PER_TB;
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.from(titleRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top 85%",
          toggleActions: "play none none none"
        }
      });

      // FlexiPro column from left
      gsap.from(columnRef.current, {
        opacity: 0,
        x: -40,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: {
          trigger: columnRef.current,
          start: "top 80%",
          toggleActions: "play none none none"
        }
      });

      // Calculator from right
      gsap.from(calculatorRef.current, {
        opacity: 0,
        x: 40,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: {
          trigger: calculatorRef.current,
          start: "top 80%",
          toggleActions: "play none none none"
        }
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
      <h2 ref={titleRef} className='titlu-price'>Obtain customizable storage space and pay based on usage</h2>
      <div ref={containerRef} className='container-price'>
        <div ref={columnRef} className="pricing-column">
          <h2>FlexiPro</h2>
          <div className="price-box">
            <>
            <div className="incepand">Starting at</div>
            <div className="price">50 RON</div>
            <small>*RON per month</small>
            </>
          </div>
          
          <div className="specs">
            <p>Management offers 300 monthly guarantees</p>
            <p>Number of additional guarantees charged with 0.30 RON* per warranty.</p>
            <p>Advanced warranty report</p>
          </div>

          <ul className="features">
            <li>Allows flexibility</li>
          </ul>

          <button className="buy-button">Buy FlexiPro</button>
        </div>
        <div ref={calculatorRef} className="price-calculator">
          <h2>Estimated Price Calculator</h2>

          <div className="calculator-section">
            <label>
              Number of warranties: {storage}
              <input
                type="range"
                min="3"
                max="5000"
                step="1"
                value={storage}
                onChange={(e) => setStorage(Number(e.target.value))}
                className="storage-slider"
              />
            </label>
          </div>

          <div className="price-result">
            <h3>Total monthly estimate</h3>
            <div className="price-display">
              {calculatePrice().toFixed(2)} RON
            </div>
            <small className="price-note">*price calculated for {storage} warranties</small>
          </div>
        </div>
      </div>
    </>
  );
};

export default PriceCalculator