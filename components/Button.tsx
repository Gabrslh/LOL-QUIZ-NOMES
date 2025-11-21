import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'outline';
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
    children, 
    variant = 'primary', 
    isLoading = false,
    className = '', 
    disabled,
    ...props 
}) => {
    const baseStyles = "px-6 py-3 rounded-lg font-bold transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wider border-2";
    
    const variants = {
        primary: "bg-sky-600 border-sky-400 text-white hover:bg-sky-500 hover:shadow-[0_0_15px_rgba(56,189,248,0.5)]",
        secondary: "bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700 hover:border-slate-500",
        danger: "bg-red-900/80 border-red-500 text-red-100 hover:bg-red-800 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]",
        outline: "bg-transparent border-sky-400 text-sky-400 hover:bg-sky-900/20"
    };

    return (
        <button 
            className={`${baseStyles} ${variants[variant]} ${isLoading || disabled ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <span className="animate-pulse">Carregando...</span>
            ) : children}
        </button>
    );
};