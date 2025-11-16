import { ReactNode } from 'react';
import BaseModal from '../modal/BaseModal';
import '../gmailConfigModal/GmailConfigModal.css';
import './ModalWarranty.css';

interface ModalProps {
  children: ReactNode;
  onClose: () => void;
  title?: ReactNode;
}

const ModalWarranty = ({ children, onClose, title }: ModalProps) => {
  return (
    <BaseModal
      isOpen
      onClose={onClose}
      title={title}
      backdropClassName="gmail-modal-backdrop"
      contentClassName="gmail-modal-content warranty-modal"
      bodyClassName="warranty-modal-body"
    >
      {children}
    </BaseModal>
  );
};

export default ModalWarranty;
