import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    children,
    onClick,
    className = '',
    disabled = false,
    type = 'button'
}) => {
    const baseClasses = `
    inline-flex items-center justify-center font-medium transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    rounded-lg border
  `;

    const variantClasses = {
        primary: `
      bg-blue-600 hover:bg-blue-700 text-white border-blue-600
      focus:ring-blue-500 shadow-sm hover:shadow-md
      dark:bg-blue-500 dark:hover:bg-blue-600 dark:border-blue-500
    `,
        secondary: `
      bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-200
      focus:ring-gray-500 shadow-sm
      dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100 dark:border-gray-700
    `,
        ghost: `
      bg-transparent hover:bg-gray-100 text-gray-700 border-transparent
      focus:ring-gray-500
      dark:hover:bg-gray-800 dark:text-gray-300
    `,
        outline: `
      bg-transparent hover:bg-gray-50 text-gray-700 border-gray-300
      focus:ring-gray-500
      dark:hover:bg-gray-900 dark:text-gray-300 dark:border-gray-600
    `
    };

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base'
    };

    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

    return (
        <motion.button
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            className={classes}
            onClick={onClick}
            disabled={disabled}
            type={type}
        >
            {children}
        </motion.button>
    );
};

interface CardProps {
    children: React.ReactNode;
    className?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    padding = 'md',
    elevated = false
}) => {
    const baseClasses = `
    bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800
    transition-all duration-200
  `;

    const elevatedClasses = elevated
        ? 'shadow-lg hover:shadow-xl dark:shadow-gray-900/20'
        : 'shadow-sm hover:shadow-md';

    const paddingClasses = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8'
    };

    const classes = `${baseClasses} ${elevatedClasses} ${paddingClasses[padding]} ${className}`;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={classes}
        >
            {children}
        </motion.div>
    );
};

interface InputProps {
    type?: 'text' | 'email' | 'password' | 'search';
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
    disabled?: boolean;
    error?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export const Input: React.FC<InputProps> = ({
    type = 'text',
    placeholder,
    value,
    onChange,
    className = '',
    disabled = false,
    error = false,
    size = 'md'
}) => {
    const baseClasses = `
    w-full rounded-lg border transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-1
    disabled:opacity-50 disabled:cursor-not-allowed
    bg-white dark:bg-gray-900
  `;

    const errorClasses = error
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-600'
        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600';

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-4 py-3 text-base'
    };

    const textClasses = 'text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400';

    const classes = `${baseClasses} ${errorClasses} ${sizeClasses[size]} ${textClasses} ${className}`;

    return (
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={classes}
        />
    );
};

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
    size?: 'sm' | 'md';
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'default',
    size = 'sm',
    className = ''
}) => {
    const baseClasses = 'inline-flex items-center font-medium rounded-full';

    const variantClasses = {
        default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
        primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm'
    };

    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

    return <span className={classes}>{children}</span>;
};
