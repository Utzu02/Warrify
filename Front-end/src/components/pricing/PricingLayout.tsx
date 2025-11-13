import './styles/variables.css';
import './PricingLayout.css';

interface PricingLayoutProps {
  children: React.ReactNode;
}

const PricingLayout = ({ children }: PricingLayoutProps) => {
  return (
    <div className="pricing-layout">
      <div className="pricing-layout-container">
        {children}
      </div>
    </div>
  );
};

export default PricingLayout;
