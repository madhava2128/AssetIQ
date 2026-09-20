import React from 'react';
import '@/styles/tokens.css';
import './globals.css';

export const metadata = {
    title: 'AssetIQ — Intelligent Hospital Asset & Surgical Readiness',
    description: 'Real-time hospital asset tracking, preventive maintenance compliance, and surgical suite readiness.'
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark" data-theme="dark">
            <body className="bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] antialiased min-h-screen flex flex-col font-sans">
                {children}
            </body>
        </html>
    );
}
