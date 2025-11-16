import FileImport from '../importFile/ImportFile';
import BaseModal from '../modal/BaseModal';
import '../gmailConfigModal/GmailConfigModal.css';
import './ImportOptionsModal.css';

interface ImportOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: () => void;
}

const ImportOptionsModal = ({ isOpen, onClose, onUploadSuccess }: ImportOptionsModalProps) => {
  const handleUploadSuccess = () => {
    onClose();
    onUploadSuccess?.();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      headerContent={
        <div className="import-options-header">
          <div className="import-options-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path
                d="M19 13v6h-4v-4H9v4H5v-6H3l9-9 9 9h-2zm2 7H3v2h18v-2z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div>
            <h2>Import warranties</h2>
            <p className="gmail-modal-description">
              Choose how you'd like to bring warranty documents into Warrify.
            </p>
          </div>
        </div>
      }
      backdropClassName="gmail-modal-backdrop"
      contentClassName="gmail-modal-content import-options-modal"
    >
      <div className="import-option-card">
        <h3>Upload manually</h3>
        <p>Upload PDF warranties from your device and we&apos;ll validate them.</p>
        <FileImport onUploadSuccess={handleUploadSuccess} />
      </div>
    </BaseModal>
  );
};

export default ImportOptionsModal;
