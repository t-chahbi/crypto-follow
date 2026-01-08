import {
    calculateHoldings,
    calculatePortfolioSummary,
    formatPnL,
    formatPercentage,
    Transaction
} from '@/utils/portfolio';

describe('Portfolio Utilities', () => {
    describe('calculateHoldings', () => {
        it('should calculate holdings correctly for BUY transactions', () => {
            const transactions: Transaction[] = [
                { id: 1, user_id: 'user1', crypto_symbol: 'BTC', type: 'BUY', amount: 1, price_per_coin: 50000, timestamp: '2024-01-01' },
                { id: 2, user_id: 'user1', crypto_symbol: 'BTC', type: 'BUY', amount: 0.5, price_per_coin: 60000, timestamp: '2024-01-02' },
            ];

            const currentPrices = new Map([['BTC', 55000]]);
            const holdings = calculateHoldings(transactions, currentPrices);

            expect(holdings.length).toBe(1);
            expect(holdings[0].symbol).toBe('BTC');
            expect(holdings[0].amount).toBe(1.5);
            expect(holdings[0].currentValue).toBe(82500); // 1.5 * 55000
        });

        it('should reduce holdings for SELL transactions', () => {
            const transactions: Transaction[] = [
                { id: 1, user_id: 'user1', crypto_symbol: 'BTC', type: 'BUY', amount: 2, price_per_coin: 50000, timestamp: '2024-01-01' },
                { id: 2, user_id: 'user1', crypto_symbol: 'BTC', type: 'SELL', amount: 0.5, price_per_coin: 60000, timestamp: '2024-01-02' },
            ];

            const currentPrices = new Map([['BTC', 55000]]);
            const holdings = calculateHoldings(transactions, currentPrices);

            expect(holdings[0].amount).toBe(1.5);
        });

        it('should handle multiple cryptocurrencies', () => {
            const transactions: Transaction[] = [
                { id: 1, user_id: 'user1', crypto_symbol: 'BTC', type: 'BUY', amount: 1, price_per_coin: 50000, timestamp: '2024-01-01' },
                { id: 2, user_id: 'user1', crypto_symbol: 'ETH', type: 'BUY', amount: 10, price_per_coin: 3000, timestamp: '2024-01-02' },
            ];

            const currentPrices = new Map([['BTC', 55000], ['ETH', 3500]]);
            const holdings = calculateHoldings(transactions, currentPrices);

            expect(holdings.length).toBe(2);
            const btcHolding = holdings.find(h => h.symbol === 'BTC');
            const ethHolding = holdings.find(h => h.symbol === 'ETH');

            expect(btcHolding?.currentValue).toBe(55000);
            expect(ethHolding?.currentValue).toBe(35000);
        });

        it('should exclude holdings with zero or negative amount', () => {
            const transactions: Transaction[] = [
                { id: 1, user_id: 'user1', crypto_symbol: 'BTC', type: 'BUY', amount: 1, price_per_coin: 50000, timestamp: '2024-01-01' },
                { id: 2, user_id: 'user1', crypto_symbol: 'BTC', type: 'SELL', amount: 1, price_per_coin: 60000, timestamp: '2024-01-02' },
            ];

            const currentPrices = new Map([['BTC', 55000]]);
            const holdings = calculateHoldings(transactions, currentPrices);

            expect(holdings.length).toBe(0);
        });

        it('should calculate P&L correctly', () => {
            const transactions: Transaction[] = [
                { id: 1, user_id: 'user1', crypto_symbol: 'BTC', type: 'BUY', amount: 1, price_per_coin: 50000, timestamp: '2024-01-01' },
            ];

            const currentPrices = new Map([['BTC', 60000]]);
            const holdings = calculateHoldings(transactions, currentPrices);

            expect(holdings[0].pnl).toBe(10000); // 60000 - 50000
            expect(holdings[0].pnlPercentage).toBe(20); // 10000/50000 * 100
        });
    });

    describe('calculatePortfolioSummary', () => {
        it('should calculate total portfolio metrics', () => {
            const transactions: Transaction[] = [
                { id: 1, user_id: 'user1', crypto_symbol: 'BTC', type: 'BUY', amount: 1, price_per_coin: 50000, timestamp: '2024-01-01' },
                { id: 2, user_id: 'user1', crypto_symbol: 'ETH', type: 'BUY', amount: 10, price_per_coin: 3000, timestamp: '2024-01-02' },
            ];

            const currentPrices = new Map([['BTC', 55000], ['ETH', 3500]]);
            const summary = calculatePortfolioSummary(transactions, currentPrices);

            expect(summary.totalInvested).toBe(80000); // 50000 + 30000
            expect(summary.currentValue).toBe(90000); // 55000 + 35000
            expect(summary.totalPnl).toBe(10000);
            expect(summary.totalPnlPercentage).toBe(12.5); // 10000/80000 * 100
            expect(summary.totalTransactions).toBe(2);
        });

        it('should handle empty transactions', () => {
            const summary = calculatePortfolioSummary([], new Map());

            expect(summary.totalInvested).toBe(0);
            expect(summary.currentValue).toBe(0);
            expect(summary.totalPnl).toBe(0);
            expect(summary.holdings.length).toBe(0);
        });
    });

    describe('formatPnL', () => {
        it('should format positive P&L with plus sign', () => {
            const result = formatPnL(1000);
            expect(result.value).toMatch(/\+\$[\d,.\s]+/);
            expect(result.isPositive).toBe(true);
        });

        it('should format negative P&L correctly', () => {
            const result = formatPnL(-500);
            expect(result.value).toMatch(/[-]?\$[\d,.\s]+/);
            expect(result.isPositive).toBe(false);
        });

        it('should handle zero as positive', () => {
            const result = formatPnL(0);
            expect(result.isPositive).toBe(true);
        });
    });

    describe('formatPercentage', () => {
        it('should format positive percentage with plus sign', () => {
            const result = formatPercentage(25.5);
            expect(result.value).toMatch(/\+25[\.,]50%/);
            expect(result.isPositive).toBe(true);
        });

        it('should format negative percentage correctly', () => {
            const result = formatPercentage(-10.25);
            expect(result.value).toMatch(/-10[\.,]25%/);
            expect(result.isPositive).toBe(false);
        });
    });
});
