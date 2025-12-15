import { getCoinDetails, getCoinHistory } from '@/utils/coingecko'
import DashboardChart from '@/components/DashboardChart'
import PredictionCard from '@/components/PredictionCard'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, BarChart3, Activity, ExternalLink } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function CryptoDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    try {
        const [coin, history] = await Promise.all([
            getCoinDetails(id),
            getCoinHistory(id)
        ])

        if (!coin) {
            return (
                <div className="min-h-screen bg-[#030712] flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-gray-400">Cryptomonnaie non trouvée</p>
                        <Link href="/dashboard" className="text-indigo-400 hover:underline mt-4 inline-block">
                            Retour au Dashboard
                        </Link>
                    </div>
                </div>
            )
        }

        const priceChange24h = coin.market_data?.price_change_percentage_24h || 0
        const isPositive = priceChange24h >= 0

        return (
            <div className="min-h-screen bg-[#0f1629]">
                <Navbar />

                <div className="fixed inset-0 -z-10 overflow-hidden">
                    <div className={`bg-orb w-[500px] h-[500px] ${isPositive ? 'bg-emerald-600/15' : 'bg-red-600/15'} top-[-100px] right-[-100px]`} />
                    <div className="bg-orb w-[400px] h-[400px] bg-indigo-600/10 bottom-[20%] left-[-100px]" style={{ animationDelay: '-5s' }} />
                </div>

                <main className="pt-24 md:pt-28 pb-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-6xl mx-auto space-y-8">
                        {/* Back Link */}
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Retour au Dashboard
                        </Link>

                        {/* Header Card */}
                        <div className="glass-card p-6 md:p-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-5">
                                    <div className="relative">
                                        <img
                                            src={coin.image?.large}
                                            alt={coin.name}
                                            className="w-20 h-20 rounded-2xl ring-4 ring-white/10"
                                        />
                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gray-900 border-2 border-gray-800 flex items-center justify-center">
                                            <span className="text-[10px] font-bold">#{coin.market_cap_rank}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h1 className="text-3xl md:text-4xl font-bold mb-1">{coin.name}</h1>
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg text-gray-400 uppercase font-medium">{coin.symbol}</span>
                                            {coin.links?.homepage?.[0] && (
                                                <a
                                                    href={coin.links.homepage[0]}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-indigo-400 hover:text-indigo-300 transition-colors"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-left md:text-right">
                                    <p className="text-sm text-gray-400 mb-1">Prix Actuel</p>
                                    <div className="flex items-center gap-4">
                                        <span className="text-4xl md:text-5xl font-bold font-mono">
                                            ${coin.market_data?.current_price?.usd?.toLocaleString()}
                                        </span>
                                        <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-lg font-semibold ${isPositive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                                            }`}>
                                            {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                                            {isPositive ? '+' : ''}{priceChange24h.toFixed(2)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard
                                icon={<BarChart3 className="w-5 h-5 text-indigo-400" />}
                                label="Market Cap"
                                value={`$${(coin.market_data?.market_cap?.usd / 1e9).toFixed(2)}B`}
                            />
                            <StatCard
                                icon={<Activity className="w-5 h-5 text-emerald-400" />}
                                label="Volume 24h"
                                value={`$${(coin.market_data?.total_volume?.usd / 1e9).toFixed(2)}B`}
                            />
                            <StatCard
                                icon={<TrendingUp className="w-5 h-5 text-cyan-400" />}
                                label="ATH"
                                value={`$${coin.market_data?.ath?.usd?.toLocaleString()}`}
                            />
                            <StatCard
                                icon={<DollarSign className="w-5 h-5 text-amber-400" />}
                                label="Supply"
                                value={`${(coin.market_data?.circulating_supply / 1e6).toFixed(1)}M`}
                            />
                        </div>

                        {/* Chart */}
                        <DashboardChart data={history} coinName={coin.name} />

                        {/* Prediction */}
                        <PredictionCard historicalData={history} coinName={coin.name} />
                    </div>
                </main>
            </div>
        )
    } catch (error) {
        console.error("Error in CryptoDetailPage:", error)
        return (
            <div className="min-h-screen bg-[#030712] flex items-center justify-center">
                <div className="text-center text-red-400">
                    <p className="text-xl">Une erreur est survenue</p>
                    <Link href="/dashboard" className="text-indigo-400 hover:underline mt-4 inline-block">
                        Retour au Dashboard
                    </Link>
                </div>
            </div>
        )
    }
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="glass-card p-4 group">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {icon}
                </div>
            </div>
            <p className="text-sm text-gray-400">{label}</p>
            <p className="text-lg font-bold font-mono">{value}</p>
        </div>
    )
}
