import React, { useState, useCallback } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface ImageUploaderProps {
  onImageUpload: (files: FileList) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = React.memo(({ onImageUpload }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImageUpload(e.target.files);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
       const allImages = Array.from(e.dataTransfer.files).every(file => file.type.startsWith('image/'));
      if (allImages) {
        onImageUpload(e.dataTransfer.files);
      }
    }
  }, [onImageUpload]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const dragDropClasses = isDragging ? 'border-brand-primary bg-brand-primary/10' : 'border-dark-border hover:border-brand-primary';

  return (
    <div className="bg-dark-card p-8 rounded-2xl shadow-lg border border-dark-border text-center">
      <h2 className="text-2xl font-semibold mb-2 text-light-text">Upload Your Image(s)</h2>
      <p className="text-medium-text mb-6">Drag & drop file(s) or click to select. Edit one or multiple images at once.</p>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300 ${dragDropClasses}`}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <UploadIcon className="w-10 h-10 mb-4 text-dark-text" />
          <p className="mb-2 text-sm text-dark-text"><span className="font-semibold">Click to upload</span> or drag and drop</p>
          <p className="text-xs text-dark-text">PNG, JPG, WEBP (MAX. 10MB)</p>
        </div>
        <input 
          id="dropzone-file" 
          type="file" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/webp"
          multiple
        />
      </div>
    </div>
  );
});
