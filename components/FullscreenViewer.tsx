import React, { useRef, useEffect, useCallback } from 'react';
import { useImageZoom } from '../hooks/useImageZoom';
import { ZoomInIcon } from './icons/ZoomInIcon';
import { ZoomOutIcon } from './icons/ZoomOutIcon';
import { ResetZoomIcon } from './icons/ResetZoomIcon';

interface FullscreenViewerProps {
    imageUrl: string;
    onClose: () => void;
}

export const FullscreenViewer: React.FC<FullscreenViewerProps> = ({ imageUrl, onClose }) => {
    const containerRef = useRef<HTMLDivElement>(null);
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
    } = useImageZoom(containerRef, imageUrl, true);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
    }, [onClose]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in"
            onClick={onClose}
            onWheel={handleWheel}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
        >
            <style>
                {`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
                `}
            </style>
            <div 
                ref={containerRef}
                className="relative w-full h-full flex items-center justify-center"
                onClick={e => e.stopPropagation()} // Prevent closing modal when clicking inside image area
            >
                <img
                    src={imageUrl}
                    alt="Fullscreen view"
                    className={`max-w-[95vw] max-h-[95vh] object-contain transition-transform duration-100 ease-out ${imageCursorClass()}`}
                    style={{
                        transform: `scale(${transform.scale}) translate(${transform.x}px, ${transform.y}px)`,
                        transformOrigin: 'center center',
                        willChange: 'transform',
                    }}
                    onMouseDown={handleMouseDown}
                    draggable="false"
                />
            </div>

            {/* Controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-full p-2 flex items-center gap-1 z-20">
                <button onClick={() => handleZoom('out')} disabled={!canZoomOut} className="p-1.5 text-white rounded-full hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Zoom out">
                    <ZoomOutIcon className="w-6 h-6" />
                </button>
                <button onClick={handleReset} disabled={!canReset} className="p-1.5 text-white rounded-full hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Reset zoom">
                    <ResetZoomIcon className="w-6 h-6" />
                </button>
                <button onClick={() => handleZoom('in')} disabled={!canZoomIn} className="p-1.5 text-white rounded-full hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Zoom in">
                    <ZoomInIcon className="w-6 h-6" />
                </button>
            </div>
            
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white text-3xl font-bold p-2 leading-none hover:text-gray-300 z-20"
                aria-label="Close fullscreen view"
            >
                &times;
            </button>
        </div>
    );
};
