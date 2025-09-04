import React from 'react';
import { ImageDisplay } from './ImageDisplay';
import { ControlPanel } from './ControlPanel';
import { ChatPanel } from './ChatPanel';
import { HistoryPanel } from './HistoryPanel';
import { EditEffect, EditEffectType, HistoryState } from '../types';

interface EditorPanelProps {
  originalImage: string;
  editedImage: string | null;
  isLoading: boolean;
  onEdit: (effect: EditEffect) => void;
  onClear: () => void;
  effects: EditEffect[];
  aspectRatioEffects: EditEffect[];
  activeEffect: EditEffectType | 'CHAT' | null;
  onChatSubmit: (prompt: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  history: HistoryState[];
  currentHistoryIndex: number;
  onHistorySelect: (index: number) => void;
  onStop: () => void;
}

export const EditorPanel: React.FC<EditorPanelProps> = React.memo(({
  originalImage,
  editedImage,
  isLoading,
  onEdit,
  onClear,
  effects,
  aspectRatioEffects,
  activeEffect,
  onChatSubmit,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  history,
  currentHistoryIndex,
  onHistorySelect,
  onStop,
}) => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ImageDisplay title="Original" imageUrl={originalImage} />
        <ImageDisplay
          title="Edited"
          imageUrl={editedImage}
          isLoading={isLoading}
          loadingMessage="AI is enhancing your image..."
        />
      </div>
      <HistoryPanel
        history={history}
        currentIndex={currentHistoryIndex}
        onSelect={onHistorySelect}
        isLoading={isLoading}
      />
      <ControlPanel
        effects={effects}
        aspectRatioEffects={aspectRatioEffects}
        onEdit={onEdit}
        onClear={onClear}
        isLoading={isLoading}
        activeEffect={activeEffect}
        onUndo={onUndo}
        onRedo={onRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        showHistoryControls={true}
        onStop={onStop}
      />
      <ChatPanel 
        onPromptSubmit={onChatSubmit}
        isLoading={isLoading}
      />
    </div>
  );
});
