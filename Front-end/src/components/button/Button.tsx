import React from 'react';
import { Link } from 'react-router-dom';
import './Button.css';

export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  to?: string; // For Link behavior
  href?: string; // For anchor / external links
  target?: React.HTMLAttributeAnchorTarget;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  onClick,
  type = 'button',
  className = '',
  to,
  href,
  target,
}) => {
  const baseClasses = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth ? 'btn-full-width' : '',
    disabled || loading ? 'btn-disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {loading ? (
        <span className="btn-spinner" />
      ) : (
        <>
          {leftIcon && <span className="btn-icon-left">{leftIcon}</span>}
          <span className="btn-text">{children}</span>
          {rightIcon && <span className="btn-icon-right">{rightIcon}</span>}
        </>
      )}
    </>
  );

  // If it's a Link (internal navigation)
  if (to && !disabled && !loading) {
    return (
      <Link to={to} className={baseClasses}>
        {content}
      </Link>
    );
  }

  // If it's an external link
  if (href && !disabled && !loading) {
    const anchorTarget = target ?? '_self';
    const rel = anchorTarget === '_blank' ? 'noopener noreferrer' : undefined;
    return (
      <a href={href} className={baseClasses} target={anchorTarget} rel={rel}>
        {content}
      </a>
    );
  }

  // Regular button
  return (
    <button
      type={type}
      className={baseClasses}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {content}
    </button>
  );
};

export default Button;
