import React from 'react';
import { HistoryIcon } from './icons/HistoryIcon';
import { HistoryState } from '../types';

interface HistoryPanelProps {
  history: HistoryState[];
  currentIndex: number;
  onSelect: (index: number) => void;
  isLoading: boolean;
}

const getEffectLabel = (effectType: HistoryState['effectType']) => {
  if (effectType === null) return 'Original';
  if (effectType === 'CHAT') return 'Chat Edit';
  return effectType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export const HistoryPanel: React.FC<HistoryPanelProps> = React.memo(({ history, currentIndex, onSelect, isLoading }) => {
  if (history.length <= 1) return null;

  return (
    <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
      <h3 className="text-2xl font-bold text-light-text flex items-center mb-4">
        <HistoryIcon className="w-6 h-6 mr-2 text-brand-secondary" />
        History
      </h3>
      <div className="flex overflow-x-auto space-x-4 pb-2 -mb-2">
        {history.map((state, index) => (
          <button
            key={index}
            onClick={() => onSelect(index)}
            disabled={isLoading}
            className={`flex-shrink-0 w-32 focus:outline-none transition-all duration-200 rounded-lg overflow-hidden ${isLoading ? 'cursor-not-allowed' : 'hover:scale-105'}`}
            aria-label={`Go to step ${index + 1}: ${getEffectLabel(state.effectType)}`}
          >
            <div className={`w-full h-20 bg-dark-bg border-2 ${currentIndex === index ? 'border-brand-primary' : 'border-transparent'}`}>
              <img src={state.thumbnail} alt={`History step ${index + 1}`} className="w-full h-full object-cover" />
            </div>
            <div className={`p-2 text-center text-xs font-semibold ${currentIndex === index ? 'bg-brand-primary text-white' : 'bg-dark-border text-medium-text'}`}>
              <p className="truncate">{getEffectLabel(state.effectType)}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
});
