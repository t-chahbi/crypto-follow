/**
 * Price Prediction Utility using Linear Regression
 * Simple least-squares regression for cryptocurrency price forecasting
 */

export interface PredictionResult {
    predictions: { date: string; price: number }[];
    slope: number;
    intercept: number;
    rSquared: number;
    trend: 'bullish' | 'bearish' | 'neutral';
}

/**
 * Perform linear regression using the least squares method
 * @param x - Independent variable (typically time indices)
 * @param y - Dependent variable (prices)
 * @returns Slope, intercept, and R² value
 */
export function linearRegression(x: number[], y: number[]): {
    slope: number;
    intercept: number;
    rSquared: number;
} {
    if (x.length !== y.length || x.length === 0) {
        throw new Error('Input arrays must have the same non-zero length');
    }

    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
    const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);
    const sumY2 = y.reduce((acc, yi) => acc + yi * yi, 0);

    const denominator = n * sumX2 - sumX * sumX;

    if (denominator === 0) {
        return { slope: 0, intercept: sumY / n, rSquared: 0 };
    }

    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R² (coefficient of determination)
    const yMean = sumY / n;
    const ssTotal = y.reduce((acc, yi) => acc + Math.pow(yi - yMean, 2), 0);
    const ssResidual = y.reduce((acc, yi, i) => {
        const predicted = slope * x[i] + intercept;
        return acc + Math.pow(yi - predicted, 2);
    }, 0);
    const rSquared = ssTotal > 0 ? 1 - ssResidual / ssTotal : 0;

    return { slope, intercept, rSquared };
}

/**
 * Predict future prices based on historical data
 * @param historicalPrices - Array of historical prices
 * @param daysToPredict - Number of days to predict into the future
 * @returns Prediction result with forecasted prices and statistics
 */
export function predictPrices(
    historicalPrices: { date: string; price: number }[],
    daysToPredict: number = 7
): PredictionResult {
    if (historicalPrices.length < 2) {
        throw new Error('Need at least 2 data points for prediction');
    }

    const prices = historicalPrices.map(d => d.price);
    const x = prices.map((_, i) => i);
    const y = prices;

    const { slope, intercept, rSquared } = linearRegression(x, y);

    // Generate future predictions
    const lastDate = new Date(historicalPrices[historicalPrices.length - 1].date);
    const predictions: { date: string; price: number }[] = [];

    for (let i = 1; i <= daysToPredict; i++) {
        const futureX = prices.length - 1 + i;
        const predictedPrice = slope * futureX + intercept;
        const futureDate = new Date(lastDate);
        futureDate.setDate(futureDate.getDate() + i);

        predictions.push({
            date: futureDate.toISOString().split('T')[0],
            price: Math.max(0, predictedPrice), // Price can't be negative
        });
    }

    // Determine trend based on slope
    const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const slopePercentage = (slope / averagePrice) * 100;

    let trend: 'bullish' | 'bearish' | 'neutral';
    if (slopePercentage > 0.5) {
        trend = 'bullish';
    } else if (slopePercentage < -0.5) {
        trend = 'bearish';
    } else {
        trend = 'neutral';
    }

    return {
        predictions,
        slope,
        intercept,
        rSquared,
        trend,
    };
}

/**
 * Calculate prediction confidence level based on R²
 * @param rSquared - R² value from regression
 * @returns Confidence level as string
 */
export function getConfidenceLevel(rSquared: number): string {
    if (rSquared >= 0.8) return 'Élevée';
    if (rSquared >= 0.5) return 'Moyenne';
    return 'Faible';
}
