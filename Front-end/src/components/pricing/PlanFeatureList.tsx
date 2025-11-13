import FeatureItem from './FeatureItem';
import './PlanFeatureList.css';

interface Feature {
  text: string;
  included: boolean;
}

interface PlanFeatureListProps {
  features: Feature[];
}

const PlanFeatureList = ({ features }: PlanFeatureListProps) => {
  return (
    <ul className="plan-feature-list">
      {features.map((feature, index) => (
        <FeatureItem 
          key={index} 
          text={feature.text} 
          included={feature.included} 
        />
      ))}
    </ul>
  );
};

export default PlanFeatureList;
