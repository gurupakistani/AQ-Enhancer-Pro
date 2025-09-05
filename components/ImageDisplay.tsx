import React, { useRef } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { DownloadIcon } from './icons/DownloadIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { ZoomInIcon } from './icons/ZoomInIcon';
import { ZoomOutIcon } from './icons/ZoomOutIcon';
import { ResetZoomIcon } from './icons/ResetZoomIcon';
import { ExpandIcon } from './icons/ExpandIcon';
import { useImageZoom } from '../hooks/useImageZoom';

interface ImageDisplayProps {
  title: string;
  imageUrl: string | null;
  isLoading?: boolean;
  loadingMessage?: string;
  retryMessage?: string | null;
  onFullscreen?: (imageUrl: string) => void;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ title, imageUrl, isLoading = false, loadingMessage, retryMessage, onFullscreen }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDownloadable = (title.toLowerCase() === 'edited' || title.toLowerCase() === 'result') && imageUrl && !isLoading;

  const {
    transform,
    handleReset,
    handleZoom,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUpOrLeave,
    imageCursorClass,
    canZoomIn,
    canZoomOut,
    canReset,
  } = useImageZoom(containerRef, imageUrl, !isLoading && !!imageUrl);

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-light-text">{title}</h3>
        {isDownloadable && (
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
      <div 
        ref={containerRef}
        onWheel={handleWheel}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className="relative group w-full aspect-square bg-dark-card rounded-2xl overflow-hidden border border-dark-border flex items-center justify-center"
      >
        {isLoading ? (
          <div className="flex flex-col items-center text-center text-medium-text">
            <LoadingSpinner />
            <p className="mt-4 text-lg font-medium">{loadingMessage || 'Processing...'}</p>
            {retryMessage && <p className="mt-2 text-sm text-yellow-400">{retryMessage}</p>}
          </div>
        ) : imageUrl ? (
          <>
            <img 
              src={imageUrl} 
              alt={title} 
              className={`w-full h-full object-contain transition-transform duration-100 ease-out ${imageCursorClass()}`} 
              style={{ 
                transform: `scale(${transform.scale}) translate(${transform.x}px, ${transform.y}px)`,
                transformOrigin: 'center center',
                willChange: 'transform',
              }}
              onMouseDown={handleMouseDown}
              draggable="false"
            />
            {imageUrl && !isLoading && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-full p-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                <button 
                  onClick={() => handleZoom('out')} 
                  disabled={!canZoomOut}
                  className="p-1.5 text-white rounded-full hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Zoom out"
                >
                  <ZoomOutIcon className="w-6 h-6" />
                </button>
                <button 
                  onClick={handleReset} 
                  disabled={!canReset}
                  className="p-1.5 text-white rounded-full hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Reset zoom"
                >
                  <ResetZoomIcon className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => handleZoom('in')}
                  disabled={!canZoomIn}
                  className="p-1.5 text-white rounded-full hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Zoom in"
                >
                  <ZoomInIcon className="w-6 h-6" />
                </button>
                {onFullscreen && (
                   <button 
                      onClick={() => onFullscreen(imageUrl)}
                      className="p-1.5 text-white rounded-full hover:bg-white/20"
                      aria-label="View fullscreen"
                    >
                      <ExpandIcon className="w-6 h-6" />
                    </button>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center text-center text-dark-text">
            <PhotoIcon className="w-16 h-16" />
            <p className="mt-2 text-lg font-medium">{isDownloadable ? "Your enhanced image will now appear here" : "Placeholder"}</p>
          </div>
        )}
      </div>
    </div>
  );
};