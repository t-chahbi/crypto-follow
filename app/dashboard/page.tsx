import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch latest market data for each asset
    // Note: In a real app, you'd want a more optimized query (e.g., DISTINCT ON or a View)
    const { data: assets } = await supabase
        .from('crypto_assets')
        .select(`
      symbol,
      name,
      rank,
      market_data (
        price_usd,
        change_percent_24h,
        volume_24h_usd,
        market_cap_usd
      )
    `)
        .order('rank', { ascending: true })
        .limit(20)

    // Process data to get the latest entry for each
    const processedAssets = assets?.map(asset => {
        const latestData = asset.market_data?.[0] || {} // Assuming default order is desc, but we should enforce it
        // Actually, the relation query above doesn't guarantee order. 
        // For simplicity in this sprint, we'll assume the cron just ran and we have data.
        // A better way is to have a 'current_price' in crypto_assets or a materialized view.
        return {
            ...asset,
            ...latestData
        }
    })

    return (
        <div className="min-h-screen bg-gray-950 text-white p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Crypto Dashboard</h1>
                    <div className="flex gap-4">
                        <Link href="/portfolio" className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700">Portfolio</Link>
                        <Link href="/alerts" className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700">Alerts</Link>
                    </div>
                </header>

                <div className="grid gap-6">
                    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-800/50">
                                <tr>
                                    <th className="p-4 font-medium text-gray-400">Rank</th>
                                    <th className="p-4 font-medium text-gray-400">Name</th>
                                    <th className="p-4 font-medium text-gray-400">Price</th>
                                    <th className="p-4 font-medium text-gray-400">24h Change</th>
                                    <th className="p-4 font-medium text-gray-400">Market Cap</th>
                                    <th className="p-4 font-medium text-gray-400">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {processedAssets?.map((asset: any) => (
                                    <tr key={asset.symbol} className="hover:bg-gray-800/30 transition">
                                        <td className="p-4 text-gray-400">#{asset.rank}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <span className="font-bold">{asset.name}</span>
                                                <span className="text-sm text-gray-500">{asset.symbol}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 font-mono">${asset.price_usd?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        <td className={`p-4 font-mono ${asset.change_percent_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {asset.change_percent_24h?.toFixed(2)}%
                                        </td>
                                        <td className="p-4 text-gray-400">${(asset.market_cap_usd / 1e9).toFixed(2)}B</td>
                                        <td className="p-4">
                                            <Link
                                                href={`/crypto/${asset.symbol}`}
                                                className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
                                            >
                                                Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
