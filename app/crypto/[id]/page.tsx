import { getCoinDetails, getCoinHistory } from '@/utils/coingecko'
import DashboardChart from '@/components/DashboardChart'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
// import { Card, CardBody } from "@heroui/react"

export const dynamic = 'force-dynamic'

export default async function CryptoDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    try {
        const [coin, history] = await Promise.all([
            getCoinDetails(id),
            getCoinHistory(id)
        ])

        if (!coin) {
            return <div className="min-h-screen bg-black text-white p-8">Cryptomonnaie non trouvée</div>
        }

        return (
            <div className="min-h-screen bg-black text-white p-8">
                <div className="max-w-7xl mx-auto">
                    <Link href="/dashboard" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Retour au Tableau de Bord
                    </Link>

                    <div className="grid gap-8">
                        <div className="bg-white/5 border border-white/10 p-8 rounded-xl">
                            <div className="flex items-center gap-4 mb-6">
                                <img src={coin.image?.large} alt={coin.name} className="w-16 h-16 rounded-full" />
                                <div>
                                    <h1 className="text-4xl font-bold">{coin.name}</h1>
                                    <span className="text-xl text-gray-500 uppercase">{coin.symbol}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div>
                                    <p className="text-gray-400 mb-1">Prix Actuel</p>
                                    <div className="text-3xl font-mono font-bold text-indigo-400">
                                        ${coin.market_data?.current_price?.usd?.toLocaleString()}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-gray-400 mb-1">Capitalisation</p>
                                    <div className="text-2xl font-mono">
                                        ${coin.market_data?.market_cap?.usd?.toLocaleString()}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-gray-400 mb-1">Volume 24h</p>
                                    <div className="text-2xl font-mono">
                                        ${coin.market_data?.total_volume?.usd?.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DashboardChart data={history} />
                    </div>
                </div>
            </div>
        )
    } catch (error) {
        console.error("Error in CryptoDetailPage:", error)
        return <div className="min-h-screen bg-black text-white p-8">Une erreur est survenue lors du chargement des données.</div>
    }
}
