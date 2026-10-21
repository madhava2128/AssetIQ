import React from 'react';

interface AssetIqLogoProps {
    size?: number;
    className?: string;
    variant?: 'frame' | 'light' | 'tone-on-tone';
}

export default function AssetIqLogo({
    size = 28,
    className = '',
    variant = 'frame'
}: AssetIqLogoProps) {
    if (variant === 'tone-on-tone') {
        // Large quiet background shape for login page (tone-on-tone using #1D4062)
        return (
            <svg
                width={size}
                height={size}
                viewBox="0 0 120 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={className}
                aria-hidden="true"
            >
                <rect width="120" height="120" rx="24" fill="#1D4062" />
                <rect x="25" y="65" width="16" height="35" rx="5" fill="#25507A" />
                <rect x="52" y="45" width="16" height="55" rx="5" fill="#25507A" />
                <rect x="79" y="25" width="16" height="75" rx="5" fill="#25507A" />
            </svg>
        );
    }

    if (variant === 'light') {
        // Light surface version
        return (
            <svg
                width={size}
                height={size}
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`shrink-0 ${className}`}
                aria-hidden="true"
            >
                <rect width="32" height="32" rx="6" fill="#15314B" />
                <rect x="7" y="17" width="4" height="9" rx="1.5" fill="#FFFFFF" />
                <rect x="14" y="12" width="4" height="14" rx="1.5" fill="#FFFFFF" />
                <rect x="21" y="6" width="4" height="20" rx="1.5" fill="#8CC1F0" />
            </svg>
        );
    }

    // Default 'frame' variant (used in top bar on #15314B frame background)
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`shrink-0 ${className}`}
            aria-label="AssetIQ Logo"
        >
            <rect width="32" height="32" rx="6" fill="#1D4062" stroke="#2A4A68" strokeWidth="1" />
            <rect x="7" y="17" width="4" height="9" rx="1.5" fill="#FFFFFF" />
            <rect x="14" y="12" width="4" height="14" rx="1.5" fill="#FFFFFF" />
            <rect x="21" y="6" width="4" height="20" rx="1.5" fill="#8CC1F0" />
        </svg>
    );
}
