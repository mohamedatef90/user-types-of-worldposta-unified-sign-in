import React from 'react';

interface IconProps extends React.HTMLAttributes<HTMLElement> {
  name: string;
  className?: string;
  ariaHidden?: boolean;
  ariaLabel?: string;
  fixedWidth?: boolean;
  style?: React.CSSProperties;
}
export const Icon: React.FC<IconProps> = ({ name, className, ariaHidden = true, ariaLabel, fixedWidth, style, ...props }) => (
  <i className={`${name} ${fixedWidth ? 'fa-fw' : ''} ${className || ''}`} aria-hidden={ariaHidden} {...(ariaLabel && {'aria-label': ariaLabel})} style={style} {...props}></i>
);