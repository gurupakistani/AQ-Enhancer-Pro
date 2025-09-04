import React, { useState } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

interface ChatPanelProps {
  onPromptSubmit: (prompt: string) => void;
  isLoading: boolean;
}

export const ChatPanel: React.FC<ChatPanelProps> = React.memo(({ onPromptSubmit, isLoading }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onPromptSubmit(prompt.trim());
      setPrompt('');
    }
  };

  return (
    <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
      <h3 className="text-2xl font-bold text-light-text flex items-center mb-4">
        <SparklesIcon className="w-6 h-6 mr-2 text-brand-secondary" />
        Describe Your Edit
      </h3>
      <p className="text-medium-text mb-4">
        Use natural language to edit your image. Try "make the sky blue" or "add a vintage film grain".
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., add sunglasses to the person"
          disabled={isLoading}
          className="flex-grow bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-light-text focus:ring-2 focus:ring-brand-primary focus:outline-none transition disabled:opacity-50"
          aria-label="Describe your edit"
        />
        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="px-6 py-3 bg-brand-secondary text-white font-semibold rounded-lg hover:bg-brand-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-card focus:ring-brand-secondary transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Generating...' : 'Generate'}
        </button>
      </form>
    </div>
  );
});
