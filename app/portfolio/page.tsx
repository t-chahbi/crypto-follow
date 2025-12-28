import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, TrendingDown, Wallet, DollarSign, PiggyBank, BarChart3 } from 'lucide-react'
import { getMarketData } from '@/utils/coingecko'
import { calculatePortfolioSummary, formatPnL, formatPercentage } from '@/utils/portfolio'
import AddTransactionForm from '@/components/AddTransactionForm'
import DeleteTransactionButton from '@/components/DeleteTransactionButton'

export const dynamic = 'force-dynamic'

export default async function PortfolioPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Fetch Transactions
    const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
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

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-7xl mx-auto">
                <Link href="/dashboard" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Retour au Tableau de Bord
                </Link>

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Mon Portefeuille Virtuel</h1>
                        <p className="text-gray-400 mt-1">Simulez vos investissements sans risque</p>
                    </div>
                    <AddTransactionForm />
                </div>

                {/* Portfolio Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/20 rounded-lg">
                                <Wallet className="text-indigo-400" size={20} />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Valeur Actuelle</p>
                                <p className="text-2xl font-mono font-bold text-indigo-400">
                                    ${summary.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <PiggyBank className="text-blue-400" size={20} />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Total Investi</p>
                                <p className="text-2xl font-mono font-bold">
                                    ${summary.totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${pnlFormatted.isPositive ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                {pnlFormatted.isPositive
                                    ? <TrendingUp className="text-green-400" size={20} />
                                    : <TrendingDown className="text-red-400" size={20} />
                                }
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">P&L Total</p>
                                <p className={`text-2xl font-mono font-bold ${pnlFormatted.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                    {pnlFormatted.value}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${pnlPercentFormatted.isPositive ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                <BarChart3 className={pnlPercentFormatted.isPositive ? 'text-green-400' : 'text-red-400'} size={20} />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Rendement</p>
                                <p className={`text-2xl font-mono font-bold ${pnlPercentFormatted.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                    {pnlPercentFormatted.value}
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
                            Avoirs Actuels
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
                                <p className="text-gray-500 text-center py-4">Aucun actif pour le moment. Ajoutez votre première transaction !</p>
                            )}
                        </div>
                    </div>

                    {/* Transaction History */}
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <DollarSign size={20} className="text-indigo-400" />
                            Transactions Récentes
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
                                                {new Date(tx.timestamp).toLocaleDateString('fr-FR')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <div className="font-mono">{Number(tx.amount).toFixed(4)}</div>
                                            <div className="text-xs text-gray-500">
                                                @ ${Number(tx.price_per_coin).toLocaleString()}
                                            </div>
                                        </div>
                                        <DeleteTransactionButton transactionId={tx.id} />
                                    </div>
                                </div>
                            ))}
                            {(!transactions || transactions.length === 0) && (
                                <p className="text-gray-500 text-center py-4">Aucune transaction pour le moment.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
