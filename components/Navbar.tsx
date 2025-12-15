'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar } from "@heroui/react"
import { LayoutDashboard, Wallet, Bell, TrendingUp, LogOut, User, Menu, X } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/portfolio', label: 'Portefeuille', icon: Wallet },
    { href: '/alerts', label: 'Alertes', icon: Bell },
]

export default function Navbar() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [user, setUser] = useState<any>(null)
    const [isScrolled, setIsScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    const isActive = (href: string) => pathname === href

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
            ? 'bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20'
            : 'bg-transparent'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center gap-3 group">
                        <span className="text-xl font-bold text-white">
                            Crypto Follow
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => {
                            const Icon = link.icon
                            const active = isActive(link.href)
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${active
                                        ? 'bg-white/10 text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <Icon className={`w-4 h-4 ${active ? 'text-indigo-400' : ''}`} />
                                    {link.label}
                                </Link>
                            )
                        })}
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center gap-3">
                        {user && (
                            <Dropdown placement="bottom-end">
                                <DropdownTrigger>
                                    <button className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors outline-none">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center ring-2 ring-white/10">
                                            <span className="text-white font-semibold text-sm">
                                                {user.email?.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="hidden lg:block text-left">
                                            <p className="text-sm font-medium text-white truncate max-w-[120px]">
                                                {user.email?.split('@')[0]}
                                            </p>
                                            <p className="text-xs text-gray-500">Trader</p>
                                        </div>
                                    </button>
                                </DropdownTrigger>
                                <DropdownMenu aria-label="User menu" className="w-56">
                                    <DropdownItem
                                        key="profile"
                                        startContent={<User className="w-4 h-4" />}
                                        className="gap-2"
                                    >
                                        <div>
                                            <p className="font-medium">{user.email?.split('@')[0]}</p>
                                            <p className="text-xs text-gray-400">{user.email}</p>
                                        </div>
                                    </DropdownItem>
                                    <DropdownItem
                                        key="logout"
                                        color="danger"
                                        startContent={<LogOut className="w-4 h-4" />}
                                        onPress={handleLogout}
                                    >
                                        Déconnexion
                                    </DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2 rounded-xl hover:bg-white/5 transition-colors"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-white/10 space-y-1">
                        {navLinks.map((link) => {
                            const Icon = link.icon
                            const active = isActive(link.href)
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${active
                                        ? 'bg-white/10 text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 ${active ? 'text-indigo-400' : ''}`} />
                                    {link.label}
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
        </nav>
    )
}
