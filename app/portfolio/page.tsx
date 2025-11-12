import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

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

    // Calculate Holdings (Simplified)
    const holdings: Record<string, number> = {}
    transactions?.forEach(tx => {
        const amount = Number(tx.amount)
        if (tx.type === 'BUY') {
            holdings[tx.crypto_symbol] = (holdings[tx.crypto_symbol] || 0) + amount
        } else {
            holdings[tx.crypto_symbol] = (holdings[tx.crypto_symbol] || 0) - amount
        }
    })

    return (
        <div className="min-h-screen bg-gray-950 text-white p-8">
            <div className="max-w-7xl mx-auto">
                <Link href="/dashboard" className="inline-flex items-center text-gray-400 hover:text-white mb-8">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Retour au Tableau de Bord
                </Link>

                <h1 className="text-3xl font-bold mb-8">Mon Portefeuille</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Holdings Card */}
                    <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                        <h2 className="text-xl font-semibold mb-4">Avoirs Actuels</h2>
                        <div className="space-y-4">
                            {Object.entries(holdings).map(([symbol, amount]) => (
                                <div key={symbol} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                                    <span className="font-bold">{symbol}</span>
                                    <span className="font-mono">{amount.toFixed(4)}</span>
                                </div>
                            ))}
                            {Object.keys(holdings).length === 0 && (
                                <p className="text-gray-500">Aucun actif pour le moment.</p>
                            )}
                        </div>
                    </div>

                    {/* Transaction History */}
                    <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                        <h2 className="text-xl font-semibold mb-4">Transactions Récentes</h2>
                        <div className="space-y-4">
                            {transactions?.map((tx) => (
                                <div key={tx.id} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                                    <div>
                                        <span className={`font-bold ${tx.type === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                                            {tx.type === 'BUY' ? 'ACHAT' : 'VENTE'}
                                        </span>
                                        <span className="ml-2 text-gray-300">{tx.crypto_symbol}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-mono">{Number(tx.amount).toFixed(4)}</div>
                                        <div className="text-xs text-gray-500">
                                            @ ${Number(tx.price_per_coin).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {(!transactions || transactions.length === 0) && (
                                <p className="text-gray-500">Aucune transaction pour le moment.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
