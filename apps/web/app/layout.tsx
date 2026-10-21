import React from 'react';
import { Inter, Source_Serif_4 } from 'next/font/google';
import '@/styles/tokens.css';
import './globals.css';

const inter = Inter({
    subsets: ['latin'],
    weight: ['400', '500', '600'],
    variable: '--font-inter',
    display: 'swap',
    fallback: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
});

const sourceSerif = Source_Serif_4({
    subsets: ['latin'],
    weight: ['600'],
    variable: '--font-serif',
    display: 'swap',
    fallback: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
});

export const metadata = {
    title: 'AssetIQ — Hospital Asset & Surgery Management',
    description: 'Simple hospital asset tracking, preventive maintenance, and surgery readiness.'
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${inter.variable} ${sourceSerif.variable}`}>
            <body className="bg-page text-text-primary antialiased min-h-screen flex flex-col font-sans">
                {children}
            </body>
        </html>
    );
}
