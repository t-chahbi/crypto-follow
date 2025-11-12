import Link from 'next/link'
import { ArrowRight, BarChart2, Bell, Wallet } from 'lucide-react'
import { Button, Card, CardBody, CardHeader, Divider } from "@heroui/react"

export const dynamic = 'force-dynamic'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="border-b border-white/10 backdrop-blur-md fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Crypto Follow
          </div>
          <div className="flex gap-4">
            <Button as={Link} href="/login" variant="light" className="text-gray-300 hover:text-white">
              Connexion
            </Button>
            <Button as={Link} href="/login" color="primary" variant="shadow" radius="full">
              Commencer
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] -z-10" />

        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
            Maîtrisez le Marché avec <br />
            <span className="text-indigo-400">des Infos en Temps Réel</span>
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Suivez votre portefeuille, analysez les tendances avec des graphiques avancés, et ne manquez jamais une opportunité grâce aux alertes personnalisées.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              as={Link}
              href="/login"
              size="lg"
              color="default"
              className="bg-white text-black font-semibold"
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
              className="text-white border-gray-700 font-semibold"
              radius="full"
            >
              En Savoir Plus
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">Tout ce dont vous avez besoin pour trader intelligemment</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<BarChart2 className="w-8 h-8 text-indigo-400" />}
              title="Analyses Temps Réel"
              description="Mises à jour des prix en direct et graphiques en chandeliers interactifs pour les meilleures cryptomonnaies."
            />
            <FeatureCard
              icon={<Wallet className="w-8 h-8 text-purple-400" />}
              title="Suivi de Portefeuille"
              description="Simulez des transactions d'achat/vente et suivez vos Profits & Pertes en temps réel."
            />
            <FeatureCard
              icon={<Bell className="w-8 h-8 text-pink-400" />}
              title="Alertes Intelligentes"
              description="Définissez des seuils de prix personnalisés et soyez notifié instantanément lorsqu'ils sont atteints."
            />
          </div>
        </div>
      </section>

      {/* Tech Stack Footer */}
      <footer className="py-12 px-6 border-t border-white/10 text-center text-gray-500 text-sm">
        <p>Propulsé par Next.js 14, Supabase, et Kubernetes (k0s).</p>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-colors">
      <CardHeader className="flex gap-3">
        <div className="p-2 bg-white/10 rounded-lg">
          {icon}
        </div>
        <div className="flex flex-col">
          <p className="text-md font-bold">{title}</p>
        </div>
      </CardHeader>
      <Divider className="bg-white/10" />
      <CardBody>
        <p className="text-gray-400">{description}</p>
      </CardBody>
    </Card>
  )
}
