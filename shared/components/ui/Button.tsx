import React from 'react';
import { theme } from '../../theme';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', fullWidth = false, className = '', ...props }) => {
  const getButtonClass = () => {
    const base = "button";
    const variants = {
      primary: "button-primary",
      outline: "button-outline", 
      ghost: "button-ghost"
    };
    const width = fullWidth ? "button-full-width" : "";
    
    return `${base} ${variants[variant]} ${width} ${className}`;
  };

  return (
    <button 
      className={getButtonClass()}
      {...props}
    >
      {children}
    </button>
  );
};