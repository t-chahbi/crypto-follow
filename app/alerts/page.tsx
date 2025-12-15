import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Bell, BellOff, Plus, Trash2 } from 'lucide-react'
import CreateAlertForm from '@/components/CreateAlertForm'
import DeleteAlertButton from '@/components/DeleteAlertButton'
import Navbar from '@/components/Navbar'

export const dynamic = 'force-dynamic'

export default async function AlertsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: alerts } = await supabase
        .from('alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    const activeAlerts = alerts?.filter(a => a.is_active) || []
    const triggeredAlerts = alerts?.filter(a => !a.is_active) || []

    return (
        <div className="min-h-screen bg-[#0f1629]">
            <Navbar />

            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="bg-orb w-[500px] h-[500px] bg-pink-600/15 top-[-100px] right-[-100px]" />
                <div className="bg-orb w-[400px] h-[400px] bg-indigo-600/10 bottom-[20%] left-[-100px]" style={{ animationDelay: '-5s' }} />
            </div>

            <main className="pt-24 md:pt-28 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto space-y-8">
                    {/* Header */}
                    <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl lg:text-5xl font-bold mb-2">
                                <span className="text-white">Mes Alertes</span>
                            </h1>
                            <p className="text-gray-400 text-lg">Soyez notifié quand vos seuils sont atteints</p>
                        </div>
                        <CreateAlertForm />
                    </header>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="glass-card p-5 text-center group">
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                <Bell className="w-6 h-6 text-indigo-400" />
                            </div>
                            <p className="text-3xl font-bold">{activeAlerts.length}</p>
                            <p className="text-sm text-gray-400">Actives</p>
                        </div>
                        <div className="glass-card p-5 text-center group">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                <BellOff className="w-6 h-6 text-emerald-400" />
                            </div>
                            <p className="text-3xl font-bold">{triggeredAlerts.length}</p>
                            <p className="text-sm text-gray-400">Déclenchées</p>
                        </div>
                        <div className="glass-card p-5 text-center group">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                <Bell className="w-6 h-6 text-purple-400" />
                            </div>
                            <p className="text-3xl font-bold">{alerts?.length || 0}</p>
                            <p className="text-sm text-gray-400">Total</p>
                        </div>
                    </div>

                    {/* Alerts List */}
                    <section className="glass-card overflow-hidden">
                        <div className="p-5 border-b border-white/10">
                            <h2 className="text-lg font-bold">Toutes les Alertes</h2>
                        </div>
                        <div className="divide-y divide-white/5">
                            {alerts?.map((alert) => (
                                <div key={alert.id} className="p-5 flex items-center justify-between hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${alert.is_active
                                            ? 'bg-indigo-500/20 text-indigo-400'
                                            : 'bg-gray-500/20 text-gray-400'
                                            }`}>
                                            {alert.crypto_symbol?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg">{alert.crypto_symbol}</p>
                                            <p className="text-sm text-gray-400">
                                                {alert.condition === 'ABOVE' ? 'Supérieur à' : 'Inférieur à'}{' '}
                                                <span className="font-mono text-white">${Number(alert.target_price).toLocaleString()}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${alert.is_active
                                                ? 'bg-indigo-500/20 text-indigo-400'
                                                : 'bg-emerald-500/20 text-emerald-400'
                                                }`}>
                                                {alert.is_active ? 'Active' : 'Déclenchée'}
                                            </span>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {new Date(alert.created_at).toLocaleDateString('fr-FR')}
                                            </p>
                                        </div>
                                        <DeleteAlertButton alertId={alert.id} />
                                    </div>
                                </div>
                            ))}
                            {(!alerts || alerts.length === 0) && (
                                <div className="p-12 text-center text-gray-500">
                                    <Bell className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                    <p className="text-lg font-medium mb-2">Aucune alerte configurée</p>
                                    <p className="text-sm">Créez votre première alerte pour être notifié</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    )
}
