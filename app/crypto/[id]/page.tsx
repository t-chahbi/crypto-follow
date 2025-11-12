import { createClient } from '@/utils/supabase/server'
import CryptoChart from '@/components/CryptoChart'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function CryptoDetailPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()
    const { id } = params // This is the symbol (e.g., BTC)

    // Fetch Asset Details
    const { data: asset } = await supabase
        .from('crypto_assets')
        .select('*')
        .eq('symbol', id)
        .single()

    // Fetch Historical Data (Last 7 days for simplicity)
    const { data: history } = await supabase
        .from('market_data')
        .select('price_usd, timestamp')
        .eq('crypto_symbol', id)
        .order('timestamp', { ascending: true })
        // In a real app, limit or aggregate this
        .limit(100)

    const chartData = history?.map(h => ({
        timestamp: h.timestamp,
        price: h.price_usd
    })) || []

    return (
        <div className="min-h-screen bg-gray-950 text-white p-8">
            <div className="max-w-7xl mx-auto">
                <Link href="/dashboard" className="inline-flex items-center text-gray-400 hover:text-white mb-8">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Retour au Tableau de Bord
                </Link>

                <div className="grid gap-8">
                    <div className="bg-gray-900 p-8 rounded-xl border border-gray-800">
                        <div className="flex items-baseline gap-4 mb-2">
                            <h1 className="text-4xl font-bold">{asset?.name}</h1>
                            <span className="text-xl text-gray-500">{asset?.symbol}</span>
                        </div>
                        <div className="text-2xl font-mono text-indigo-400">
                            ${chartData[chartData.length - 1]?.price?.toLocaleString()}
                        </div>
                    </div>

                    <div className="bg-gray-900 p-8 rounded-xl border border-gray-800">
                        <h2 className="text-xl font-semibold mb-6">Historique des Prix</h2>
                        <CryptoChart data={chartData} />
                    </div>
                </div>
            </div>
        </div>
    )
}
