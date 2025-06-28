import React, { createContext, useContext, useState, useEffect } from 'react';
import { lightTheme, darkTheme } from './once-ui-config';

interface ThemeContextType {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    themeConfig: typeof lightTheme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

interface ThemeProviderProps {
    children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        // Check for saved theme preference or default to system preference
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
        if (savedTheme) {
            setTheme(savedTheme);
        } else {
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setTheme(systemPrefersDark ? 'dark' : 'light');
        }
    }, []);

    useEffect(() => {
        // Update document class and save preference
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('theme', theme);

        // Update CSS custom properties for Once UI
        const root = document.documentElement;
        const themeConfig = theme === 'dark' ? darkTheme : lightTheme;

        // Set CSS custom properties
        root.style.setProperty('--background-primary', themeConfig.colors.background.primary);
        root.style.setProperty('--background-secondary', themeConfig.colors.background.secondary);
        root.style.setProperty('--background-tertiary', themeConfig.colors.background.tertiary);
        root.style.setProperty('--background-elevated', themeConfig.colors.background.elevated);
        root.style.setProperty('--background-overlay', themeConfig.colors.background.overlay);

        root.style.setProperty('--text-primary', themeConfig.colors.text.primary);
        root.style.setProperty('--text-secondary', themeConfig.colors.text.secondary);
        root.style.setProperty('--text-tertiary', themeConfig.colors.text.tertiary);
        root.style.setProperty('--text-inverse', themeConfig.colors.text.inverse);

        root.style.setProperty('--border-primary', themeConfig.colors.border.primary);
        root.style.setProperty('--border-secondary', themeConfig.colors.border.secondary);
        root.style.setProperty('--border-focus', themeConfig.colors.border.focus);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const themeConfig = theme === 'dark' ? darkTheme : lightTheme;

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, themeConfig }}>
            {children}
        </ThemeContext.Provider>
    );
};
