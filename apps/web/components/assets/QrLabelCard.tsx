'use client';

import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { buildAssetQrUrl, getAppBaseUrl, isLocalhostAddress } from '@/lib/scanner';
import { TOKENS } from '@/lib/tokens';

interface QrLabelCardProps {
    asset: {
        id: string;
        name: string;
        asset_tag: string;
    };
}

export default function QrLabelCard({ asset }: QrLabelCardProps) {
    const qrSvgRef = useRef<SVGSVGElement | null>(null);
    const [downloading, setDownloading] = useState(false);

    const qrUrl = buildAssetQrUrl(asset.id);
    const baseUrl = getAppBaseUrl();
    const isLocalhost = isLocalhostAddress(baseUrl);

    const handleDownloadPng = async () => {
        try {
            setDownloading(true);
            const svgElement = qrSvgRef.current;
            if (!svgElement) return;

            // Serialize SVG
            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(svgElement);
            const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            const svgUrl = URL.createObjectURL(svgBlob);

            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = 600;
                canvas.height = 740;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    URL.revokeObjectURL(svgUrl);
                    setDownloading(false);
                    return;
                }

                // White background
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Thin outer cut guide border
                ctx.strokeStyle = '#C9D4DF';
                ctx.lineWidth = 2;
                ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);

                // Header brand
                ctx.fillStyle = TOKENS.frame.bg;
                ctx.font = 'bold 28px Inter, -apple-system, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('AssetIQ', 300, 60);

                // Draw QR Code centered (400x400)
                ctx.drawImage(img, 100, 85, 400, 400);

                // Asset Tag
                ctx.fillStyle = TOKENS.text.primary;
                ctx.font = 'bold 34px Inter, -apple-system, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(asset.asset_tag, 300, 530);

                // Asset Name with clean word wrap
                ctx.fillStyle = TOKENS.text.secondary;
                ctx.font = '500 24px Inter, -apple-system, sans-serif';

                const words = (asset.name || 'Medical Equipment').split(' ');
                let line = '';
                let y = 575;
                const maxWidth = 520;
                let lineCount = 0;

                for (let n = 0; n < words.length; n++) {
                    const testLine = line + words[n] + ' ';
                    const metrics = ctx.measureText(testLine);
                    if (metrics.width > maxWidth && n > 0) {
                        ctx.fillText(line.trim(), 300, y);
                        line = words[n] + ' ';
                        y += 32;
                        lineCount++;
                        if (lineCount >= 2 && n < words.length - 1) {
                            line = line + '...';
                            break;
                        }
                    } else {
                        line = testLine;
                    }
                }
                ctx.fillText(line.trim(), 300, y);

                // Subtitle
                ctx.fillStyle = TOKENS.text.muted;
                ctx.font = '400 16px Inter, -apple-system, sans-serif';
                ctx.fillText('Scan with phone camera to open in AssetIQ', 300, 680);

                // Trigger download
                const pngUrl = canvas.toDataURL('image/png');
                const downloadLink = document.createElement('a');
                downloadLink.download = `assetiq-label-${asset.asset_tag}.png`;
                downloadLink.href = pngUrl;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);

                URL.revokeObjectURL(svgUrl);
                setDownloading(false);
            };

            img.src = svgUrl;
        } catch (err) {
            console.error('Failed to download QR PNG', err);
            setDownloading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="bg-panel border border-border rounded-[6px] shadow-none overflow-hidden space-y-0">
            <div className="panel-header-band">
                <h3 className="text-section-heading text-text-primary">QR Equipment Label</h3>
                <p className="text-caption text-text-secondary mt-0.5">
                    Physical tracking label for this asset.
                </p>
            </div>

            <div className="p-5 space-y-4">
                {/* Localhost Warning Banner */}
                {isLocalhost && (
                    <div className="p-3 bg-status-atrisk-bg border border-status-atrisk-solid rounded-[4px] text-status-atrisk-text text-caption leading-relaxed">
                        <p className="font-semibold">Notice for phone scanning:</p>
                        <p>QR codes will not work on other devices until the public app address is set.</p>
                    </div>
                )}

                {/* QR Card Presentation */}
                <div className="flex flex-col items-center justify-center p-4 bg-white border border-border rounded-[6px] space-y-3">
                    <div className="p-3 bg-white border border-border-strong rounded-[4px] flex items-center justify-center">
                        <QRCodeSVG
                            ref={qrSvgRef}
                            value={qrUrl}
                            size={180}
                            level="M"
                            includeMargin={true}
                        />
                    </div>

                    <div className="text-center space-y-1">
                        <div className="text-base font-bold text-text-primary tabular-nums">
                            {asset.asset_tag}
                        </div>
                        <div className="text-sm font-medium text-text-secondary max-w-xs truncate">
                            {asset.name}
                        </div>
                    </div>

                    <p className="text-xs text-text-muted text-center max-w-xs">
                        Scan with a phone camera to open this asset in AssetIQ.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <button
                        type="button"
                        onClick={handleDownloadPng}
                        disabled={downloading}
                        className="min-h-[44px] px-4 py-2 bg-panel hover:bg-panel-header text-text-primary border border-border-strong rounded-[4px] text-sm font-medium transition-colors flex items-center justify-center cursor-pointer shadow-none"
                    >
                        {downloading ? 'Preparing PNG...' : 'Download label'}
                    </button>

                    <button
                        type="button"
                        onClick={handlePrint}
                        className="min-h-[44px] px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-[4px] text-sm font-medium transition-colors flex items-center justify-center cursor-pointer shadow-none"
                    >
                        Print label
                    </button>
                </div>
            </div>

            {/* Hidden Print-Only Layout */}
            <div id="qr-print-single-label" className="print-only">
                <div className="qr-print-brand">AssetIQ</div>
                <div className="qr-print-svg-wrapper">
                    <QRCodeSVG
                        value={qrUrl}
                        size={110}
                        level="M"
                        includeMargin={false}
                    />
                </div>
                <div className="qr-print-tag">{asset.asset_tag}</div>
                <div className="qr-print-name">{asset.name}</div>
            </div>

            {/* Print CSS Injection */}
            <style jsx global>{`
                @media screen {
                    .print-only {
                        display: none !important;
                    }
                }

                @media print {
                    body * {
                        visibility: hidden !important;
                    }

                    header, nav, aside, footer, button, .no-print {
                        display: none !important;
                    }

                    #qr-print-single-label,
                    #qr-print-single-label * {
                        visibility: visible !important;
                    }

                    #qr-print-single-label {
                        display: flex !important;
                        flex-direction: column !important;
                        align-items: center !important;
                        justify-content: space-between !important;
                        position: fixed !important;
                        top: 0 !important;
                        left: 0 !important;
                        width: 50mm !important;
                        height: 50mm !important;
                        max-width: 50mm !important;
                        max-height: 50mm !important;
                        padding: 2.5mm !important;
                        box-sizing: border-box !important;
                        background: #FFFFFF !important;
                        color: #000000 !important;
                        border: 1px dashed #666 !important;
                        font-family: Inter, -apple-system, sans-serif !important;
                        text-align: center !important;
                        overflow: hidden !important;
                        page-break-inside: avoid !important;
                    }

                    .qr-print-brand {
                        font-size: 8pt !important;
                        font-weight: 700 !important;
                        color: #000000 !important;
                        letter-spacing: 0.5px !important;
                        line-height: 1 !important;
                        margin-bottom: 1mm !important;
                    }

                    .qr-print-svg-wrapper {
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        flex: 1 !important;
                    }

                    .qr-print-svg-wrapper svg {
                        width: 28mm !important;
                        height: 28mm !important;
                    }

                    .qr-print-tag {
                        font-size: 8pt !important;
                        font-family: inherit !important;
                        font-variant-numeric: tabular-nums !important;
                        font-weight: 700 !important;
                        color: #000000 !important;
                        line-height: 1.1 !important;
                        margin-top: 1mm !important;
                    }

                    .qr-print-name {
                        font-size: 6.5pt !important;
                        font-weight: 500 !important;
                        color: #333333 !important;
                        line-height: 1.1 !important;
                        max-height: 5mm !important;
                        overflow: hidden !important;
                        text-overflow: ellipsis !important;
                        white-space: nowrap !important;
                        width: 44mm !important;
                    }

                    @page {
                        size: 50mm 50mm;
                        margin: 0;
                    }
                }
            `}</style>
        </div>
    );
}
