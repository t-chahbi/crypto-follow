'use client'

import { Card, CardBody, CardHeader, Switch } from "@heroui/react";
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart } from 'recharts';
import { useState } from 'react';
import { addSMAIndicators, detectCrossovers } from '@/utils/technicalIndicators';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface DashboardChartProps {
    data: {
        prices?: [number, number][];
    };
    coinName?: string;
}

export default function DashboardChart({ data, coinName = "Bitcoin" }: DashboardChartProps) {
    const [showSMA7, setShowSMA7] = useState(true);
    const [showSMA30, setShowSMA30] = useState(true);

    if (!data || !data.prices) return null;

    // Transform data
    const rawData = data.prices.map((item: [number, number]) => ({
        date: new Date(item[0]).toLocaleDateString('fr-FR'),
        price: item[1]
    }));

    // Add SMA indicators
    const chartData = addSMAIndicators(rawData);

    // Detect crossovers
    const crossoverSignal = detectCrossovers(chartData);

    return (
        <Card className="bg-white/5 border border-white/10 w-full">
            <CardHeader className="pb-0 pt-4 px-4 flex-col items-start gap-2">
                <div className="flex justify-between w-full items-center">
                    <div>
                        <h4 className="font-bold text-large">Tendance {coinName} (7 jours)</h4>
                        {crossoverSignal.goldenCross && (
                            <span className="text-xs text-green-400 flex items-center gap-1 mt-1">
                                <TrendingUp size={12} /> Signal haussier détecté (Golden Cross)
                            </span>
                        )}
                        {crossoverSignal.deathCross && (
                            <span className="text-xs text-red-400 flex items-center gap-1 mt-1">
                                <TrendingDown size={12} /> Signal baissier détecté (Death Cross)
                            </span>
                        )}
                        {!crossoverSignal.goldenCross && !crossoverSignal.deathCross && (
                            <span className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                <Minus size={12} /> Pas de signal de croisement
                            </span>
                        )}
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <Switch
                                isSelected={showSMA7}
                                onValueChange={setShowSMA7}
                                size="sm"
                                color="primary"
                            />
                            <span className="text-xs text-blue-400">SMA 7j</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                isSelected={showSMA30}
                                onValueChange={setShowSMA30}
                                size="sm"
                                color="warning"
                            />
                            <span className="text-xs text-orange-400">SMA 30j</span>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardBody className="overflow-visible py-2 h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData}>
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="#666"
                            tick={{ fill: '#666', fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#666"
                            tick={{ fill: '#666', fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            domain={['auto', 'auto']}
                            tickFormatter={(value) => `$${value.toLocaleString()}`}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                            labelStyle={{ color: '#999' }}
                            formatter={(value: number, name: string) => {
                                const labels: Record<string, string> = {
                                    price: 'Prix',
                                    sma7: 'SMA 7j',
                                    sma30: 'SMA 30j'
                                };
                                return [`$${value?.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, labels[name] || name];
                            }}
                        />
                        <Legend
                            verticalAlign="top"
                            height={36}
                            formatter={(value) => {
                                const labels: Record<string, string> = {
                                    price: 'Prix',
                                    sma7: 'SMA 7 jours',
                                    sma30: 'SMA 30 jours'
                                };
                                return labels[value] || value;
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="price"
                            stroke="#8884d8"
                            fillOpacity={1}
                            fill="url(#colorPrice)"
                            strokeWidth={2}
                        />
                        {showSMA7 && (
                            <Line
                                type="monotone"
                                dataKey="sma7"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={false}
                                connectNulls
                            />
                        )}
                        {showSMA30 && (
                            <Line
                                type="monotone"
                                dataKey="sma30"
                                stroke="#f97316"
                                strokeWidth={2}
                                dot={false}
                                connectNulls
                            />
                        )}
                    </ComposedChart>
                </ResponsiveContainer>
            </CardBody>
        </Card>
    );
}
