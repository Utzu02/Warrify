import './FeatureItem.css';

interface FeatureItemProps {
  text: string;
  included: boolean;
}

const FeatureItem = ({ text, included }: FeatureItemProps) => {
  return (
    <li className="feature-item">
      {included ? (
        <svg className="feature-icon feature-icon-check" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="#10B981"/>
          <path d="M8 12l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) : (
        <svg className="feature-icon feature-icon-neutral" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="#D1D5DB"/>
          <path d="M8 12l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
      <span className="feature-text">{text}</span>
    </li>
  );
};

export default FeatureItem;
