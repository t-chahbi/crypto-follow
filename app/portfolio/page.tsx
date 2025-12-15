import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Wallet, TrendingUp, TrendingDown, PiggyBank, BarChart3, DollarSign, Plus } from 'lucide-react'
import { getMarketData } from '@/utils/coingecko'
import { calculatePortfolioSummary, formatPnL, formatPercentage } from '@/utils/portfolio'
import AddTransactionForm from '@/components/AddTransactionForm'
import DeleteTransactionButton from '@/components/DeleteTransactionButton'
import DepositForm from '@/components/DepositForm'
import Navbar from '@/components/Navbar'

export const dynamic = 'force-dynamic'

export default async function PortfolioPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', user.id)
        .single()

    const walletBalance = profile?.balance ?? 10000

    const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .in('type', ['BUY', 'SELL'])
        .order('timestamp', { ascending: false })

    const marketData = await getMarketData()
    const safeMarketData = Array.isArray(marketData) ? marketData : []
    const priceMap = new Map(safeMarketData.map((coin: { symbol: string; current_price: number }) =>
        [coin.symbol.toUpperCase(), coin.current_price]
    ))

    const summary = calculatePortfolioSummary(transactions || [], priceMap)
    const pnlFormatted = formatPnL(summary.totalPnl)
    const pnlPercentFormatted = formatPercentage(summary.totalPnlPercentage)
    const holdingsMap = new Map(summary.holdings.map(h => [h.symbol, h.amount]))
    const totalPortfolioValue = walletBalance + summary.currentValue

    return (
        <div className="min-h-screen bg-[#0f1629]">
            <Navbar />

            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="bg-orb w-[500px] h-[500px] bg-emerald-600/15 top-[-100px] left-[-100px]" />
                <div className="bg-orb w-[400px] h-[400px] bg-purple-600/10 bottom-[10%] right-[-100px]" style={{ animationDelay: '-8s' }} />
            </div>

            <main className="pt-24 md:pt-28 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Header */}
                    <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl lg:text-5xl font-bold mb-2">
                                <span className="gradient-text">Mon Portefeuille</span>
                            </h1>
                            <p className="text-gray-400 text-lg">Gérez vos investissements virtuels</p>
                        </div>
                        <div className="flex gap-3">
                            <DepositForm currentBalance={walletBalance} />
                            <AddTransactionForm currentBalance={walletBalance} holdings={holdingsMap} />
                        </div>
                    </header>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="glass-card p-5 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative">
                                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Wallet className="w-6 h-6 text-indigo-400" />
                                </div>
                                <p className="text-gray-400 text-sm mb-1">Solde Wallet</p>
                                <p className="text-2xl font-bold font-mono text-indigo-400">
                                    ${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>

                        <div className="glass-card p-5 group">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <PiggyBank className="w-6 h-6 text-blue-400" />
                            </div>
                            <p className="text-gray-400 text-sm mb-1">Valeur Cryptos</p>
                            <p className="text-2xl font-bold font-mono">
                                ${summary.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                        </div>

                        <div className="glass-card p-5 group">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${pnlFormatted.isPositive ? 'bg-emerald-500/20' : 'bg-red-500/20'
                                }`}>
                                {pnlFormatted.isPositive ? <TrendingUp className="w-6 h-6 text-emerald-400" /> : <TrendingDown className="w-6 h-6 text-red-400" />}
                            </div>
                            <p className="text-gray-400 text-sm mb-1">P&L Total</p>
                            <p className={`text-2xl font-bold font-mono ${pnlFormatted.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                                {pnlFormatted.value}
                            </p>
                        </div>

                        <div className="glass-card p-5 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-cyan-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative">
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <BarChart3 className="w-6 h-6 text-emerald-400" />
                                </div>
                                <p className="text-gray-400 text-sm mb-1">Valeur Totale</p>
                                <p className="text-2xl font-bold font-mono text-emerald-400">
                                    ${totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Holdings */}
                        <section className="glass-card p-6">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Wallet size={20} className="text-indigo-400" />
                                Mes Cryptos
                            </h2>
                            <div className="space-y-3">
                                {summary.holdings.map((holding) => {
                                    const pnl = formatPnL(holding.pnl)
                                    const percent = formatPercentage(holding.pnlPercentage)
                                    return (
                                        <div key={holding.symbol} className="flex justify-between items-center p-4 bg-white/5 rounded-xl hover:bg-white/8 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                                    {holding.symbol.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold">{holding.symbol}</p>
                                                    <p className="text-sm text-gray-500">{holding.amount.toFixed(4)} unités</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-mono font-bold">${holding.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                                <div className="flex items-center gap-2 justify-end">
                                                    <span className={`text-sm ${pnl.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>{pnl.value}</span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${pnl.isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                                        {percent.value}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                                {summary.holdings.length === 0 && (
                                    <div className="text-center py-12 text-gray-500">
                                        <Wallet className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                        <p className="font-medium">Aucune crypto</p>
                                        <p className="text-sm">Cliquez sur "Trader" pour acheter</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Transactions */}
                        <section className="glass-card p-6">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <DollarSign size={20} className="text-indigo-400" />
                                Historique
                            </h2>
                            <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                {transactions?.slice(0, 10).map((tx) => (
                                    <div key={tx.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${tx.type === 'BUY' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                                                {tx.type === 'BUY' ? <TrendingUp size={16} className="text-emerald-400" /> : <TrendingDown size={16} className="text-red-400" />}
                                            </div>
                                            <div>
                                                <p className="font-medium">
                                                    <span className={tx.type === 'BUY' ? 'text-emerald-400' : 'text-red-400'}>{tx.type === 'BUY' ? 'Achat' : 'Vente'}</span>
                                                    <span className="text-gray-300 ml-2">{tx.crypto_symbol}</span>
                                                </p>
                                                <p className="text-xs text-gray-500">{new Date(tx.timestamp).toLocaleDateString('fr-FR')}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-right">
                                                <p className="font-mono text-sm">{Number(tx.amount).toFixed(4)}</p>
                                                <p className="text-xs text-gray-500">${Number(tx.total_cost || tx.amount * tx.price_per_coin).toLocaleString()}</p>
                                            </div>
                                            <DeleteTransactionButton transactionId={tx.id} />
                                        </div>
                                    </div>
                                ))}
                                {(!transactions || transactions.length === 0) && (
                                    <div className="text-center py-12 text-gray-500">
                                        <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                        <p>Aucune transaction</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    )
}
