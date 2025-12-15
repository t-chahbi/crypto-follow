'use client'

import { TrendingUp, DollarSign, BarChart3, Coins, Activity } from 'lucide-react'

interface MarketStatsProps {
    stats: any
}

export default function MarketStats({ stats }: MarketStatsProps) {
    if (!stats?.data) return null

    const data = stats.data
    const marketCap = data.total_market_cap?.usd || 0
    const volume = data.total_volume?.usd || 0
    const btcDominance = data.market_cap_percentage?.btc || 0
    const activeCryptos = data.active_cryptocurrencies || 0
    const marketCapChange = data.market_cap_change_percentage_24h_usd || 0

    const statsData = [
        {
            label: 'Market Cap Global',
            value: `$${(marketCap / 1e12).toFixed(2)}T`,
            change: marketCapChange,
            icon: BarChart3,
            iconBg: 'bg-indigo-500/20',
            iconColor: 'text-indigo-400',
        },
        {
            label: 'Volume 24h',
            value: `$${(volume / 1e9).toFixed(0)}B`,
            icon: Activity,
            iconBg: 'bg-emerald-500/20',
            iconColor: 'text-emerald-400',
        },
        {
            label: 'Dominance BTC',
            value: `${btcDominance.toFixed(1)}%`,
            icon: Coins,
            iconBg: 'bg-amber-500/20',
            iconColor: 'text-amber-400',
        },
        {
            label: 'Cryptos Actives',
            value: activeCryptos.toLocaleString(),
            icon: TrendingUp,
            iconBg: 'bg-purple-500/20',
            iconColor: 'text-purple-400',
        },
    ]

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statsData.map((stat, index) => {
                const Icon = stat.icon
                return (
                    <div
                        key={index}
                        className="stat-card group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl ${stat.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                            </div>
                            {stat.change !== undefined && (
                                <span className={`text-sm font-semibold px-2 py-1 rounded-full ${stat.change >= 0
                                        ? 'text-emerald-400 bg-emerald-500/10'
                                        : 'text-red-400 bg-red-500/10'
                                    }`}>
                                    {stat.change >= 0 ? '+' : ''}{stat.change.toFixed(2)}%
                                </span>
                            )}
                        </div>
                        <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold font-mono">{stat.value}</p>
                    </div>
                )
            })}
        </div>
    )
}
