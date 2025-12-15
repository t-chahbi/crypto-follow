'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button, Input } from "@heroui/react"
import { Mail, Lock, TrendingUp, ArrowRight, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [mode, setMode] = useState<'login' | 'signup'>('login')
    const router = useRouter()
    const supabase = createClient()

    const handleAuth = async () => {
        setLoading(true)
        setError(null)

        try {
            if (mode === 'login') {
                const { error } = await supabase.auth.signInWithPassword({ email, password })
                if (error) throw error
            } else {
                const { error } = await supabase.auth.signUp({ email, password })
                if (error) throw error
            }
            router.push('/dashboard')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0f1629] flex">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0">
                    <div className="bg-orb w-[600px] h-[600px] bg-indigo-600/40 top-[-200px] left-[-200px]" />
                    <div className="bg-orb w-[400px] h-[400px] bg-purple-600/30 bottom-[-100px] right-[-100px]" style={{ animationDelay: '-5s' }} />
                    <div className="bg-orb w-[300px] h-[300px] bg-pink-600/20 top-[40%] left-[60%]" style={{ animationDelay: '-10s' }} />
                </div>

                <div className="relative z-10 flex flex-col justify-center px-16">
                    <Link href="/" className="flex items-center gap-3 mb-12">
                        <div className="relative">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                                <TrendingUp className="w-7 h-7 text-white" />
                            </div>
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 blur-xl opacity-50" />
                        </div>
                        <span className="text-3xl font-bold text-white">Crypto Follow</span>
                    </Link>

                    <h1 className="text-5xl font-bold mb-6 leading-tight">
                        Tradez comme les
                        <br />
                        <span className="text-white">professionnels</span>
                    </h1>

                    <p className="text-xl text-gray-400 mb-8 max-w-md">
                        Rejoignez des milliers de traders et accédez à des outils d'analyse professionnels.
                    </p>

                    <div className="flex gap-8 text-sm text-gray-500">
                        <div>
                            <div className="text-2xl font-bold text-white mb-1">$10K</div>
                            <div>Capital virtuel</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white mb-1">100+</div>
                            <div>Cryptomonnaies</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white mb-1">24/7</div>
                            <div>Temps réel</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <Link href="/" className="flex items-center gap-3 mb-8 lg:hidden">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white">Crypto Follow</span>
                    </Link>

                    <div className="glass-card p-8">
                        <h2 className="text-2xl font-bold mb-2">
                            {mode === 'login' ? 'Bon retour !' : 'Créer un compte'}
                        </h2>
                        <p className="text-gray-400 mb-8">
                            {mode === 'login'
                                ? 'Connectez-vous pour accéder à votre dashboard'
                                : 'Commencez à trader avec $10,000 virtuels'
                            }
                        </p>

                        <div className="space-y-5">
                            <Input
                                type="email"
                                label="Email"
                                placeholder="vous@exemple.com"
                                value={email}
                                onValueChange={setEmail}
                                startContent={<Mail className="w-5 h-5 text-gray-400" />}
                                classNames={{
                                    inputWrapper: "bg-white/5 border border-white/10 hover:border-white/20 focus-within:border-indigo-500",
                                }}
                            />

                            <Input
                                type={showPassword ? "text" : "password"}
                                label="Mot de passe"
                                placeholder="••••••••"
                                value={password}
                                onValueChange={setPassword}
                                startContent={<Lock className="w-5 h-5 text-gray-400" />}
                                endContent={
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-gray-400 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                }
                                classNames={{
                                    inputWrapper: "bg-white/5 border border-white/10 hover:border-white/20 focus-within:border-indigo-500",
                                }}
                            />

                            {error && (
                                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                                    {error}
                                </div>
                            )}

                            <Button
                                fullWidth
                                size="lg"
                                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all"
                                onPress={handleAuth}
                                isLoading={loading}
                                endContent={!loading && <ArrowRight className="w-5 h-5" />}
                            >
                                {mode === 'login' ? 'Se connecter' : "S'inscrire"}
                            </Button>
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-gray-400">
                                {mode === 'login' ? "Pas encore de compte ?" : "Déjà un compte ?"}
                                <button
                                    onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                                    className="ml-2 text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                                >
                                    {mode === 'login' ? "S'inscrire" : "Se connecter"}
                                </button>
                            </p>
                        </div>
                    </div>

                    <p className="text-center text-gray-500 text-sm mt-6">
                        En continuant, vous acceptez nos conditions d'utilisation
                    </p>
                </div>
            </div>
        </div>
    )
}
