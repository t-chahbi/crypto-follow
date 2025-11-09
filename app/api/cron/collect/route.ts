import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = await createClient();

    try {
        // 1. Fetch data from CoinCap
        const response = await fetch('https://api.coincap.io/v2/assets?limit=20');
        const data = await response.json();
        const assets = data.data;

        if (!assets) {
            return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
        }

        const updates = [];
        const marketData = [];

        for (const asset of assets) {
            // Prepare Asset Update (Upsert)
            updates.push({
                symbol: asset.symbol,
                name: asset.name,
                coin_cap_id: asset.id,
                rank: parseInt(asset.rank),
            });

            // Prepare Market Data Insert
            marketData.push({
                crypto_symbol: asset.symbol,
                price_usd: parseFloat(asset.priceUsd),
                market_cap_usd: parseFloat(asset.marketCapUsd),
                volume_24h_usd: parseFloat(asset.volumeUsd24Hr),
                change_percent_24h: parseFloat(asset.changePercent24Hr),
            });
        }

        // 2. Upsert Assets
        const { error: assetError } = await supabase
            .from('crypto_assets')
            .upsert(updates, { onConflict: 'symbol' });

        if (assetError) throw assetError;

        // 3. Insert Market Data
        const { error: marketError } = await supabase
            .from('market_data')
            .insert(marketData);

        if (marketError) throw marketError;

        // 4. Check Alerts (Sprint 3)
        // For each asset, check if any active alert condition is met
        // This is a simplified check. In a real system, you'd query alerts matching the symbol.

        // TODO: Implement Alert Notification Logic here (Email/Discord)

        return NextResponse.json({ success: true, count: assets.length });
    } catch (error: any) {
        console.error('Cron Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
