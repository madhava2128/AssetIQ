'use client';

import React, { useState, useEffect } from 'react';

export default function ThemeToggle() {
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');

    useEffect(() => {
        const savedTheme = localStorage.getItem('assetiq_theme') as 'dark' | 'light' || 'dark';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
        if (savedTheme === 'light') {
            document.documentElement.classList.remove('dark');
        } else {
            document.documentElement.classList.add('dark');
        }
    }, []);

    const toggleTheme = () => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
        localStorage.setItem('assetiq_theme', nextTheme);
        document.documentElement.setAttribute('data-theme', nextTheme);
        if (nextTheme === 'light') {
            document.documentElement.classList.remove('dark');
        } else {
            document.documentElement.classList.add('dark');
        }
    };

    return (
        <button
            onClick={toggleTheme}
            title="Toggle Clinical Theme (OR Monitor Dark vs Bright Office Light)"
            className="px-3 py-1.5 rounded-lg bg-slate-800/90 text-slate-200 border border-slate-700/80 hover:bg-slate-700 transition-all font-mono text-xs font-semibold flex items-center gap-1.5 shadow-sm"
        >
            {theme === 'dark' ? (
                <>
                    <span className="text-amber-400">☀</span>
                    <span className="hidden md:inline">Light Mode (Admin)</span>
                </>
            ) : (
                <>
                    <span className="text-cyan-400">🌙</span>
                    <span className="hidden md:inline">Dark Mode (OR)</span>
                </>
            )}
        </button>
    );
}
