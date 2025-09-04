import React from 'react';
import { ControlPanel } from './ControlPanel';
import { ChatPanel } from './ChatPanel';
import { ImageDisplay } from './ImageDisplay';
import { EditEffect, BatchImage } from '../types';

interface BatchEditorPanelProps {
  images: BatchImage[];
  isLoading: boolean;
  onEdit: (effect: EditEffect) => void;
  onClear: () => void;
  effects: EditEffect[];
  aspectRatioEffects: EditEffect[];
  onChatSubmit: (prompt: string) => void;
  onStop: () => void;
}

export const BatchEditorPanel: React.FC<BatchEditorPanelProps> = React.memo(({
  images, isLoading, onEdit, onClear, effects, aspectRatioEffects, onChatSubmit, onStop
}) => {
  const handleDummy = () => {};

  return (
    <div className="space-y-8">
      <ControlPanel
        effects={effects}
        aspectRatioEffects={aspectRatioEffects}
        onEdit={onEdit}
        onClear={onClear}
        isLoading={isLoading}
        activeEffect={null}
        onUndo={handleDummy}
        onRedo={handleDummy}
        canUndo={false}
        canRedo={false}
        showHistoryControls={false}
        onStop={onStop}
      />
       <ChatPanel 
        onPromptSubmit={onChatSubmit}
        isLoading={isLoading}
      />
      <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
        <h3 className="text-2xl font-bold text-light-text mb-4">
          Batch Results ({images.length} images)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {images.map(image => (
            <div key={image.id}>
              <ImageDisplay
                title="Result"
                imageUrl={image.editedURL || image.originalURL}
                isLoading={image.isLoading}
                loadingMessage="Enhancing..."
              />
              {image.error && (
                <p className="mt-2 text-sm text-red-400">Error: {image.error}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
