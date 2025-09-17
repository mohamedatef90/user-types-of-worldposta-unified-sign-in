import React from 'react';

interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ id, checked, onChange, label, disabled, size = 'md' }) => {
  const sizeClasses = {
    md: {
      block: 'w-14 h-8',
      dot: 'w-6 h-6 left-1 top-1',
      translate: 'translate-x-6',
    },
    sm: {
      block: 'w-10 h-5',
      dot: 'w-4 h-4 left-0.5 top-0.5',
      translate: 'translate-x-5',
    },
  };

  const currentSize = sizeClasses[size];
  
  return (
    <label htmlFor={id} className={`flex items-center ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
      {label && <span className="mr-3 text-sm font-medium text-gray-900 dark:text-gray-300">{label}</span>}
      <div className="relative">
        <input 
          type="checkbox" 
          id={id} 
          className="sr-only" 
          checked={checked} 
          onChange={(e) => onChange(e.target.checked)} 
          disabled={disabled}
        />
        <div className={`block ${currentSize.block} rounded-full transition-colors ${checked ? 'bg-[#679a41]' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
        <div className={`dot absolute bg-white ${currentSize.dot} rounded-full transition-transform ${checked ? currentSize.translate : 'translate-x-0'}`}></div>
      </div>
    </label>
  );
};
