'use client'

import { Card, CardBody } from "@heroui/react";
import { TrendingUp, Activity, DollarSign, BarChart3 } from "lucide-react";

export default function MarketStats({ stats }: { stats: any }) {
    if (!stats) return null;

    const items = [
        {
            title: "Capitalisation Globale",
            value: `$${(stats.total_market_cap.usd / 1e12).toFixed(2)}T`,
            icon: <DollarSign className="text-success" />,
            change: stats.market_cap_change_percentage_24h_usd
        },
        {
            title: "Volume 24h",
            value: `$${(stats.total_volume.usd / 1e9).toFixed(2)}B`,
            icon: <Activity className="text-primary" />,
            change: null
        },
        {
            title: "Dominance BTC",
            value: `${stats.market_cap_percentage.btc.toFixed(1)}%`,
            icon: <BarChart3 className="text-warning" />,
            change: null
        },
        {
            title: "Cryptos Actives",
            value: stats.active_cryptocurrencies,
            icon: <TrendingUp className="text-secondary" />,
            change: null
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {items.map((item, index) => (
                <Card key={index} className="bg-white/5 border border-white/10">
                    <CardBody className="flex flex-row items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-lg">
                            {item.icon}
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">{item.title}</p>
                            <div className="flex items-center gap-2">
                                <p className="text-xl font-bold">{item.value}</p>
                                {item.change !== null && (
                                    <span className={`text-xs ${item.change >= 0 ? 'text-success' : 'text-danger'}`}>
                                        {item.change > 0 ? '+' : ''}{item.change.toFixed(1)}%
                                    </span>
                                )}
                            </div>
                        </div>
                    </CardBody>
                </Card>
            ))}
        </div>
    );
}
