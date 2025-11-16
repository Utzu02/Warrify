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
          <div>
            <h2>Import warranties</h2>
        <p className='gmail-modal-description'>Upload PDF warranties from your device and we&apos;ll validate them.</p>
          </div>
        </div>
      }
      backdropClassName="gmail-modal-backdrop"
      contentClassName="gmail-modal-content import-options-modal"
    >
        <FileImport onUploadSuccess={handleUploadSuccess} />
    </BaseModal>
  );
};

export default ImportOptionsModal;
