'use client'

import Link from 'next/link'
import { ArrowRight, BarChart2, Bell, Wallet, TrendingUp, Shield, Zap, Globe, ChevronRight, Star } from 'lucide-react'
import { Button } from "@heroui/react"
import { LineChart, Line, AreaChart, Area, ResponsiveContainer, XAxis, YAxis } from 'recharts'

export const dynamic = 'force-dynamic'

// Fake chart data for visual effect
const chartData = [
  { value: 42000 }, { value: 43500 }, { value: 41200 }, { value: 44800 },
  { value: 46200 }, { value: 45100 }, { value: 47500 }, { value: 49000 },
  { value: 48200 }, { value: 51000 }, { value: 52500 }, { value: 50800 },
  { value: 53200 }, { value: 55000 }, { value: 54200 }, { value: 58000 }
]

const miniCharts = [
  { name: 'Bitcoin', symbol: 'BTC', price: 67842, change: 5.2, data: chartData },
  { name: 'Ethereum', symbol: 'ETH', price: 3521, change: 3.8, data: chartData.map(d => ({ value: d.value * 0.07 })) },
  { name: 'Solana', symbol: 'SOL', price: 142, change: -2.1, data: chartData.map((d, i) => ({ value: 150 - (i * 2) + Math.random() * 20 })) },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f1629] text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f1629] via-[#1a1f3c] to-[#0f1629]" />
        <div className="bg-orb w-[600px] h-[600px] bg-indigo-600/20 top-[-200px] left-[-100px]" />
        <div className="bg-orb w-[500px] h-[500px] bg-purple-600/15 top-[40%] right-[-150px]" style={{ animationDelay: '-5s' }} />
        <div className="bg-orb w-[400px] h-[400px] bg-cyan-600/10 bottom-[-100px] left-[30%]" style={{ animationDelay: '-10s' }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0f1629]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="text-2xl font-bold gradient-text">
              Crypto Follow
            </span>
          </Link>
          <div className="flex gap-3">
            <Button as={Link} href="/login" variant="light" className="text-gray-300 hover:text-white font-medium">
              Connexion
            </Button>
            <Button
              as={Link}
              href="/login"
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-shadow"
              radius="full"
            >
              Commencer
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-36 pb-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm text-gray-300">La plateforme #1 pour trader les cryptos</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
                Dominez le Marché avec
                <span className="gradient-text block mt-2">l'Intelligence Temps Réel</span>
              </h1>

              <p className="text-xl text-gray-400 mb-10 leading-relaxed">
                Analysez, tradez et optimisez votre portefeuille crypto avec des outils professionnels.
                Prix live, alertes intelligentes et prédictions IA.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  as={Link}
                  href="/login"
                  size="lg"
                  className="bg-white text-black font-bold text-lg px-8 py-7 shadow-2xl shadow-white/10 hover:shadow-white/20 transition-all hover:scale-105"
                  radius="full"
                  endContent={<ArrowRight className="w-5 h-5" />}
                >
                  Commencer Maintenant
                </Button>
                <Button
                  as={Link}
                  href="#features"
                  size="lg"
                  variant="bordered"
                  className="text-white border-white/20 font-semibold text-lg px-8 py-7 hover:bg-white/5 transition-colors"
                  radius="full"
                >
                  Voir les fonctionnalités
                </Button>
              </div>
            </div>

            {/* Right - Live Charts Preview */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl blur-3xl" />
              <div className="relative bg-[#1a2235]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Marchés en Direct</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-gray-400">Live</span>
                  </div>
                </div>

                {miniCharts.map((crypto, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/8 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {crypto.symbol.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold">{crypto.name}</p>
                        <p className="text-sm text-gray-400">{crypto.symbol}</p>
                      </div>
                    </div>
                    <div className="w-24 h-12">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={crypto.data}>
                          <defs>
                            <linearGradient id={`gradient-${i}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={crypto.change >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0.3} />
                              <stop offset="100%" stopColor={crypto.change >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke={crypto.change >= 0 ? "#10b981" : "#ef4444"}
                            fill={`url(#gradient-${i})`}
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold">${crypto.price.toLocaleString()}</p>
                      <p className={`text-sm font-semibold ${crypto.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {crypto.change >= 0 ? '+' : ''}{crypto.change}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 px-6 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '$10K', label: 'Capital de départ' },
            { value: '100+', label: 'Cryptos' },
            { value: '24/7', label: 'Données live' },
            { value: '0€', label: 'Gratuit' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Tout pour Réussir</h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Des outils professionnels conçus pour maximiser vos performances
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<BarChart2 className="w-7 h-7" />}
              iconColor="text-indigo-400"
              iconBg="bg-indigo-500/20"
              title="Graphiques Avancés"
              description="Visualisez les tendances avec des graphiques interactifs et indicateurs SMA."
            />
            <FeatureCard
              icon={<Wallet className="w-7 h-7" />}
              iconColor="text-emerald-400"
              iconBg="bg-emerald-500/20"
              title="Portefeuille Virtuel"
              description="Tradez sans risque avec $10,000 virtuels au prix du marché live."
            />
            <FeatureCard
              icon={<Bell className="w-7 h-7" />}
              iconColor="text-pink-400"
              iconBg="bg-pink-500/20"
              title="Alertes Intelligentes"
              description="Notifications Email et Discord quand vos seuils sont atteints."
            />
            <FeatureCard
              icon={<TrendingUp className="w-7 h-7" />}
              iconColor="text-cyan-400"
              iconBg="bg-cyan-500/20"
              title="Prédictions IA"
              description="Algorithmes de régression pour anticiper les tendances du marché."
            />
            <FeatureCard
              icon={<Shield className="w-7 h-7" />}
              iconColor="text-amber-400"
              iconBg="bg-amber-500/20"
              title="100% Sécurisé"
              description="Authentification sécurisée et protection de vos données."
            />
            <FeatureCard
              icon={<Zap className="w-7 h-7" />}
              iconColor="text-purple-400"
              iconBg="bg-purple-500/20"
              title="Ultra Rapide"
              description="Infrastructure optimisée pour des performances maximales."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Prêt à Commencer ?</h2>
          <p className="text-gray-400 text-lg mb-10">
            Rejoignez des milliers de traders et analysez le marché dès maintenant.
          </p>
          <Button
            as={Link}
            href="/login"
            size="lg"
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-lg px-12 py-7 shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all hover:scale-105"
            radius="full"
            endContent={<ArrowRight className="w-5 h-5" />}
          >
            Créer Mon Compte Gratuit
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-semibold gradient-text">Crypto Follow</span>
          <p className="text-gray-500 text-sm">
            Propulsé par Next.js, Supabase & CoinGecko API
          </p>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-500" />
            <span className="text-gray-500 text-sm">Français</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  iconColor,
  iconBg,
  title,
  description
}: {
  icon: React.ReactNode
  iconColor: string
  iconBg: string
  title: string
  description: string
}) {
  return (
    <div className="glass-card glass-card-hover p-6 group">
      <div className={`w-14 h-14 rounded-2xl ${iconBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
        <div className={iconColor}>{icon}</div>
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  )
}
