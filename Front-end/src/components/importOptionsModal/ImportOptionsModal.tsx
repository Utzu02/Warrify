import { useRef } from 'react';
import useModalFocusTrap from '../../hooks/useModalFocusTrap';
import FileImport from '../importFile/ImportFile';
import '../gmailConfigModal/GmailConfigModal.css';
import './ImportOptionsModal.css';

interface ImportOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: () => void;
}

const ImportOptionsModal = ({ isOpen, onClose, onUploadSuccess }: ImportOptionsModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useModalFocusTrap(isOpen, onClose, modalRef);

  if (!isOpen) return null;

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleUploadSuccess = () => {
    onClose();
    onUploadSuccess?.();
  };

  return (
    <div className="gmail-modal-backdrop" onClick={handleBackdropClick}>
      <div
        className="gmail-modal-content import-options-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-options-title"
        aria-describedby="import-options-description"
        ref={modalRef}
      >
        <button className="gmail-modal-close" onClick={onClose} aria-label="Close modal">
          ×
        </button>

        <div className="import-options-header">
          <div>
            <h2 id="import-options-title">Import warranties</h2>
            <p id="import-options-description" className="gmail-modal-description">
              Choose how you'd like to bring warranty documents into Warrify.
            </p>
          </div>
        </div>

        <div className="import-option-card">
          <h3>Upload manually</h3>
          <p>Upload PDF warranties from your device and we&apos;ll validate them.</p>
          <FileImport onUploadSuccess={handleUploadSuccess} />
        </div>
      </div>
    </div>
  );
};

export default ImportOptionsModal;
