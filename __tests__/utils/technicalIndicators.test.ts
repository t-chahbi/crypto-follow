import { calculateSMA, addSMAIndicators, detectCrossovers, PricePoint, IndicatorData } from '@/utils/technicalIndicators';

describe('Technical Indicators', () => {
    describe('calculateSMA', () => {
        it('should calculate SMA correctly for a simple array', () => {
            const prices = [10, 20, 30, 40, 50];
            const sma3 = calculateSMA(prices, 3);

            expect(sma3[0]).toBeUndefined();
            expect(sma3[1]).toBeUndefined();
            expect(sma3[2]).toBeCloseTo(20, 2); // (10+20+30)/3
            expect(sma3[3]).toBeCloseTo(30, 2); // (20+30+40)/3
            expect(sma3[4]).toBeCloseTo(40, 2); // (30+40+50)/3
        });

        it('should handle single period (returns same values)', () => {
            const prices = [100, 200, 300];
            const sma1 = calculateSMA(prices, 1);

            expect(sma1[0]).toBe(100);
            expect(sma1[1]).toBe(200);
            expect(sma1[2]).toBe(300);
        });

        it('should throw error for invalid period', () => {
            expect(() => calculateSMA([1, 2, 3], 0)).toThrow('Period must be a positive number');
            expect(() => calculateSMA([1, 2, 3], -1)).toThrow('Period must be a positive number');
        });

        it('should return all undefined if period is greater than data length', () => {
            const prices = [10, 20, 30];
            const sma5 = calculateSMA(prices, 5);

            expect(sma5.every(v => v === undefined)).toBe(true);
        });
    });

    describe('addSMAIndicators', () => {
        it('should add SMA7 and SMA30 to price data', () => {
            const data: PricePoint[] = Array.from({ length: 35 }, (_, i) => ({
                date: `2024-01-${String(i + 1).padStart(2, '0')}`,
                price: 100 + i * 10
            }));

            const result = addSMAIndicators(data);

            expect(result.length).toBe(35);
            expect(result[6].sma7).toBeDefined();
            expect(result[29].sma30).toBeDefined();
            expect(result[0].sma7).toBeUndefined();
            expect(result[0].sma30).toBeUndefined();
        });

        it('should preserve original data', () => {
            const data: PricePoint[] = [
                { date: '2024-01-01', price: 100 },
                { date: '2024-01-02', price: 200 }
            ];

            const result = addSMAIndicators(data);

            expect(result[0].date).toBe('2024-01-01');
            expect(result[0].price).toBe(100);
            expect(result[1].date).toBe('2024-01-02');
            expect(result[1].price).toBe(200);
        });
    });

    describe('detectCrossovers', () => {
        it('should detect golden cross when SMA7 crosses above SMA30', () => {
            const data: IndicatorData[] = [
                { date: '2024-01-01', price: 100, sma7: 90, sma30: 100 },
                { date: '2024-01-02', price: 110, sma7: 105, sma30: 100 },
            ];

            const result = detectCrossovers(data);

            expect(result.goldenCross).toBe(true);
            expect(result.deathCross).toBe(false);
            expect(result.lastCrossoverIndex).toBe(1);
        });

        it('should detect death cross when SMA7 crosses below SMA30', () => {
            const data: IndicatorData[] = [
                { date: '2024-01-01', price: 100, sma7: 110, sma30: 100 },
                { date: '2024-01-02', price: 90, sma7: 95, sma30: 100 },
            ];

            const result = detectCrossovers(data);

            expect(result.goldenCross).toBe(false);
            expect(result.deathCross).toBe(true);
            expect(result.lastCrossoverIndex).toBe(1);
        });

        it('should return no crossover when SMAs do not cross', () => {
            const data: IndicatorData[] = [
                { date: '2024-01-01', price: 100, sma7: 110, sma30: 100 },
                { date: '2024-01-02', price: 105, sma7: 108, sma30: 100 },
            ];

            const result = detectCrossovers(data);

            expect(result.goldenCross).toBe(false);
            expect(result.deathCross).toBe(false);
            expect(result.lastCrossoverIndex).toBe(null);
        });

        it('should handle data without SMAs', () => {
            const data: IndicatorData[] = [
                { date: '2024-01-01', price: 100 },
                { date: '2024-01-02', price: 105 },
            ];

            const result = detectCrossovers(data);

            expect(result.goldenCross).toBe(false);
            expect(result.deathCross).toBe(false);
        });
    });
});
