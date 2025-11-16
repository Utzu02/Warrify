import { ReactNode, useRef } from 'react';
import useModalFocusTrap from '../../hooks/useModalFocusTrap';
import '../gmailConfigModal/GmailConfigModal.css';
import './ModalWarranty.css';

interface ModalProps {
  children: ReactNode;
  onClose: () => void;
}

const ModalWarranty = ({ children, onClose }: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useModalFocusTrap(true, onClose, modalRef);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="gmail-modal-backdrop" onClick={handleBackdropClick}>
      <div
        className="gmail-modal-content warranty-modal"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
      >
        <button className="gmail-modal-close" onClick={onClose} aria-label="Close modal">
          ×
        </button>
        {children}
      </div>
    </div>
  );
};

export default ModalWarranty;
