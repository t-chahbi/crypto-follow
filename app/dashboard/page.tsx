import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DashboardTable from '@/components/DashboardTable'
import DashboardHeaderButtons from '@/components/DashboardHeaderButtons'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            redirect('/login')
        }

        // Fetch latest market data for each asset
        const { data: assets, error: dbError } = await supabase
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

        if (dbError) {
            console.error("DB Error:", dbError)
        }

        // Process data to get the latest entry for each
        const processedAssets = assets?.map(asset => {
            const latestData = asset.market_data?.[0] || {}
            return {
                ...asset,
                ...latestData
            }
        }) || []

        return (
            <div className="min-h-screen bg-black text-white p-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    <header className="flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                                Tableau de Bord
                            </h1>
                            <p className="text-default-500 mt-2">Suivez le marché en temps réel</p>
                        </div>
                        <DashboardHeaderButtons />
                    </header>

                    <DashboardTable assets={processedAssets} />
                </div>
            </div>
        )
    } catch (error) {
        if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) {
            throw error
        }
        console.error("Dashboard Error:", error)
        return <div>Error loading dashboard</div>
    }
}
