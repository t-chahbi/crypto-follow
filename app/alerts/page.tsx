import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trash2 } from 'lucide-react'

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

    // Action to create alert (Server Action would be better, but keeping it simple for now)
    // We'll just display the list. Creation would typically be a client component form.

    return (
        <div className="min-h-screen bg-gray-950 text-white p-8">
            <div className="max-w-7xl mx-auto">
                <Link href="/dashboard" className="inline-flex items-center text-gray-400 hover:text-white mb-8">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                </Link>

                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Price Alerts</h1>
                    {/* <CreateAlertButton /> would go here */}
                </div>

                <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-800/50">
                            <tr>
                                <th className="p-4 font-medium text-gray-400">Asset</th>
                                <th className="p-4 font-medium text-gray-400">Condition</th>
                                <th className="p-4 font-medium text-gray-400">Target Price</th>
                                <th className="p-4 font-medium text-gray-400">Status</th>
                                <th className="p-4 font-medium text-gray-400">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {alerts?.map((alert) => (
                                <tr key={alert.id} className="hover:bg-gray-800/30">
                                    <td className="p-4 font-bold">{alert.crypto_symbol}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${alert.condition === 'ABOVE' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                                            }`}>
                                            {alert.condition}
                                        </span>
                                    </td>
                                    <td className="p-4 font-mono">${alert.target_price.toLocaleString()}</td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${alert.is_active ? 'bg-blue-900 text-blue-300' : 'bg-gray-700 text-gray-300'
                                            }`}>
                                            {alert.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <button className="text-gray-500 hover:text-red-400 transition">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {(!alerts || alerts.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">
                                        No alerts configured.
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
