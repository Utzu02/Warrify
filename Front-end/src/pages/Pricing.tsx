import './Pricing.css';
import PricingHero from '../components/pricing/PricingHero';
import PricingColumns from '../components/pricing/PricingColumns';
import PricingFreeTier from '../components/pricing/PricingFreeTier';
import PriceCalculator from '../components/pricing/PriceCalculator';
import Footer from "../components/Footer/Footer";

function Pricing() {
    return (
        <>
            <div className="mainPricing">
                <PricingHero />
                <PricingColumns />
                <PricingFreeTier />
                <PriceCalculator />
            </div>
            <Footer />
        </>
    );
}

export default Pricing;
