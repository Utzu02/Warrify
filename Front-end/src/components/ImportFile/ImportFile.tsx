import React, { useRef } from 'react';
import './ImportFile.css';
import { uploadWarrantyPdf } from '../../api/warranties';

const ImportManualButton: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      console.log('Selected PDF file:', selectedFile);

      try {
        await uploadWarrantyPdf(selectedFile);
        alert('File upload successful');
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('Upload failed. Please try again.');
      }
    } else {
      alert('Please select a valid PDF file.');
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click(); // Programmatically trigger the file input
  };

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
