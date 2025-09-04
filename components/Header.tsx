import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

export const Header: React.FC = React.memo(() => {
  return (
    <header className="bg-dark-card/50 backdrop-blur-sm border-b border-dark-border sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-center">
        <SparklesIcon className="w-8 h-8 text-brand-primary mr-3" />
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary text-transparent bg-clip-text">
          AQ Enhancer Pro
        </h1>
      </div>
    </header>
  );
});
