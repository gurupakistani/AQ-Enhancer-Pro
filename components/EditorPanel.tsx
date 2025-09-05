import React from 'react';
import { ImageDisplay } from './ImageDisplay';
import { ControlPanel } from './ControlPanel';
import { ChatPanel } from './ChatPanel';
import { HistoryPanel } from './HistoryPanel';
import { EditEffect, HistoryState } from '../types';

interface EditorPanelProps {
  originalImage: string;
  editedImage: string | null;
  isLoading: boolean;
  onEdit: (effect: EditEffect) => void;
  onClear: () => void;
  effects: EditEffect[];
  aspectRatioEffects: EditEffect[];
  onChatSubmit: (prompt: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  history: HistoryState[];
  currentHistoryIndex: number;
  onHistorySelect: (index: number) => void;
  onStop: () => void;
  selectedEffects: EditEffect[];
  onStartProcessing: () => void;
  onFullscreen: (imageUrl: string) => void;
}

export const EditorPanel: React.FC<EditorPanelProps> = React.memo(({
  originalImage,
  editedImage,
  isLoading,
  onEdit,
  onClear,
  effects,
  aspectRatioEffects,
  onChatSubmit,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  history,
  currentHistoryIndex,
  onHistorySelect,
  onStop,
  selectedEffects,
  onStartProcessing,
  onFullscreen,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Main Content Area */}
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
        <ImageDisplay title="Original" imageUrl={originalImage} onFullscreen={onFullscreen} />
        <ImageDisplay
          title="Edited"
          imageUrl={editedImage}
          isLoading={isLoading}
          loadingMessage="AI is enhancing your image..."
          onFullscreen={onFullscreen}
        />
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-24 h-max">
        <ControlPanel
          effects={effects}
          aspectRatioEffects={aspectRatioEffects}
          onEdit={onEdit}
          onClear={onClear}
          isLoading={isLoading}
          onUndo={onUndo}
          onRedo={onRedo}
          canUndo={canUndo}
          canRedo={canRedo}
          showHistoryControls={true}
          onStop={onStop}
          selectedEffects={selectedEffects}
          onStartProcessing={onStartProcessing}
        />
        <ChatPanel 
          onPromptSubmit={onChatSubmit}
          isLoading={isLoading}
        />
        <HistoryPanel
          history={history}
          currentIndex={currentHistoryIndex}
          onSelect={onHistorySelect}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
});