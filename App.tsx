import React, { useState, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { EditorPanel } from './components/EditorPanel';
import { BatchEditorPanel } from './components/BatchEditorPanel';
import { editImage } from './services/geminiService';
import { EditEffect, HistoryState, BatchImage, HistoryEffect } from './types';
import { EDIT_EFFECTS, ASPECT_RATIO_EFFECTS } from './constants';
import { createThumbnail } from './utils/imageUtils';

const App: React.FC = () => {
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [batchImages, setBatchImages] = useState<BatchImage[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState<number>(-1);
  const [originalImageMime, setOriginalImageMime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isCancelledRef = useRef(false);

  const handleClear = useCallback(() => {
    setHistory([]);
    setBatchImages([]);
    setCurrentHistoryIndex(-1);
    setOriginalImageMime(null);
    setError(null);
    setIsLoading(false);
    isCancelledRef.current = false;
  }, []);

  const handleImageUpload = useCallback((files: FileList) => {
    handleClear();

    if (files.length > 1) {
      const newImages: Omit<BatchImage, 'id'>[] = [];
      const filePromises = Array.from(files).map(file => {
        return new Promise<void>(resolve => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            newImages.push({
              originalURL: result,
              editedURL: null,
              mimeType: file.type,
              base64: result.split(',')[1],
              isLoading: false,
              error: null,
            });
            resolve();
          };
          reader.readAsDataURL(file);
        });
      });
      Promise.all(filePromises).then(() => {
        setBatchImages(newImages.map((img, index) => ({ ...img, id: `${Date.now()}-${index}` })));
      });
    } else if (files.length === 1) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = async () => {
        const image = reader.result as string;
        const thumbnail = await createThumbnail(image);
        const initialState: HistoryState = { 
          image, 
          thumbnail,
          effectType: null 
        };
        setHistory([initialState]);
        setCurrentHistoryIndex(0);
        setOriginalImageMime(file.type);
        setError(null);
      };
      reader.onerror = () => {
        setError("Failed to read the image file. Please try again.");
      };
      reader.readAsDataURL(file);
    }
  }, [handleClear]);
  
  const handleStopProcessing = useCallback(() => {
    isCancelledRef.current = true;
    setIsLoading(false);
    if(batchImages.length > 0) {
      setBatchImages(prev => prev.map(img => ({ ...img, isLoading: false })));
    }
  }, [batchImages.length]);

  const applySingleEdit = useCallback(async (prompt: string, effectType: HistoryEffect) => {
    const currentImageState = history[currentHistoryIndex];
    if (!currentImageState || !originalImageMime) {
      setError("An image must be loaded to apply an effect.");
      return;
    }

    isCancelledRef.current = false;
    setIsLoading(true);
    setError(null);

    try {
      const base64Data = currentImageState.image.split(',')[1];
      const resultBase64 = await editImage(base64Data, originalImageMime, prompt);
      
      if (isCancelledRef.current) return;

      const newImageURL = `data:${originalImageMime};base64,${resultBase64}`;
      const newThumbnail = await createThumbnail(newImageURL);
      const newHistoryState: HistoryState = { 
        image: newImageURL,
        thumbnail: newThumbnail,
        effectType 
      };
      
      const newHistory = history.slice(0, currentHistoryIndex + 1);
      newHistory.push(newHistoryState);
      
      setHistory(newHistory);
      setCurrentHistoryIndex(newHistory.length - 1);

    } catch (err) {
      if (isCancelledRef.current) return;
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during image processing.";
      setError(`Error: ${errorMessage}. Please try again.`);
      console.error(err);
    } finally {
      if (!isCancelledRef.current) {
        setIsLoading(false);
      }
    }
  }, [history, currentHistoryIndex, originalImageMime]);

  const applyBatchEdit = useCallback(async (prompt: string) => {
    isCancelledRef.current = false;
    setIsLoading(true);
    setError(null);
    setBatchImages(prev => prev.map(img => ({ ...img, isLoading: true, error: null })));

    const CONCURRENCY_LIMIT = 1; // Process one by one to avoid rate limiting
    const imagesToProcess = [...batchImages];
    
    for (let i = 0; i < imagesToProcess.length; i += CONCURRENCY_LIMIT) {
        if (isCancelledRef.current) break;
        
        const chunk = imagesToProcess.slice(i, i + CONCURRENCY_LIMIT);
        
        const editPromises = chunk.map(image => 
            editImage(image.base64, image.mimeType, prompt)
                .then(resultBase64 => ({ id: image.id, result: `data:${image.mimeType};base64,${resultBase64}`, status: 'fulfilled' as const }))
                .catch(error => ({ id: image.id, reason: error.message, status: 'rejected' as const }))
        );

        const results = await Promise.all(editPromises);
        
        if (isCancelledRef.current) break;

        setBatchImages(prev => prev.map(image => {
            const result = results.find(r => r.id === image.id);
            if (result && result.status === 'fulfilled') {
                return { ...image, editedURL: result.result, isLoading: false };
            }
            if (result && result.status === 'rejected') {
                return { ...image, error: result.reason, isLoading: false };
            }
            return image;
        }));
    }
    
    setIsLoading(false);
    if(isCancelledRef.current) {
      setBatchImages(prev => prev.map(img => ({ ...img, isLoading: false })));
    }

  }, [batchImages]);

  const handlePresetEffect = useCallback((effect: EditEffect) => {
    if (batchImages.length > 0) {
      applyBatchEdit(effect.prompt);
    } else {
      applySingleEdit(effect.prompt, effect.type);
    }
  }, [batchImages.length, applyBatchEdit, applySingleEdit]);
  
  const handleChatSubmit = useCallback((prompt: string) => {
    if (batchImages.length > 0) {
      applyBatchEdit(prompt);
    } else {
      applySingleEdit(prompt, 'CHAT');
    }
  }, [batchImages.length, applyBatchEdit, applySingleEdit]);

  const handleUndo = useCallback(() => {
    setCurrentHistoryIndex(prev => Math.max(0, prev - 1));
  }, []);

  const handleRedo = useCallback(() => {
    setCurrentHistoryIndex(prev => Math.min(history.length - 1, prev + 1));
  }, [history.length]);
  
  const handleHistorySelect = useCallback((index: number) => {
    setCurrentHistoryIndex(index);
  }, []);

  const originalImage = history.length > 0 ? history[0].image : null;
  const editedImage = currentHistoryIndex > 0 ? history[currentHistoryIndex].image : null;
  const activeEffect = history[currentHistoryIndex]?.effectType;
  const canUndo = currentHistoryIndex > 0;
  const canRedo = currentHistoryIndex < history.length - 1;
  const hasImages = history.length > 0 || batchImages.length > 0;
  const isBatchMode = batchImages.length > 0;
  const globalLoading = isLoading || (isBatchMode && batchImages.some(img => img.isLoading));

  return (
    <div className="min-h-screen bg-dark-bg text-light-text font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {!hasImages ? (
          <div className="max-w-2xl mx-auto">
            <ImageUploader onImageUpload={handleImageUpload} />
          </div>
        ) : isBatchMode ? (
          <BatchEditorPanel
            images={batchImages}
            onEdit={handlePresetEffect}
            onChatSubmit={handleChatSubmit}
            onClear={handleClear}
            effects={EDIT_EFFECTS}
            aspectRatioEffects={ASPECT_RATIO_EFFECTS}
            isLoading={globalLoading}
            onStop={handleStopProcessing}
          />
        ) : (
          <EditorPanel
            originalImage={originalImage!}
            editedImage={editedImage}
            isLoading={isLoading}
            onEdit={handlePresetEffect}
            onClear={handleClear}
            effects={EDIT_EFFECTS}
            aspectRatioEffects={ASPECT_RATIO_EFFECTS}
            activeEffect={activeEffect}
            onChatSubmit={handleChatSubmit}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={canUndo}
            canRedo={canRedo}
            history={history}
            currentHistoryIndex={currentHistoryIndex}
            onHistorySelect={handleHistorySelect}
            onStop={handleStopProcessing}
          />
        )}
        {error && !isLoading && (
           <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg max-w-sm z-50 animate-pulse">
                <button onClick={() => setError(null)} className="absolute top-2 right-2 text-xl font-bold">&times;</button>
                <p className="font-bold pr-4">Error</p>
                <p>{error}</p>
            </div>
        )}
      </main>
    </div>
  );
};

export default App;