/**
 * AssetIQ QR Scanner Abstraction Layer
 * 
 * Provides unified QR payload parsing, URL validation, and scanner interface
 * suitable for standard browser/phone camera operation and future Android
 * native barcode scanner plugin wrapping (e.g., @capacitor-community/barcode-scanner).
 */

export interface ParseQrSuccess {
    valid: true;
    assetId: string;
    url: string;
}

export interface ParseQrFailure {
    valid: false;
    error: string;
}

export type ParseQrResult = ParseQrSuccess | ParseQrFailure;

/**
 * Validates and sanitizes a 'next' redirect URL parameter.
 * Accepts only relative paths that start with a single '/' (rejects full URLs, '://', and '//').
 * Prevents open redirect vulnerabilities.
 */
export function getSafeNextPath(param: string | null | undefined): string | null {
    if (!param) return null;
    const trimmed = param.trim();
    if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.startsWith('/\\') && !trimmed.includes('://')) {
        return trimmed;
    }
    return null;
}

/**
 * Validates that an ID conforms to database UUID format (8-12 alphanumeric chars, followed by 4-4-4-12 segments).
 */
export function isValidAssetId(id: string): boolean {
    if (!id || typeof id !== 'string') return false;
    return /^[0-9a-zA-Z]{8,12}-[0-9a-zA-Z]{4}-[0-9a-zA-Z]{4}-[0-9a-zA-Z]{4}-[0-9a-zA-Z]{12}$/.test(id.trim());
}

/**
 * Gets the configured public base URL for AssetIQ.
 * Never hardcodes domain: reads NEXT_PUBLIC_APP_URL, falls back to window.location.origin in browser.
 */
export function getAppBaseUrl(): string {
    const envUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
    if (envUrl) {
        return envUrl.replace(/\/+$/, '');
    }
    if (typeof window !== 'undefined' && window.location?.origin) {
        return window.location.origin.replace(/\/+$/, '');
    }
    return 'http://localhost:3000';
}

/**
 * Checks if the current base URL is running on localhost or missing a public address.
 */
export function isLocalhostAddress(url?: string): boolean {
    const testUrl = (url || getAppBaseUrl()).toLowerCase();
    return testUrl.includes('localhost') || testUrl.includes('127.0.0.1') || testUrl.includes('0.0.0.0');
}

/**
 * Constructs the canonical asset QR URL from an asset ID.
 * Never puts credentials, tokens, emails, roles, or asset details inside the QR.
 */
export function buildAssetQrUrl(assetId: string): string {
    const baseUrl = getAppBaseUrl();
    return `${baseUrl}/assets/${assetId}`;
}

/**
 * Parses and strictly validates a scanned QR payload text.
 * Checks that the text is an AssetIQ asset URL and contains a valid asset UUID.
 * This is the SINGLE PLACE where scanned QR values are validated.
 */
export function parseAssetQrPayload(text: string): ParseQrResult {
    if (!text || typeof text !== 'string') {
        return { valid: false, error: 'Empty or invalid QR code content' };
    }

    const trimmed = text.trim();

    try {
        // Accept absolute URL or relative path
        let parsedUrl: URL;
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
            parsedUrl = new URL(trimmed);
        } else if (trimmed.startsWith('/')) {
            parsedUrl = new URL(trimmed, getAppBaseUrl());
        } else {
            return { valid: false, error: 'QR code does not contain a valid AssetIQ URL' };
        }

        // Validate pathname pattern: /assets/{assetId}
        const pathname = parsedUrl.pathname.replace(/\/+$/, '');
        const match = pathname.match(/^\/assets\/([0-9a-zA-Z-]+)$/);

        if (!match) {
            return { valid: false, error: 'QR code URL is not an AssetIQ asset route' };
        }

        const candidateId = match[1];

        if (!isValidAssetId(candidateId)) {
            return { valid: false, error: 'QR code contains an invalid asset ID format' };
        }

        return {
            valid: true,
            assetId: candidateId,
            url: parsedUrl.toString()
        };
    } catch {
        return { valid: false, error: 'Could not parse QR code URL' };
    }
}

/**
 * Scanner Service Interface for camera or native hardware scanning.
 */
export interface ScannerService {
    /**
     * Initiates a scan session and returns the raw scanned string payload.
     */
    scan(): Promise<string>;
}

/**
 * Web browser implementation of ScannerService.
 * In a standard web browser on a smartphone, the built-in camera app
 * scans the QR code natively and opens the URL directly.
 */
export class WebScannerService implements ScannerService {
    async scan(): Promise<string> {
        throw new Error(
            'Use your phone\'s camera app to scan the label. The camera opens AssetIQ directly in your browser.'
        );
    }
}

/**
 * NOTE FOR FUTURE ANDROID / CAPACITOR INTEGRATION:
 * 
 * When wrapping AssetIQ with Capacitor for Android:
 * 1. Install `@capacitor-community/barcode-scanner`.
 * 2. Implement `NativeCapacitorScannerService implements ScannerService`:
 *    ```ts
 *    export class NativeCapacitorScannerService implements ScannerService {
 *        async scan(): Promise<string> {
 *            await BarcodeScanner.checkPermission({ force: true });
 *            BarcodeScanner.hideBackground();
 *            const result = await BarcodeScanner.startScan();
 *            if (result.hasContent) {
 *                return result.content;
 *            }
 *            throw new Error('No barcode content detected');
 *        }
 *    }
 *    ```
 * 3. In the mobile UI action:
 *    ```ts
 *    const rawPayload = await scannerService.scan();
 *    const parsed = parseAssetQrPayload(rawPayload);
 *    if (parsed.valid) {
 *        router.push(`/assets/${parsed.assetId}`);
 *    } else {
 *        showError(parsed.error);
 *    }
 *    ```
 * No other changes to database, backend, or permissions are needed.
 */
export const defaultScannerService: ScannerService = new WebScannerService();
