/**
 * Technical Indicators Utility Functions
 * Calculates SMA (Simple Moving Average) for cryptocurrency price analysis
 */

export interface PricePoint {
    date: string;
    price: number;
}

export interface IndicatorData extends PricePoint {
    sma7?: number;
    sma30?: number;
}

/**
 * Calculate Simple Moving Average (SMA) for a given period
 * @param prices - Array of price values
 * @param period - Number of periods for the average
 * @returns Array of SMA values (undefined for initial periods without enough data)
 */
export function calculateSMA(prices: number[], period: number): (number | undefined)[] {
    if (period <= 0) {
        throw new Error('Period must be a positive number');
    }

    return prices.map((_, index) => {
        if (index < period - 1) {
            return undefined;
        }

        const slice = prices.slice(index - period + 1, index + 1);
        const sum = slice.reduce((acc, val) => acc + val, 0);
        return sum / period;
    });
}

/**
 * Add SMA indicators to price data
 * @param data - Array of price points with date and price
 * @returns Array of price points enriched with SMA7 and SMA30
 */
export function addSMAIndicators(data: PricePoint[]): IndicatorData[] {
    const prices = data.map(d => d.price);
    const sma7Values = calculateSMA(prices, 7);
    const sma30Values = calculateSMA(prices, 30);

    return data.map((point, index) => ({
        ...point,
        sma7: sma7Values[index],
        sma30: sma30Values[index],
    }));
}

/**
 * Detect SMA crossovers (golden cross / death cross)
 * @param data - Array of indicator data with SMA values
 * @returns Object with crossover signals
 */
export function detectCrossovers(data: IndicatorData[]): {
    goldenCross: boolean; // Short-term crosses above long-term (bullish)
    deathCross: boolean;  // Short-term crosses below long-term (bearish)
    lastCrossoverIndex: number | null;
} {
    let goldenCross = false;
    let deathCross = false;
    let lastCrossoverIndex: number | null = null;

    for (let i = 1; i < data.length; i++) {
        const prev = data[i - 1];
        const curr = data[i];

        if (prev.sma7 && prev.sma30 && curr.sma7 && curr.sma30) {
            // Golden Cross: SMA7 crosses above SMA30
            if (prev.sma7 <= prev.sma30 && curr.sma7 > curr.sma30) {
                goldenCross = true;
                deathCross = false;
                lastCrossoverIndex = i;
            }
            // Death Cross: SMA7 crosses below SMA30
            else if (prev.sma7 >= prev.sma30 && curr.sma7 < curr.sma30) {
                deathCross = true;
                goldenCross = false;
                lastCrossoverIndex = i;
            }
        }
    }

    return { goldenCross, deathCross, lastCrossoverIndex };
}
