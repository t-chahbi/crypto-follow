'use client'

import { Card, CardBody, CardHeader, Chip } from "@heroui/react";
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import { predictPrices, getConfidenceLevel, PredictionResult } from '@/utils/prediction';

interface PredictionCardProps {
    historicalData: {
        prices?: [number, number][];
    };
    coinName: string;
}

export default function PredictionCard({ historicalData, coinName }: PredictionCardProps) {
    if (!historicalData || !historicalData.prices || historicalData.prices.length < 7) {
        return null;
    }

    // Transform data for prediction
    const priceData = historicalData.prices.map((item: [number, number]) => ({
        date: new Date(item[0]).toISOString().split('T')[0],
        price: item[1]
    }));

    let prediction: PredictionResult;
    try {
        prediction = predictPrices(priceData, 7);
    } catch (error) {
        console.error('Prediction error:', error);
        return null;
    }

    const currentPrice = priceData[priceData.length - 1].price;
    const predictedPrice7d = prediction.predictions[prediction.predictions.length - 1].price;
    const priceChange = ((predictedPrice7d - currentPrice) / currentPrice) * 100;

    const trendIcon = prediction.trend === 'bullish'
        ? <TrendingUp className="text-green-400" size={20} />
        : prediction.trend === 'bearish'
            ? <TrendingDown className="text-red-400" size={20} />
            : <Minus className="text-gray-400" size={20} />;

    const trendColor = prediction.trend === 'bullish'
        ? 'success'
        : prediction.trend === 'bearish'
            ? 'danger'
            : 'default';

    const confidenceLevel = getConfidenceLevel(prediction.rSquared);
    const confidenceColor = prediction.rSquared >= 0.8 ? 'success' : prediction.rSquared >= 0.5 ? 'warning' : 'danger';

    return (
        <Card className="bg-white/5 border border-white/10">
            <CardHeader className="flex justify-between items-start">
                <div>
                    <h4 className="font-bold text-lg flex items-center gap-2">
                        {trendIcon}
                        Prévision {coinName} (7 jours)
                    </h4>
                    <p className="text-gray-400 text-sm">Basée sur régression linéaire</p>
                </div>
                <Chip color={confidenceColor} variant="flat" size="sm">
                    Confiance: {confidenceLevel}
                </Chip>
            </CardHeader>
            <CardBody className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                        <p className="text-gray-400 text-xs mb-1">Prix actuel</p>
                        <p className="font-mono font-bold text-lg">
                            ${currentPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs mb-1">Prévision J+7</p>
                        <p className="font-mono font-bold text-lg text-indigo-400">
                            ${predictedPrice7d.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs mb-1">Évolution prévue</p>
                        <Chip color={trendColor} variant="flat" size="sm">
                            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                        </Chip>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs mb-1">Tendance</p>
                        <Chip color={trendColor} variant="bordered" size="sm">
                            {prediction.trend === 'bullish' ? 'Haussière' : prediction.trend === 'bearish' ? 'Baissière' : 'Neutre'}
                        </Chip>
                    </div>
                </div>

                {/* Daily predictions */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                    {prediction.predictions.map((pred, index) => (
                        <div key={pred.date} className="text-center p-2 bg-white/5 rounded-lg">
                            <p className="text-xs text-gray-400">J+{index + 1}</p>
                            <p className="font-mono text-xs font-medium">
                                ${pred.price.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Disclaimer */}
                <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <AlertTriangle className="text-yellow-500 flex-shrink-0 mt-0.5" size={16} />
                    <p className="text-xs text-yellow-200/80">
                        <strong>Avertissement :</strong> Ces prévisions sont basées sur une régression linéaire simple
                        et ne constituent pas un conseil financier. Les marchés crypto sont volatils et imprévisibles.
                        Investissez de manière responsable.
                    </p>
                </div>
            </CardBody>
        </Card>
    );
}
