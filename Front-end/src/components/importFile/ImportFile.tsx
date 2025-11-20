import React, { useRef, useState, useEffect } from 'react';
import './ImportFile.css';
import { uploadWarrantyPdf, validateWarrantyPdf } from '../../api/warranties';
import LoadingSpinner from '../loadingSpinner/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_FILE_SIZE_MB = 10;

type ValidationWarningState = {
  file: File;
  key?: string;
  confidence?: number;
  reason?: string;
  description: string;
  variant: 'warning' | 'error';
};

type UploadErrorState = {
  description: string;
  reason?: string;
};

type FileImportProps = {
  onUploadSuccess?: () => void;
  setImportHandler?: (handler: () => Promise<void>) => void;
  setHasSelectedFile?: (has: boolean) => void;
};

const FileImport: React.FC<FileImportProps> = ({ onUploadSuccess, setImportHandler, setHasSelectedFile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  // Store AI validation warnings so we can show a Gmail-style modal instead of native dialogs.
  const [validationWarning, setValidationWarning] = useState<ValidationWarningState | null>(null);
  const [uploadError, setUploadError] = useState<UploadErrorState | null>(null);
  const [previewReady, setPreviewReady] = useState<{ file: File; confidence?: number; key?: string } | null>(null);
  const uploadAfterValidationRef = React.useRef(false);
  const { showToast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setSelectedFile(null);
      setHasSelectedFile?.(false);
      setPreviewReady(null);
      uploadAfterValidationRef.current = false;
      return;
    }

  // Clear previous preview/warnings/errors when user selects a new file
  setValidationWarning(null);
  setPreviewReady(null);
  setUploadError(null);
  uploadAfterValidationRef.current = false;

    if (file.type !== 'application/pdf') {
      showToast({
        variant: 'warning',
        title: 'Invalid file',
        message: 'Please select a PDF warranty document.'
      });
      event.target.value = '';
      setSelectedFile(null);
      setHasSelectedFile?.(false);
      setPreviewReady(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      showToast({
        variant: 'warning',
        title: 'File too large',
        message: `Maximum allowed size is ${MAX_FILE_SIZE_MB}MB.`
      });
      event.target.value = '';
      setSelectedFile(null);
      setHasSelectedFile?.(false);
      setPreviewReady(null);
      return;
    }

    console.log('📄 File selected:', file.name, 'Size:', file.size, 'bytes');
    setSelectedFile(file);
    setHasSelectedFile?.(true);

    // Immediately validate the selected PDF (user requested validation on selection)
    (async () => {
      setIsValidating(true);
      try {
        console.log('🔍 Starting validation for (on select):', file.name);
        const result = await validateWarrantyPdf(file);
        // If the user already clicked Import while validation was in-flight,
        // proceed to upload immediately regardless of validation outcome.
        if (uploadAfterValidationRef.current) {
          uploadAfterValidationRef.current = false;
          await handleUpload(file);
          return;
        }
        console.log('✅ Validation result (on select):', result);

        if (result.isValid) {
          console.log(`✓ Valid warranty (${result.confidence}% confidence). Showing preview — awaiting final confirmation.`);
          // don't auto-upload. show preview and wait for user to confirm via Import button
          setPreviewReady({ file, confidence: result.confidence, key: `${file.name}:${file.size}:${file.lastModified}` });
          showToast({ variant: 'info', title: 'Ready to import', message: 'Validation passed. Confirm import to upload.' });
        } else {
          console.log(`⚠️ Invalid warranty (${result.confidence}% confidence)`);
          setPreviewReady(null);
          setValidationWarning({
            file,
            key: `${file.name}:${file.size}:${file.lastModified}`,
            confidence: result.confidence,
            reason: result.reason,
            description: `This file doesn't appear to be a warranty document.`,
            variant: 'warning'
          });
          showToast({
            variant: 'warning',
            title: 'Validation warning',
            message: result.reason || "This file doesn't appear to be a warranty document."
          });
        }
      } catch (error) {
        console.error('❌ Error during validation (on select):', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        setValidationWarning({
          file,
          key: `${file.name}:${file.size}:${file.lastModified}`,
          reason: message,
          description: 'We could not validate this file right now.',
          variant: 'error'
        });
        showToast({ variant: 'error', title: 'Validation failed', message });
      } finally {
        setIsValidating(false);
      }
    })();
  };

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true);
      console.log('Uploading file:', file.name);
      await uploadWarrantyPdf(file);
      setUploadError(null);
      showToast({
        variant: 'success',
        title: 'Upload complete',
        message: 'File uploaded successfully!'
      });
      onUploadSuccess?.();
      // clear any preview/selection after a successful upload
      setPreviewReady(null);
      setSelectedFile(null);
      setHasSelectedFile?.(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Error uploading file:', error);
      const message = error instanceof Error ? error.message : String(error);
      if (message === 'PLAN_LIMIT_REACHED') {
        // Specific user-friendly handling when server refuses due to plan limit
        setUploadError({ description: 'You reached your plan warranty limit.', reason: 'PLAN_LIMIT_REACHED' });
        showToast({
          variant: 'error',
          title: 'Plan limit reached',
          message: 'You have reached the number of warranties allowed by your plan. Visit the Pricing page to upgrade.',
        });
      } else {
        setUploadError({
          description: 'Upload failed. Please try again.',
          reason: message
        });
        showToast({
          variant: 'error',
          title: 'Upload failed',
          message: message || 'Unexpected error during upload.'
        });
      }
    } finally {
      setIsUploading(false);
    }
  };

  const validateAndUpload = async () => {
    if (!selectedFile) {
      showToast({ variant: 'warning', title: 'No file', message: 'Please select a PDF file to import.' });
      return;
    }
    // If a validation is currently running, mark that we want to upload immediately
    // after validation finishes and do not re-run validation here.
    if (isValidating) {
      uploadAfterValidationRef.current = true;
      return;
    }
    // If there's an active validation warning for the same file (by key), treat Import as "upload anyway"
    const selectedKey = selectedFile ? `${selectedFile.name}:${selectedFile.size}:${selectedFile.lastModified}` : null;
    if (validationWarning && validationWarning.key && selectedKey && validationWarning.key === selectedKey) {
      // upload despite the warning
      await handleUpload(selectedFile);
      setValidationWarning(null);
      setSelectedFile(null);
      setHasSelectedFile?.(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // If we already have a preview for this same file (by key) we can skip re-validation and upload directly
    if (previewReady && previewReady.key && selectedKey && previewReady.key === selectedKey) {
      await handleUpload(selectedFile);
      // clear preview/selection after upload
      setPreviewReady(null);
      setSelectedFile(null);
      setHasSelectedFile?.(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Otherwise run validation first
    setIsValidating(true);
    try {
      console.log('🔍 Starting validation for:', selectedFile.name);
      const result = await validateWarrantyPdf(selectedFile);
      console.log('✅ Validation result:', result);

      if (result.isValid) {
        console.log(`✓ Valid warranty (${result.confidence}% confidence). Uploading...`);
        await handleUpload(selectedFile);
        // reset selected file
        setSelectedFile(null);
        setHasSelectedFile?.(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        console.log(`⚠️ Invalid warranty (${result.confidence}% confidence)`);
        setValidationWarning({
          file: selectedFile,
          key: `${selectedFile.name}:${selectedFile.size}:${selectedFile.lastModified}`,
          confidence: result.confidence,
          reason: result.reason,
          description: `This file doesn't appear to be a warranty document.`,
          variant: 'warning'
        });
        showToast({
          variant: 'warning',
          title: 'Validation warning',
          message: result.reason || "This file doesn't appear to be a warranty document."
        });
      }
    } catch (error) {
      console.error('❌ Error during validation:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      setValidationWarning({
        file: selectedFile!,
        key: `${selectedFile!.name}:${selectedFile!.size}:${selectedFile!.lastModified}`,
        reason: message,
        description: 'We could not validate this file right now.',
        variant: 'error'
      });
      showToast({ variant: 'error', title: 'Validation failed', message });
    } finally {
      setIsValidating(false);
    }
  };

  // Expose the import handler to parent and inform parent when a file is selected
  useEffect(() => {
    if (setImportHandler) setImportHandler(validateAndUpload);
    setHasSelectedFile?.(!!selectedFile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFile, setImportHandler]);

  const isProcessing = isValidating || isUploading;
  const statusMessage = isValidating ? 'Validating warranty...' : isUploading ? 'Uploading warranty...' : null;

  if (isProcessing) {
    return (
      <div className="import-manual-container">
        <LoadingSpinner message={statusMessage || ''} size="small" />
      </div>
    );
  }

  return (
    <div className="import-file-container">
      <label htmlFor="file-upload" className="file-label">Select warranty PDF</label>
      <input
        type="file"
        id="file-upload"
        className="file-input-visible"
        onChange={handleFileChange}
        accept="application/pdf"
        ref={fileInputRef}
      />
      <div className="file-row">
        <span className="file-selected-name">{selectedFile ? selectedFile.name : 'No file chosen'}</span>
        <span className="file-hint">PDF only • Max {MAX_FILE_SIZE_MB}MB</span>
      </div>
      {previewReady && (
        <div className="import-preview-card">
          <div className="import-preview-header">Preview</div>
          <p>This file looks like a warranty document.</p>
          {typeof previewReady.confidence === 'number' && (
            <p className="import-feedback-detail">Confidence: {previewReady.confidence}%</p>
          )}
          <p className="import-feedback-note">Click Import to confirm and upload.</p>
        </div>
      )}
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
              <div className="import-feedback-note">If you still want to upload this file, click <strong>Import</strong> (bottom-right) to upload anyway.</div>
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

export default FileImport;
