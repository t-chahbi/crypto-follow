import { linearRegression, predictPrices, getConfidenceLevel } from '@/utils/prediction';

describe('Prediction Utilities', () => {
    describe('linearRegression', () => {
        it('should calculate correct slope and intercept for ascending data', () => {
            const x = [0, 1, 2, 3, 4];
            const y = [10, 20, 30, 40, 50]; // Perfect linear: y = 10x + 10

            const result = linearRegression(x, y);

            expect(result.slope).toBeCloseTo(10, 2);
            expect(result.intercept).toBeCloseTo(10, 2);
            expect(result.rSquared).toBeCloseTo(1, 2); // Perfect fit
        });

        it('should calculate correct slope for descending data', () => {
            const x = [0, 1, 2, 3, 4];
            const y = [100, 80, 60, 40, 20]; // y = -20x + 100

            const result = linearRegression(x, y);

            expect(result.slope).toBeCloseTo(-20, 2);
            expect(result.intercept).toBeCloseTo(100, 2);
        });

        it('should handle flat data', () => {
            const x = [0, 1, 2, 3, 4];
            const y = [50, 50, 50, 50, 50];

            const result = linearRegression(x, y);

            expect(result.slope).toBeCloseTo(0, 2);
            expect(result.intercept).toBeCloseTo(50, 2);
        });

        it('should throw error for empty arrays', () => {
            expect(() => linearRegression([], [])).toThrow('Input arrays must have the same non-zero length');
        });

        it('should throw error for mismatched array lengths', () => {
            expect(() => linearRegression([1, 2, 3], [1, 2])).toThrow('Input arrays must have the same non-zero length');
        });
    });

    describe('predictPrices', () => {
        it('should predict future prices based on historical data', () => {
            const historicalPrices = [
                { date: '2024-01-01', price: 100 },
                { date: '2024-01-02', price: 110 },
                { date: '2024-01-03', price: 120 },
                { date: '2024-01-04', price: 130 },
                { date: '2024-01-05', price: 140 },
            ];

            const result = predictPrices(historicalPrices, 3);

            expect(result.predictions.length).toBe(3);
            expect(result.trend).toBe('bullish');
            expect(result.predictions[0].price).toBeGreaterThan(140);
        });

        it('should identify bearish trend for descending prices', () => {
            const historicalPrices = [
                { date: '2024-01-01', price: 100 },
                { date: '2024-01-02', price: 90 },
                { date: '2024-01-03', price: 80 },
                { date: '2024-01-04', price: 70 },
                { date: '2024-01-05', price: 60 },
            ];

            const result = predictPrices(historicalPrices, 3);

            expect(result.trend).toBe('bearish');
            expect(result.predictions[0].price).toBeLessThan(60);
        });

        it('should not predict negative prices', () => {
            const historicalPrices = [
                { date: '2024-01-01', price: 10 },
                { date: '2024-01-02', price: 5 },
                { date: '2024-01-03', price: 3 },
                { date: '2024-01-04', price: 2 },
                { date: '2024-01-05', price: 1 },
            ];

            const result = predictPrices(historicalPrices, 10);

            result.predictions.forEach(pred => {
                expect(pred.price).toBeGreaterThanOrEqual(0);
            });
        });

        it('should throw error for insufficient data', () => {
            expect(() => predictPrices([{ date: '2024-01-01', price: 100 }], 7)).toThrow('Need at least 2 data points');
        });

        it('should generate correct number of predictions', () => {
            const historicalPrices = [
                { date: '2024-01-01', price: 100 },
                { date: '2024-01-02', price: 105 },
            ];

            const result = predictPrices(historicalPrices, 5);

            expect(result.predictions.length).toBe(5);
        });
    });

    describe('getConfidenceLevel', () => {
        it('should return "Élevée" for high R²', () => {
            expect(getConfidenceLevel(0.9)).toBe('Élevée');
            expect(getConfidenceLevel(0.85)).toBe('Élevée');
            expect(getConfidenceLevel(0.8)).toBe('Élevée');
        });

        it('should return "Moyenne" for medium R²', () => {
            expect(getConfidenceLevel(0.7)).toBe('Moyenne');
            expect(getConfidenceLevel(0.5)).toBe('Moyenne');
        });

        it('should return "Faible" for low R²', () => {
            expect(getConfidenceLevel(0.4)).toBe('Faible');
            expect(getConfidenceLevel(0.1)).toBe('Faible');
            expect(getConfidenceLevel(0)).toBe('Faible');
        });
    });
});
