import React from 'react';
import { Button } from './Button';
import { Icon } from './Icon';

export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
  title?: string;
  titleActions?: React.ReactNode;
  onUpscale?: () => void;
  onClick?: () => void;
}> = ({ children, className, title, titleActions, onUpscale, onClick }) => (
  <div className={`bg-white dark:bg-slate-800 rounded-xl p-6 ${className}`} onClick={onClick}>
    {title && (
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-[#293c51] dark:text-gray-100">{title}</h2>
        {(titleActions || onUpscale) && (
            <div className="flex items-center gap-2">
                {titleActions}
                {onUpscale && (
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            onUpscale(); 
                        }} 
                        aria-label="Upscale card" 
                        className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                    >
                        <Icon name="fas fa-expand-alt" />
                    </Button>
                )}
            </div>
        )}
      </div>
    )}
    {children}
  </div>
);