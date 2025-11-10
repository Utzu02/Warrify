import React, { useRef, useState } from 'react';
import './ImportFile.css';
import { uploadWarrantyPdf } from '../../api/warranties';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

const ImportManualButton: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      console.log('Selected PDF file:', selectedFile);

      try {
        setIsUploading(true);
        await uploadWarrantyPdf(selectedFile);
        alert('File upload successful');
        window.location.reload();
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('Upload failed. Please try again.');
      } finally {
        setIsUploading(false);
      }
    } else {
      alert('Please select a valid PDF file.');
    }
  };

  const handleButtonClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  if (isUploading) {
    return (
      <div className="import-manual-container">
        <LoadingSpinner message="Uploading warranty..." size="small" />
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
