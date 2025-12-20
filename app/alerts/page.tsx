import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Bell, BellOff } from 'lucide-react'
import CreateAlertForm from '@/components/CreateAlertForm'
import DeleteAlertButton from '@/components/DeleteAlertButton'

export const dynamic = 'force-dynamic'

export default async function AlertsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Fetch Alerts
    const { data: alerts } = await supabase
        .from('alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    const activeAlerts = alerts?.filter(a => a.is_active) || []
    const inactiveAlerts = alerts?.filter(a => !a.is_active) || []

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-7xl mx-auto">
                <Link href="/dashboard" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Retour au Tableau de Bord
                </Link>

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Alertes de Prix</h1>
                        <p className="text-gray-400 mt-1">Recevez des notifications quand vos seuils sont atteints</p>
                    </div>
                    <CreateAlertForm />
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/20 rounded-lg">
                                <Bell className="text-indigo-400" size={20} />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Alertes Actives</p>
                                <p className="text-2xl font-bold">{activeAlerts.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-500/20 rounded-lg">
                                <BellOff className="text-gray-400" size={20} />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Alertes Déclenchées</p>
                                <p className="text-2xl font-bold">{inactiveAlerts.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                                <Bell className="text-green-400" size={20} />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Total Alertes</p>
                                <p className="text-2xl font-bold">{alerts?.length || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-white/5">
                            <tr>
                                <th className="p-4 font-medium text-gray-400">Actif</th>
                                <th className="p-4 font-medium text-gray-400">Condition</th>
                                <th className="p-4 font-medium text-gray-400">Prix Cible</th>
                                <th className="p-4 font-medium text-gray-400">Statut</th>
                                <th className="p-4 font-medium text-gray-400">Créée le</th>
                                <th className="p-4 font-medium text-gray-400">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {alerts?.map((alert) => (
                                <tr key={alert.id} className="hover:bg-white/5">
                                    <td className="p-4 font-bold">{alert.crypto_symbol}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${alert.condition === 'ABOVE' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                                            }`}>
                                            {alert.condition === 'ABOVE' ? 'SUPÉRIEUR À' : 'INFÉRIEUR À'}
                                        </span>
                                    </td>
                                    <td className="p-4 font-mono">${Number(alert.target_price).toLocaleString()}</td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${alert.is_active ? 'bg-blue-900 text-blue-300' : 'bg-gray-700 text-gray-300'
                                            }`}>
                                            {alert.is_active ? 'Actif' : 'Déclenché'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-400 text-sm">
                                        {new Date(alert.created_at).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="p-4">
                                        <DeleteAlertButton alertId={alert.id} />
                                    </td>
                                </tr>
                            ))}
                            {(!alerts || alerts.length === 0) && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">
                                        Aucune alerte configurée. Créez votre première alerte pour être notifié.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
