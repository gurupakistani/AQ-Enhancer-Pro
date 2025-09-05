import React, { useState, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { EditorPanel } from './components/EditorPanel';
import { BatchEditorPanel } from './components/BatchEditorPanel';
import { FullscreenViewer } from './components/FullscreenViewer';
import { editImage } from './services/geminiService';
import { EditEffect, HistoryState, BatchImage, HistoryEffect, CustomEditEffect } from './types';
import { EDIT_EFFECTS, ASPECT_RATIO_EFFECTS } from './constants';
import { createThumbnail } from './utils/imageUtils';

const App: React.FC = () => {
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [batchImages, setBatchImages] = useState<BatchImage[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState<number>(-1);
  const [originalImageMime, setOriginalImageMime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);
  const [selectedEffects, setSelectedEffects] = useState<EditEffect[]>([]);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const isCancelledRef = useRef(false);

  const handleClear = useCallback(() => {
    setHistory([]);
    setBatchImages([]);
    setCurrentHistoryIndex(-1);
    setOriginalImageMime(null);
    setError(null);
    setRetryMessage(null);
    setIsLoading(false);
    setSelectedEffects([]);
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
    setRetryMessage(null);
    if(batchImages.length > 0) {
      setBatchImages(prev => prev.map(img => ({ ...img, isLoading: false })));
    }
  }, [batchImages.length]);

  const handleRetry = useCallback((attempt: number, delay: number) => {
      const delayInSeconds = Math.round(delay / 1000);
      setRetryMessage(`Service is busy. Retrying in ${delayInSeconds}s...`);
  }, []);

  const applySingleEdit = useCallback(async (prompt: string, effectType: HistoryEffect) => {
    const currentImageState = history[currentHistoryIndex];
    if (!currentImageState || !originalImageMime) {
      setError("An image must be loaded to apply an effect.");
      return;
    }

    isCancelledRef.current = false;
    setIsLoading(true);
    setError(null);
    setRetryMessage(null);

    try {
      const base64Data = currentImageState.image.split(',')[1];
      const resultBase64 = await editImage(base64Data, originalImageMime, prompt, handleRetry);
      
      if (isCancelledRef.current) return;
      
      setRetryMessage(null);
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
      setSelectedEffects([]);

    } catch (err) {
      if (isCancelledRef.current) return;
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during image processing.";
      setError(`Error: ${errorMessage}.`);
      console.error(err);
    } finally {
      if (!isCancelledRef.current) {
        setIsLoading(false);
      }
      setRetryMessage(null);
    }
  }, [history, currentHistoryIndex, originalImageMime, handleRetry]);

  const applyBatchEdit = useCallback(async (prompt: string) => {
    isCancelledRef.current = false;
    setIsLoading(true);
    setError(null);
    setRetryMessage(null);
    setBatchImages(prev => prev.map(img => ({ ...img, isLoading: true, error: null })));

    const imagesToProcess = [...batchImages];
    
    for (const image of imagesToProcess) {
        if (isCancelledRef.current) break;

        try {
            const resultBase64 = await editImage(image.base64, image.mimeType, prompt, handleRetry);
            if (isCancelledRef.current) break;

            setBatchImages(prev => prev.map(img => 
                img.id === image.id ? { ...img, editedURL: `data:${image.mimeType};base64,${resultBase64}`, isLoading: false } : img
            ));
        } catch (error) {
            if (isCancelledRef.current) break;
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            setBatchImages(prev => prev.map(img => 
                img.id === image.id ? { ...img, error: errorMessage, isLoading: false } : img
            ));
        } finally {
            setRetryMessage(null);
        }

        if (imagesToProcess.indexOf(image) < imagesToProcess.length - 1 && !isCancelledRef.current) {
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }
    
    setIsLoading(false);
    setSelectedEffects([]);
    if (isCancelledRef.current) {
      setBatchImages(prev => prev.map(img => ({ ...img, isLoading: false })));
    }

  }, [batchImages, handleRetry]);


  const handlePresetEffect = useCallback((effect: EditEffect) => {
    setSelectedEffects(prev => {
      const isSelected = prev.some(e => e.type === effect.type);
      if (isSelected) {
        return prev.filter(e => e.type !== effect.type);
      } else {
        return [...prev, effect];
      }
    });
  }, []);

  const handleStartProcessing = useCallback(() => {
    if (selectedEffects.length === 0) return;
    const combinedPrompt = selectedEffects.map(e => e.prompt).join('. ');
    
    if (batchImages.length > 0) {
      applyBatchEdit(combinedPrompt);
    } else {
      let historyLabel = selectedEffects.map(e => e.label).join(' & ');
      if (historyLabel.length > 25) {
        historyLabel = `${selectedEffects.length} Effects`;
      }
      const customEffect: CustomEditEffect = { type: 'CUSTOM', label: historyLabel };
      applySingleEdit(combinedPrompt, customEffect);
    }
  }, [selectedEffects, batchImages.length, applyBatchEdit, applySingleEdit]);
  
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
  
  const handleFullscreen = useCallback((imageUrl: string) => {
    setFullscreenImage(imageUrl);
  }, []);

  const handleCloseFullscreen = useCallback(() => {
    setFullscreenImage(null);
  }, []);

  const originalImage = history.length > 0 ? history[0].image : null;
  const editedImage = currentHistoryIndex > 0 ? history[currentHistoryIndex].image : null;
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
            selectedEffects={selectedEffects}
            onStartProcessing={handleStartProcessing}
            retryMessage={retryMessage}
            onFullscreen={handleFullscreen}
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
            onChatSubmit={handleChatSubmit}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={canUndo}
            canRedo={canRedo}
            history={history}
            currentHistoryIndex={currentHistoryIndex}
            onHistorySelect={handleHistorySelect}
            onStop={handleStopProcessing}
            selectedEffects={selectedEffects}
            onStartProcessing={handleStartProcessing}
            retryMessage={retryMessage}
            onFullscreen={handleFullscreen}
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
      {fullscreenImage && (
        <FullscreenViewer
          imageUrl={fullscreenImage}
          onClose={handleCloseFullscreen}
        />
      )}
    </div>
  );
};

export default App;