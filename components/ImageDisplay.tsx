import React, { useState, useRef, useEffect, WheelEvent, MouseEvent } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { DownloadIcon } from './icons/DownloadIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { ZoomInIcon } from './icons/ZoomInIcon';
import { ZoomOutIcon } from './icons/ZoomOutIcon';
import { ResetZoomIcon } from './icons/ResetZoomIcon';

interface ImageDisplayProps {
  title: string;
  imageUrl: string | null;
  isLoading?: boolean;
  loadingMessage?: string;
  retryMessage?: string | null;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ title, imageUrl, isLoading = false, loadingMessage, retryMessage }) => {
  const isEdited = title.toLowerCase() === 'edited' || title.toLowerCase() === 'result';
  
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);

  const ZOOM_SENSITIVITY = 0.1;
  const MIN_ZOOM = 1;
  const MAX_ZOOM = 8;

  const handleReset = () => {
    setTransform({ scale: 1, x: 0, y: 0 });
  };
  
  // Reset zoom when image URL changes
  useEffect(() => {
    handleReset();
  }, [imageUrl]);

  const handleZoom = (direction: 'in' | 'out', factor: number = ZOOM_SENSITIVITY * 2) => {
    setTransform(prev => {
        const newScale = direction === 'in' 
            ? Math.min(prev.scale + factor, MAX_ZOOM) 
            : Math.max(prev.scale - factor, MIN_ZOOM);
        
        if (newScale <= MIN_ZOOM) {
            return { scale: 1, x: 0, y: 0 }; // Reset position when zoomed out completely
        }
        return { ...prev, scale: newScale };
    });
  };

  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    if (!isEdited || !imageUrl || isLoading) return;
    e.preventDefault();
    const direction = e.deltaY < 0 ? 'in' : 'out';
    handleZoom(direction, ZOOM_SENSITIVITY);
  };
  
  const handleMouseDown = (e: MouseEvent<HTMLImageElement>) => {
    if (transform.scale <= 1 || !isEdited || isLoading) return;
    e.preventDefault();
    setIsPanning(true);
    setStartPan({
      x: e.clientX - transform.x,
      y: e.clientY - transform.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isPanning) return;
    e.preventDefault();
    setTransform(prev => ({
      ...prev,
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y,
    }));
  };
  
  const handleMouseUp = () => {
    setIsPanning(false);
  };
  
  const handleMouseLeave = () => {
    setIsPanning(false);
  };
  
  const imageCursorClass = () => {
    if (!isEdited || isLoading) return 'cursor-default';
    if (transform.scale > 1) {
      return isPanning ? 'cursor-grabbing' : 'cursor-grab';
    }
    return 'cursor-default';
  }

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
      <div 
        ref={containerRef}
        onWheel={handleWheel}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
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
            {isEdited && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-full p-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                <button 
                  onClick={() => handleZoom('out')} 
                  disabled={transform.scale <= MIN_ZOOM}
                  className="p-1.5 text-white rounded-full hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Zoom out"
                >
                  <ZoomOutIcon className="w-6 h-6" />
                </button>
                <button 
                  onClick={handleReset} 
                  disabled={transform.scale === 1 && transform.x === 0 && transform.y === 0}
                  className="p-1.5 text-white rounded-full hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Reset zoom"
                >
                  <ResetZoomIcon className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => handleZoom('in')}
                  disabled={transform.scale >= MAX_ZOOM}
                  className="p-1.5 text-white rounded-full hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Zoom in"
                >
                  <ZoomInIcon className="w-6 h-6" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center text-center text-dark-text">
            <PhotoIcon className="w-16 h-16" />
            <p className="mt-2 text-lg font-medium">{isEdited ? "Your enhanced image will now appear here" : "Placeholder"}</p>
          </div>
        )}
      </div>
    </div>
  );
};