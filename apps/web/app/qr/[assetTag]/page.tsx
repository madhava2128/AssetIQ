import { redirect } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function LegacyQrRedirectPage({
    params
}: {
    params: { assetTag: string }
}) {
    const { getAssets } = require('@/lib/supabase/mock-db');
    const assets = await getAssets();
    const cleanTag = decodeURIComponent(params.assetTag || '').trim().toLowerCase();

    const matchedAsset = assets.find(
        (a: any) => (a.asset_tag || '').trim().toLowerCase() === cleanTag
    );

    if (matchedAsset) {
        redirect(`/assets/${matchedAsset.id}`);
    }

    return (
        <div className="min-h-screen bg-page flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-panel border border-border rounded p-6 text-center space-y-4">
                <h1 className="text-xl font-semibold text-text-primary">Asset not found</h1>
                <p className="text-sm text-text-secondary">
                    The requested asset tag does not match any registered equipment.
                </p>
                <div className="pt-2">
                    <Link
                        href="/assets"
                        className="inline-block bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2 rounded transition-colors"
                    >
                        Go to equipment catalog
                    </Link>
                </div>
            </div>
        </div>
    );
}
