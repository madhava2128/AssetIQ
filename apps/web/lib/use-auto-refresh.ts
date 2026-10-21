'use client';

import { useEffect, useRef } from 'react';

/**
 * Shared auto-refresh hook for AssetIQ dashboards and surgery pages.
 * Triggers refresh callback:
 * 1. Every 60 seconds (periodic background poll).
 * 2. When the user refocuses or switches back to the browser window.
 * 3. When the tab transitions from hidden to visible.
 */
export function useAutoRefresh(callback: () => void | Promise<void>, intervalMs: number = 60000) {
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    useEffect(() => {
        // Periodic background interval (default 60s)
        const timer = setInterval(() => {
            if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
                callbackRef.current();
            }
        }, intervalMs);

        // Window focus event
        const onFocus = () => {
            callbackRef.current();
        };

        // Visibility change event
        const onVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                callbackRef.current();
            }
        };

        window.addEventListener('focus', onFocus);
        document.addEventListener('visibilitychange', onVisibilityChange);

        return () => {
            clearInterval(timer);
            window.removeEventListener('focus', onFocus);
            document.removeEventListener('visibilitychange', onVisibilityChange);
        };
    }, [intervalMs]);
}
