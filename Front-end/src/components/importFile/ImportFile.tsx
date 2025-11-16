import React, { useRef, useState } from 'react';
import './ImportFile.css';
import { uploadWarrantyPdf, validateWarrantyPdf } from '../../api/warranties';
import LoadingSpinner from '../loadingSpinner/LoadingSpinner';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_FILE_SIZE_MB = 10;

type ValidationWarningState = {
  file: File;
  confidence?: number;
  reason?: string;
  description: string;
  variant: 'warning' | 'error';
};

type UploadErrorState = {
  description: string;
  reason?: string;
};

type ImportManualButtonProps = {
  onUploadSuccess?: () => void;
};

const ImportManualButton: React.FC<ImportManualButtonProps> = ({ onUploadSuccess }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  // Store AI validation warnings so we can show a Gmail-style modal instead of native dialogs.
  const [validationWarning, setValidationWarning] = useState<ValidationWarningState | null>(null);
  const [uploadError, setUploadError] = useState<UploadErrorState | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please select a valid PDF file.');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      alert(`File is too large. Maximum allowed size is ${MAX_FILE_SIZE_MB}MB.`);
      event.target.value = '';
      return;
    }

    console.log('📄 File selected:', file.name, 'Size:', file.size, 'bytes');

    // Show immediate feedback
    setIsValidating(true);

    // Validate the PDF first
    try {
      console.log('🔍 Starting validation for:', file.name);
      const result = await validateWarrantyPdf(file);
      console.log('✅ Validation result:', result);

      if (result.isValid) {
        console.log(`✓ Valid warranty (${result.confidence}% confidence). Auto-uploading...`);
        // Automatically upload if validation passes
        await handleUpload(file);
      } else {
        console.log(`⚠️ Invalid warranty (${result.confidence}% confidence)`);
        setValidationWarning({
          file,
          confidence: result.confidence,
          reason: result.reason,
          description: `This file doesn't appear to be a warranty document.`,
          variant: 'warning'
        });
      }
    } catch (error) {
      console.error('❌ Error during validation:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      setValidationWarning({
        file,
        reason: message,
        description: 'We could not validate this file right now.',
        variant: 'error'
      });
    } finally {
      setIsValidating(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true);
      console.log('Uploading file:', file.name);
      await uploadWarrantyPdf(file);
      setUploadError(null);
      onUploadSuccess?.();
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadError({
        description: 'Upload failed. Please try again.',
        reason: error instanceof Error ? error.message : undefined
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleButtonClick = () => {
    if (!isValidating && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const isProcessing = isValidating || isUploading;
  const statusMessage = isValidating 
    ? 'Validating warranty...' 
    : isUploading 
    ? 'Uploading warranty...' 
    : null;

  if (isProcessing) {
    return (
      <div className="import-manual-container">
        <LoadingSpinner message={statusMessage || ''} size="small" />
      </div>
    );
  }

  return (
    <div className="import-manual-container">
      <input
        type="file"
        id="file-upload"
        className="file-input"
        onChange={handleFileChange}
        accept="application/pdf"
        ref={fileInputRef}
      />
      <button className="import-manual-button" onClick={handleButtonClick}>
        Import manual
      </button>
      <span className="file-hint">PDF only • Max {MAX_FILE_SIZE_MB}MB</span>
      {(validationWarning || uploadError) && (
        <div className="import-feedback">
          {validationWarning && (
            <div className={`import-feedback-card ${validationWarning.variant}`}>
              <div className="import-feedback-header">
                <div className="import-feedback-title">Validation Warning</div>
                <button
                  className="import-feedback-close"
                  onClick={() => setValidationWarning(null)}
                  aria-label="Dismiss warning"
                >
                  ×
                </button>
              </div>
              <p>{validationWarning.description}</p>
              {typeof validationWarning.confidence === 'number' && (
                <p className="import-feedback-detail">Confidence: {validationWarning.confidence}%</p>
              )}
              {validationWarning.reason && (
                <p className="import-feedback-detail">Reason: {validationWarning.reason}</p>
              )}
              <p className="import-feedback-question">Do you want to upload it anyway?</p>
              <div className="import-feedback-actions">
                <button
                  className="import-feedback-btn secondary"
                  onClick={() => setValidationWarning(null)}
                >
                  Cancel
                </button>
                <button
                  className="import-feedback-btn primary"
                  onClick={async () => {
                    if (!validationWarning) return;
                    const fileToUpload = validationWarning.file;
                    setValidationWarning(null);
                    await handleUpload(fileToUpload);
                  }}
                >
                  Upload anyway
                </button>
              </div>
            </div>
          )}

          {uploadError && (
            <div className="import-feedback-card error">
              <div className="import-feedback-header">
                <div className="import-feedback-title">Upload failed</div>
              </div>
              <p>{uploadError.description}</p>
              {uploadError.reason && (
                <p className="import-feedback-detail">{uploadError.reason}</p>
              )}
              <div className="import-feedback-actions single">
                <button
                  className="import-feedback-btn primary"
                  onClick={() => setUploadError(null)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImportManualButton;
