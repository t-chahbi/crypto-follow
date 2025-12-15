import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import DashboardTable from '@/components/DashboardTable'
import MarketStats from '@/components/MarketStats'
import Navbar from '@/components/Navbar'
import { getMarketData, getGlobalStats } from '@/utils/coingecko'
import { calculatePortfolioSummary } from '@/utils/portfolio'
import { TrendingUp, TrendingDown, Activity, Zap, PiggyBank } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            redirect('/login')
        }

        // Fetch user profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('balance')
            .eq('id', user.id)
            .single()

        const [assets, globalStats] = await Promise.all([
            getMarketData(),
            getGlobalStats()
        ])

        // Fetch user transactions to calculate holdings
        const { data: transactions } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .in('type', ['BUY', 'SELL'])

        const safeAssets = Array.isArray(assets) ? assets : []

        // Calculate portfolio value
        const priceMap = new Map(safeAssets.map((coin: { symbol: string; current_price: number }) =>
            [coin.symbol.toUpperCase(), coin.current_price]
        ))
        const portfolioSummary = calculatePortfolioSummary(transactions || [], priceMap)

        const topGainer = safeAssets.reduce((max, coin) =>
            (coin.price_change_percentage_24h > (max?.price_change_percentage_24h || -Infinity)) ? coin : max
            , null as any)
        const topLoser = safeAssets.reduce((min, coin) =>
            (coin.price_change_percentage_24h < (min?.price_change_percentage_24h || Infinity)) ? coin : min
            , null as any)

        return (
            <div className="min-h-screen bg-[#0f1629]">
                <Navbar />

                {/* Background Effects */}
                <div className="fixed inset-0 -z-10 overflow-hidden">
                    <div className="bg-orb w-[500px] h-[500px] bg-indigo-600/20 top-[-100px] right-[-100px]" />
                    <div className="bg-orb w-[400px] h-[400px] bg-purple-600/15 bottom-[20%] left-[-150px]" style={{ animationDelay: '-7s' }} />
                </div>

                <main className="pt-24 md:pt-28 pb-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {/* Header */}
                        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                            <div>
                                <h1 className="text-4xl lg:text-5xl font-bold mb-2">
                                    <span className="gradient-text">Dashboard</span>
                                </h1>
                                <p className="text-gray-400 text-lg">
                                    Bienvenue, <span className="text-white font-medium">{user.email?.split('@')[0]}</span> 👋
                                </p>
                            </div>

                            {/* Quick Stats */}
                            <div className="flex gap-3">
                                <Link href="/portfolio" className="glass-card px-5 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                                        <Activity className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Mon Wallet</p>
                                        <p className="font-bold text-lg">${(profile?.balance ?? 10000).toLocaleString()}</p>
                                    </div>
                                </Link>
                                <Link href="/portfolio" className="glass-card px-5 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                        <PiggyBank className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Mes Cryptos</p>
                                        <p className="font-bold text-lg text-emerald-400">${portfolioSummary.currentValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                    </div>
                                </Link>
                            </div>
                        </header>

                        {/* Market Stats Grid */}
                        <MarketStats stats={globalStats} />

                        {/* Top Movers */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {topGainer && (
                                <div className="glass-card p-5 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                            <TrendingUp className="w-6 h-6 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-400">Top Gainer 24h</p>
                                            <p className="font-bold text-lg">{topGainer.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-mono font-bold">${topGainer.current_price?.toLocaleString()}</p>
                                        <p className="text-emerald-400 font-semibold">
                                            +{topGainer.price_change_percentage_24h?.toFixed(2)}%
                                        </p>
                                    </div>
                                </div>
                            )}
                            {topLoser && (
                                <div className="glass-card p-5 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                                            <TrendingDown className="w-6 h-6 text-red-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-400">Top Loser 24h</p>
                                            <p className="font-bold text-lg">{topLoser.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-mono font-bold">${topLoser.current_price?.toLocaleString()}</p>
                                        <p className="text-red-400 font-semibold">
                                            {topLoser.price_change_percentage_24h?.toFixed(2)}%
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Crypto Table */}
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold">Top Cryptomonnaies</h2>
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <Zap className="w-4 h-4 text-yellow-400" />
                                    Données CoinGecko
                                </div>
                            </div>
                            <DashboardTable assets={safeAssets} />
                        </section>
                    </div>
                </main>
            </div>
        )
    } catch (error) {
        if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) {
            throw error
        }
        console.error("Dashboard Error:", error)
        return <div className="min-h-screen bg-black flex items-center justify-center text-red-400">Error loading dashboard</div>
    }
}
