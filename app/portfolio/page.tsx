import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, TrendingDown, Wallet, DollarSign, PiggyBank, BarChart3 } from 'lucide-react'
import { getMarketData } from '@/utils/coingecko'
import { calculatePortfolioSummary, formatPnL, formatPercentage } from '@/utils/portfolio'
import AddTransactionForm from '@/components/AddTransactionForm'
import DeleteTransactionButton from '@/components/DeleteTransactionButton'
import DepositForm from '@/components/DepositForm'

export const dynamic = 'force-dynamic'

export default async function PortfolioPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Fetch user profile with balance
    const { data: profile } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', user.id)
        .single()

    const walletBalance = profile?.balance ?? 10000 // Default $10,000

    // Fetch Transactions
    const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .in('type', ['BUY', 'SELL']) // Only crypto transactions
        .order('timestamp', { ascending: false })

    // Fetch Current Prices
    const marketData = await getMarketData()
    const safeMarketData = Array.isArray(marketData) ? marketData : []
    const priceMap = new Map(safeMarketData.map((coin: { symbol: string; current_price: number }) =>
        [coin.symbol.toUpperCase(), coin.current_price]
    ))

    // Calculate portfolio summary with P&L
    const summary = calculatePortfolioSummary(transactions || [], priceMap)
    const pnlFormatted = formatPnL(summary.totalPnl)
    const pnlPercentFormatted = formatPercentage(summary.totalPnlPercentage)

    // Create holdings map for the transaction form
    const holdingsMap = new Map(summary.holdings.map(h => [h.symbol, h.amount]))

    // Total portfolio value = wallet balance + crypto holdings value
    const totalPortfolioValue = walletBalance + summary.currentValue

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-7xl mx-auto">
                <Link href="/dashboard" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Retour au Tableau de Bord
                </Link>

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Mon Portefeuille</h1>
                        <p className="text-gray-400 mt-1">Gérez vos investissements virtuels</p>
                    </div>
                    <div className="flex gap-3">
                        <DepositForm currentBalance={walletBalance} />
                        <AddTransactionForm currentBalance={walletBalance} holdings={holdingsMap} />
                    </div>
                </div>

                {/* Main Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {/* Wallet Balance */}
                    <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-xl p-5">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-indigo-500/30 rounded-lg">
                                <Wallet className="text-indigo-400" size={24} />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Solde Wallet (USD)</p>
                                <p className="text-2xl font-mono font-bold text-indigo-400">
                                    ${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Crypto Holdings Value */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-500/20 rounded-lg">
                                <PiggyBank className="text-blue-400" size={24} />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Valeur Cryptos</p>
                                <p className="text-2xl font-mono font-bold">
                                    ${summary.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* P&L */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-lg ${pnlFormatted.isPositive ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                {pnlFormatted.isPositive
                                    ? <TrendingUp className="text-green-400" size={24} />
                                    : <TrendingDown className="text-red-400" size={24} />
                                }
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">P&L Cryptos</p>
                                <p className={`text-2xl font-mono font-bold ${pnlFormatted.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                    {pnlFormatted.value}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Total Portfolio Value */}
                    <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-5">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-500/30 rounded-lg">
                                <BarChart3 className="text-green-400" size={24} />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Valeur Totale</p>
                                <p className="text-2xl font-mono font-bold text-green-400">
                                    ${totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Holdings Card */}
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Wallet size={20} className="text-indigo-400" />
                            Mes Cryptos
                        </h2>
                        <div className="space-y-3">
                            {summary.holdings.map((holding) => {
                                const holdingPnl = formatPnL(holding.pnl)
                                const holdingPercent = formatPercentage(holding.pnlPercentage)
                                return (
                                    <div key={holding.symbol} className="flex justify-between items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                                        <div>
                                            <span className="font-bold text-lg block">{holding.symbol}</span>
                                            <span className="text-sm text-gray-400">{holding.amount.toFixed(4)} unités</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-mono font-bold block">
                                                ${holding.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                            <div className="flex items-center gap-2 justify-end">
                                                <span className={`text-sm ${holdingPnl.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                                    {holdingPnl.value}
                                                </span>
                                                <span className={`text-xs px-1.5 py-0.5 rounded ${holdingPnl.isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                    {holdingPercent.value}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                            {summary.holdings.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <Wallet className="mx-auto mb-2 opacity-50" size={32} />
                                    <p>Aucune crypto pour le moment.</p>
                                    <p className="text-sm">Cliquez sur "Trader" pour acheter votre première crypto !</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Transaction History */}
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <DollarSign size={20} className="text-indigo-400" />
                            Historique des Transactions
                        </h2>
                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                            {transactions?.slice(0, 10).map((tx) => (
                                <div key={tx.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-1.5 rounded-lg ${tx.type === 'BUY' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                            {tx.type === 'BUY'
                                                ? <TrendingUp size={16} className="text-green-400" />
                                                : <TrendingDown size={16} className="text-red-400" />
                                            }
                                        </div>
                                        <div>
                                            <span className={`font-bold ${tx.type === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                                                {tx.type === 'BUY' ? 'ACHAT' : 'VENTE'}
                                            </span>
                                            <span className="ml-2 text-gray-300">{tx.crypto_symbol}</span>
                                            <p className="text-xs text-gray-500">
                                                {new Date(tx.timestamp).toLocaleDateString('fr-FR')} à {new Date(tx.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <div className="font-mono">{Number(tx.amount).toFixed(4)} {tx.crypto_symbol}</div>
                                            <div className="text-xs text-gray-500">
                                                @ ${Number(tx.price_per_coin).toLocaleString()} → ${Number(tx.total_cost || tx.amount * tx.price_per_coin).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                        <DeleteTransactionButton transactionId={tx.id} />
                                    </div>
                                </div>
                            ))}
                            {(!transactions || transactions.length === 0) && (
                                <div className="text-center py-8 text-gray-500">
                                    <DollarSign className="mx-auto mb-2 opacity-50" size={32} />
                                    <p>Aucune transaction pour le moment.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
