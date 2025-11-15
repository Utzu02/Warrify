import { useState } from 'react';
import './Pricing.css';
import PricingLayout from '../components/pricing/PricingLayout';
import PricingHero from '../components/pricing/PricingHero';
import BillingToggle from '../components/pricing/BillingToggle';
import PricingGrid from '../components/pricing/PricingGrid';
import FreeTierSection from '../components/pricing/FreeTierSection';
import FlexiProSection from '../components/pricing/FlexiProSection';
import Footer from "../components/Footer/Footer";
import { standardPlans, getPrice } from '../components/pricing/pricingData';
import type { BillingPeriod } from '../components/pricing/BillingToggle';

function Pricing() {
    const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
    const isYearly = billingPeriod === 'yearly';

    // Transform plans for PricingGrid with correct pricing based on billing period
    const transformedPlans = standardPlans.map(plan => ({
        ...plan,
        price: getPrice(plan, isYearly),
        period: isYearly ? 'per year' : 'per month',
        onCtaClick: () => {
            console.log(`Selected ${plan.title} plan`);
            // Add your plan selection logic here
        }
    }));

    const handleFreeTierClick = () => {
        console.log('Selected Free plan');
        // Add your free plan selection logic here
    };

    const handleFlexiProClick = (warrantyCount: number) => {
        console.log(`Selected FlexiPro plan with ${warrantyCount} warranties`);
        // Add your FlexiPro plan selection logic here
    };

    return (
        <>
            <div className="main-pricing">
                <PricingLayout>
                    <PricingHero />
                    
                    <BillingToggle 
                        billingPeriod={billingPeriod}
                        onToggle={setBillingPeriod}
                    />
                    
                    <PricingGrid 
                        plans={transformedPlans}
                    />
                    
                    <FreeTierSection 
                        onCtaClick={handleFreeTierClick}
                    />
                    
                    <FlexiProSection 
                        onCtaClick={handleFlexiProClick}
                    />
                </PricingLayout>
            </div>
            <Footer />
        </>
    );
}

export default Pricing;
