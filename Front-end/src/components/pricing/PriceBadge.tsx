import './PriceBadge.css';

interface PriceBadgeProps {
  text: string;
}

const PriceBadge = ({ text }: PriceBadgeProps) => {
  return (
    <div className="price-badge">
      {text}
    </div>
  );
};

export default PriceBadge;
