import FileImport from '../importFile/ImportFile';
import BaseModal from '../modal/BaseModal';
import '../gmailConfigModal/GmailConfigModal.css';
import './ImportOptionsModal.css';
import { useRef, useState, useEffect } from 'react';
import useSubscriptionLimits from '../../hooks/useSubscriptionLimits';
import { useToast } from '../../contexts/ToastContext';

interface ImportOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: () => void;
}

const ImportOptionsModal = ({ isOpen, onClose, onUploadSuccess }: ImportOptionsModalProps) => {
  const importHandlerRef = useRef<(() => Promise<void>) | null>(null);
  const [hasSelectedFile, setHasSelectedFile] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleUploadSuccess = () => {
    onClose();
    onUploadSuccess?.();
  };

  const { maxWarranties, currentWarranties, loading: limitsLoading } = useSubscriptionLimits();
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen && !limitsLoading && typeof maxWarranties === 'number' && currentWarranties >= maxWarranties) {
      showToast({
        variant: 'error',
        title: 'Plan limit reached',
        message: `You have reached your plan limit of ${maxWarranties} warranties. Upgrade on the Pricing page to add more.`
      });
    }
    // only when modal opens or limits change
  }, [isOpen, limitsLoading, maxWarranties, currentWarranties, showToast]);

  const primaryAction = {
    label: 'Import',
    onClick: async () => {
      if (!importHandlerRef.current) return;
      try {
        setIsImporting(true);
        await importHandlerRef.current();
      } finally {
        setIsImporting(false);
      }
    },
    variant: 'primary' as const,
    loading: isImporting,
    disabled: !hasSelectedFile || isImporting || (typeof maxWarranties === 'number' && currentWarranties >= maxWarranties)
  };

  const secondaryAction = {
    label: 'Cancel',
    onClick: onClose,
    variant: 'ghost' as const
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
            {!limitsLoading && typeof maxWarranties === 'number' && currentWarranties >= maxWarranties && (
              <p style={{ color: '#b91c1c', marginTop: 8 }}>
                You have reached your plan limit of {maxWarranties} warranties. Upgrade on the Pricing page to add more.
              </p>
            )}
          </div>
        </div>
      }
      backdropClassName="gmail-modal-backdrop"
      contentClassName="gmail-modal-content import-options-modal"
      primaryAction={primaryAction}
      secondaryAction={secondaryAction}
    >
      <FileImport
        onUploadSuccess={handleUploadSuccess}
        setImportHandler={(h) => { importHandlerRef.current = h; }}
        setHasSelectedFile={setHasSelectedFile}
      />
    </BaseModal>
  );
};

export default ImportOptionsModal;
