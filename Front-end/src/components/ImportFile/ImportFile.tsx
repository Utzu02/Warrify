import React, { useRef, useState } from 'react';
import './ImportFile.css';
import { uploadWarrantyPdf, validateWarrantyPdf } from '../../api/warranties';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

const ImportManualButton: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please select a valid PDF file.');
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
        // Show validation failure message
        const shouldContinue = window.confirm(
          `⚠️ Validation Warning\n\n` +
          `This file doesn't appear to be a warranty document.\n` +
          `Confidence: ${result.confidence}%\n` +
          `Reason: ${result.reason}\n\n` +
          `Do you want to upload it anyway?`
        );

        if (shouldContinue) {
          console.log('User chose to upload anyway');
          await handleUpload(file);
        } else {
          console.log('User cancelled upload');
        }
      }
    } catch (error) {
      console.error('❌ Error during validation:', error);
      const shouldContinue = window.confirm(
        `Failed to validate the PDF: ${error instanceof Error ? error.message : 'Unknown error'}\n\n` +
        `Do you want to upload it anyway?`
      );
      if (shouldContinue) {
        await handleUpload(file);
      }
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
      alert('✅ File uploaded successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('❌ Upload failed. Please try again.');
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
    </div>
  );
};

export default ImportManualButton;
