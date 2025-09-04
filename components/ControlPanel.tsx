import React from 'react';
import { EditEffect, EditEffectType } from '../types';
import { UndoIcon } from './icons/UndoIcon';
import { RedoIcon } from './icons/RedoIcon';
import { LoadingSpinner } from './LoadingSpinner';

interface ControlPanelProps {
  effects: EditEffect[];
  aspectRatioEffects: EditEffect[];
  onEdit: (effect: EditEffect) => void;
  onClear: () => void;
  isLoading: boolean;
  activeEffect: EditEffectType | 'CHAT' | null;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  showHistoryControls?: boolean;
  onStop: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = React.memo(({ 
  effects,
  aspectRatioEffects, 
  onEdit, 
  onClear, 
  isLoading, 
  activeEffect,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  showHistoryControls = true,
  onStop
}) => {
  return (
    <div className="relative bg-dark-card border border-dark-border rounded-2xl p-6">
      {isLoading && (
        <div className="absolute inset-0 bg-dark-card/80 backdrop-blur-sm flex flex-col justify-center items-center z-10 rounded-2xl">
          <LoadingSpinner />
          <p className="text-lg font-semibold mt-4 text-light-text">AI is generating...</p>
          <p className="text-medium-text text-sm">This may take a moment.</p>
          <button 
            onClick={onStop}
            className="mt-4 px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-card focus:ring-red-400 transition-colors"
          >
            Stop Generating
          </button>
        </div>
      )}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
           <h3 className="text-2xl font-bold text-light-text">Choose a Preset Effect</h3>
           <p className="text-medium-text mt-1">Select a one-click AI effect to transform your photo(s).</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {showHistoryControls && (
            <>
              <button
                onClick={onUndo}
                disabled={!canUndo || isLoading}
                className="flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-card focus:ring-gray-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Undo last action"
              >
                <UndoIcon className="w-5 h-5" />
              </button>
              <button
                onClick={onRedo}
                disabled={!canRedo || isLoading}
                className="flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-card focus:ring-gray-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Redo last action"
              >
                <RedoIcon className="w-5 h-5" />
              </button>
            </>
          )}
          <button
            onClick={onClear}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-card focus:ring-red-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {effects.map((effect) => (
          <button
            key={effect.type}
            onClick={() => onEdit(effect)}
            disabled={isLoading}
            className={`px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-card
              ${activeEffect === effect.type 
                ? 'bg-brand-primary text-white ring-brand-primary' 
                : 'bg-dark-border text-medium-text hover:bg-brand-primary/80 hover:text-white'
              }
              ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}
            `}
          >
            {effect.label}
          </button>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-dark-border">
        <h4 className="text-xl font-bold text-light-text mb-4">Change Aspect Ratio</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {aspectRatioEffects.map((effect) => (
            <button
              key={effect.type}
              onClick={() => onEdit(effect)}
              disabled={isLoading}
              className={`px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-card
                ${activeEffect === effect.type 
                  ? 'bg-brand-primary text-white ring-brand-primary' 
                  : 'bg-dark-border text-medium-text hover:bg-brand-primary/80 hover:text-white'
                }
                ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}
              `}
            >
              {effect.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});
