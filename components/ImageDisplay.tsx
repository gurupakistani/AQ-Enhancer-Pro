import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { DownloadIcon } from './icons/DownloadIcon';
import { PhotoIcon } from './icons/PhotoIcon';

interface ImageDisplayProps {
  title: string;
  imageUrl: string | null;
  isLoading?: boolean;
  loadingMessage?: string;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = React.memo(({ title, imageUrl, isLoading = false, loadingMessage }) => {
  const isEdited = title.toLowerCase() === 'edited';

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-light-text">{title}</h3>
        {isEdited && imageUrl && !isLoading && (
          <a
            href={imageUrl}
            download={`edited-image-${Date.now()}.png`}
            className="flex items-center px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg focus:ring-brand-primary transition-colors duration-200"
          >
            <DownloadIcon className="w-5 h-5 mr-2" />
            Download
          </a>
        )}
      </div>
      <div className="relative w-full aspect-square bg-dark-card rounded-2xl overflow-hidden border border-dark-border flex items-center justify-center">
        {isLoading ? (
          <div className="flex flex-col items-center text-center text-medium-text">
            <LoadingSpinner />
            <p className="mt-4 text-lg font-medium">{loadingMessage || 'Processing...'}</p>
          </div>
        ) : imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-contain" />
        ) : (
          <div className="flex flex-col items-center text-center text-dark-text">
            <PhotoIcon className="w-16 h-16" />
            <p className="mt-2 text-lg font-medium">{isEdited ? "Your enhanced image will now appear here" : "Placeholder"}</p>
          </div>
        )}
      </div>
    </div>
  );
});
