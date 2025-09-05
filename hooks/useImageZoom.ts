import { useState, useEffect, useCallback, RefObject, WheelEvent, MouseEvent } from 'react';

const ZOOM_SENSITIVITY = 0.1;
const MIN_ZOOM = 1;
const MAX_ZOOM = 8;

interface Transform {
  scale: number;
  x: number;
  y: number;
}

export const useImageZoom = (
  containerRef: RefObject<HTMLDivElement>,
  imageUrl: string | null,
  isEnabled: boolean = true
) => {
  const [transform, setTransform] = useState<Transform>({ scale: 1, x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  const handleReset = useCallback(() => {
    setTransform({ scale: 1, x: 0, y: 0 });
  }, []);

  useEffect(() => {
    handleReset();
  }, [imageUrl, handleReset]);

  const handleZoom = useCallback((direction: 'in' | 'out', factor: number = ZOOM_SENSITIVITY * 2) => {
    if (!isEnabled) return;
    setTransform(prev => {
        const newScale = direction === 'in' 
            ? Math.min(prev.scale + factor, MAX_ZOOM) 
            : Math.max(prev.scale - factor, MIN_ZOOM);
        
        if (newScale <= MIN_ZOOM) {
            return { scale: 1, x: 0, y: 0 };
        }

        return { ...prev, scale: newScale };
    });
  }, [isEnabled]);

  const handleWheel = useCallback((e: WheelEvent<HTMLDivElement>) => {
    if (!isEnabled || !imageUrl) return;
    e.preventDefault();
    const direction = e.deltaY < 0 ? 'in' : 'out';
    handleZoom(direction, ZOOM_SENSITIVITY);
  }, [isEnabled, imageUrl, handleZoom]);
  
  const handleMouseDown = useCallback((e: MouseEvent<HTMLImageElement>) => {
    if (transform.scale <= 1 || !isEnabled || !imageUrl) return;
    e.preventDefault();
    setIsPanning(true);
    setStartPan({
      x: e.clientX - transform.x,
      y: e.clientY - transform.y,
    });
  }, [transform.scale, isEnabled, imageUrl, transform.x, transform.y]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isPanning || !isEnabled) return;
    e.preventDefault();
    setTransform(prev => ({
      ...prev,
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y,
    }));
  }, [isPanning, isEnabled, startPan.x, startPan.y]);
  
  const handleMouseUpOrLeave = useCallback(() => {
    setIsPanning(false);
  }, []);

  const imageCursorClass = useCallback(() => {
    if (!isEnabled || !imageUrl) return 'cursor-default';
    if (transform.scale > 1) {
      return isPanning ? 'cursor-grabbing' : 'cursor-grab';
    }
    return 'cursor-default';
  }, [isEnabled, imageUrl, transform.scale, isPanning]);

  return {
    transform,
    handleReset,
    handleZoom,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUpOrLeave,
    imageCursorClass,
    canZoomIn: isEnabled && transform.scale < MAX_ZOOM,
    canZoomOut: isEnabled && transform.scale > MIN_ZOOM,
    canReset: isEnabled && (transform.scale !== 1 || transform.x !== 0 || transform.y !== 0),
  };
};