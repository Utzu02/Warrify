import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  fullPage?: boolean;
}

const LoadingSpinner = ({ message = 'Loading...', size = 'medium', fullPage = false }: LoadingSpinnerProps) => {
  if (fullPage) {
    return (
      <div className="loading-spinner-overlay">
        <div className="loading-spinner-container">
          <div className={`loading-spinner loading-spinner--${size}`}>
            <div className="spinner-circle"></div>
          </div>
          {message && <p className="loading-spinner-message">{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="loading-spinner-container">
      <div className={`loading-spinner loading-spinner--${size}`}>
        <div className="spinner-circle"></div>
      </div>
      {message && <p className="loading-spinner-message">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
