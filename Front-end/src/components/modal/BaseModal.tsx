import { ReactNode, useEffect, useRef } from 'react';
import Button, { ButtonProps } from '../button';
import useModalFocusTrap from '../../hooks/useModalFocusTrap';
import './BaseModal.css';

type ModalSize = 'sm' | 'md' | 'lg';
type ModalVariant = 'default' | 'warning' | 'danger' | 'success';

interface ModalAction {
  label: string;
  onClick: () => void;
  variant?: ButtonProps['variant'];
  loading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  headerContent?: ReactNode;
  footerContent?: ReactNode;
  children: ReactNode;
  primaryAction?: ModalAction;
  secondaryAction?: ModalAction;
  size?: ModalSize;
  variant?: ModalVariant;
  contentClassName?: string;
  bodyClassName?: string;
  backdropClassName?: string;
  hideCloseButton?: boolean;
  closeOnBackdrop?: boolean;
}

const BaseModal = ({
  isOpen,
  onClose,
  title,
  description,
  icon,
  headerContent,
  footerContent,
  children,
  primaryAction,
  secondaryAction,
  size = 'md',
  variant = 'default',
  contentClassName = '',
  bodyClassName = '',
  backdropClassName = '',
  hideCloseButton = false,
  closeOnBackdrop = true
}: BaseModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useModalFocusTrap(isOpen, onClose, modalRef);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    const { body } = document;
    if (!body) return undefined;
    const previousOverflow = body.style.overflow;
    body.style.overflow = 'hidden';
    return () => {
      body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!closeOnBackdrop) return;
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const renderTitle = () => {
    if (!title) return null;
    return typeof title === 'string' ? <h2>{title}</h2> : title;
  };

  const renderDescription = () => {
    if (!description) return null;
    return typeof description === 'string' ? (
      <p className="base-modal-description">{description}</p>
    ) : (
      description
    );
  };

  const header = headerContent ?? (
    (title || description || icon) && (
      <div className="base-modal-header">
        {icon && <div className="base-modal-icon" aria-hidden="true">{icon}</div>}
        <div className="base-modal-header-copy">
          {renderTitle()}
          {renderDescription()}
        </div>
      </div>
    )
  );

  const footer =
    footerContent ??
    ((primaryAction || secondaryAction) && (
      <div className="base-modal-footer">
        {secondaryAction && (
          <Button
            type={secondaryAction.type ?? 'button'}
            variant={secondaryAction.variant ?? 'ghost'}
            onClick={secondaryAction.onClick}
            disabled={secondaryAction.disabled}
            loading={secondaryAction.loading}
          >
            {secondaryAction.label}
          </Button>
        )}
        {primaryAction && (
          <Button
            type={primaryAction.type ?? 'button'}
            variant={primaryAction.variant ?? 'primary'}
            onClick={primaryAction.onClick}
            disabled={primaryAction.disabled}
            loading={primaryAction.loading}
          >
            {primaryAction.label}
          </Button>
        )}
      </div>
    ));

  return (
    <div
      className={`base-modal-backdrop ${backdropClassName}`.trim()}
      onClick={handleBackdropClick}
    >
      <div
        className={`base-modal-content base-modal-${size} base-modal-${variant} ${contentClassName}`.trim()}
        role="dialog"
        aria-modal="true"
        ref={modalRef}
      >
        {!hideCloseButton && (
          <button className="base-modal-close" onClick={onClose} aria-label="Close modal">
            ×
          </button>
        )}
        {header}
        <div className={`base-modal-body ${bodyClassName}`.trim()}>{children}</div>
        {footer}
      </div>
    </div>
  );
};

export default BaseModal;
