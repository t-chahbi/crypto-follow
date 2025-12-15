'use client'

import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/react"
import Link from 'next/link'
import { TrendingUp, TrendingDown, ChevronRight } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'

interface DashboardTableProps {
    assets: any[]
}

// Generate fake sparkline data based on 24h change
function generateSparklineData(change: number): { value: number }[] {
    const points = 12
    const data = []
    let value = 100
    for (let i = 0; i < points; i++) {
        // Create a trend based on the 24h change
        const trend = change / points
        value = value + trend + (Math.random() - 0.5) * 3
        data.push({ value: Math.max(0, value) })
    }
    return data
}

export default function DashboardTable({ assets }: DashboardTableProps) {
    return (
        <div className="glass-card overflow-hidden">
            <Table
                aria-label="Cryptocurrency market data"
                removeWrapper
                classNames={{
                    table: "min-w-full",
                    th: "bg-white/5 text-gray-400 font-semibold text-xs uppercase tracking-wider first:rounded-tl-none last:rounded-tr-none py-4",
                    td: "py-4",
                    tr: "border-b border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer group",
                }}
            >
                <TableHeader>
                    <TableColumn>#</TableColumn>
                    <TableColumn>Nom</TableColumn>
                    <TableColumn>Prix</TableColumn>
                    <TableColumn>24h %</TableColumn>
                    <TableColumn>Graphique 7j</TableColumn>
                    <TableColumn>Market Cap</TableColumn>
                    <TableColumn className="text-right">Action</TableColumn>
                </TableHeader>
                <TableBody>
                    {assets.slice(0, 20).map((asset, index) => {
                        const isPositive = asset.price_change_percentage_24h >= 0
                        const sparklineData = generateSparklineData(asset.price_change_percentage_24h || 0)

                        return (
                            <TableRow key={asset.id} className="crypto-row">
                                <TableCell>
                                    <span className="text-gray-500 font-medium">{index + 1}</span>
                                </TableCell>
                                <TableCell>
                                    <Link href={`/crypto/${asset.id}`} className="flex items-center gap-3">
                                        <div className="relative">
                                            <img
                                                src={asset.image}
                                                alt={asset.name}
                                                className="w-10 h-10 rounded-full ring-2 ring-white/10"
                                            />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white group-hover:text-indigo-400 transition-colors">
                                                {asset.name}
                                            </p>
                                            <p className="text-sm text-gray-500 uppercase">{asset.symbol}</p>
                                        </div>
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    <span className="font-mono font-bold text-lg">
                                        ${asset.current_price?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold ${isPositive
                                            ? 'bg-emerald-500/15 text-emerald-400'
                                            : 'bg-red-500/15 text-red-400'
                                        }`}>
                                        {isPositive
                                            ? <TrendingUp className="w-3.5 h-3.5" />
                                            : <TrendingDown className="w-3.5 h-3.5" />
                                        }
                                        {isPositive ? '+' : ''}{asset.price_change_percentage_24h?.toFixed(2)}%
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="w-24 h-10">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={sparklineData}>
                                                <defs>
                                                    <linearGradient id={`sparkline-${asset.id}`} x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.3} />
                                                        <stop offset="100%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <Area
                                                    type="monotone"
                                                    dataKey="value"
                                                    stroke={isPositive ? "#10b981" : "#ef4444"}
                                                    fill={`url(#sparkline-${asset.id})`}
                                                    strokeWidth={1.5}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-gray-300 font-medium">
                                        ${(asset.market_cap / 1e9).toFixed(2)}B
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Link
                                        href={`/crypto/${asset.id}`}
                                        className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        Voir <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}
