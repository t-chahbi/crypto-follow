/**
 * Portfolio Calculation Utilities
 * Functions for calculating P&L (Profit & Loss) and portfolio metrics
 */

export interface Transaction {
    id: number;
    user_id: string;
    crypto_symbol: string;
    type: 'BUY' | 'SELL';
    amount: number;
    price_per_coin: number;
    timestamp: string;
}

export interface Holding {
    symbol: string;
    amount: number;
    averageBuyPrice: number;
    totalInvested: number;
    currentPrice: number;
    currentValue: number;
    pnl: number;
    pnlPercentage: number;
}

export interface PortfolioSummary {
    totalInvested: number;
    currentValue: number;
    totalPnl: number;
    totalPnlPercentage: number;
    holdings: Holding[];
    totalTransactions: number;
}

/**
 * Calculate holdings from transactions
 * Uses FIFO (First In, First Out) for average price calculation
 */
export function calculateHoldings(
    transactions: Transaction[],
    currentPrices: Map<string, number>
): Holding[] {
    // Group transactions by symbol
    const holdingsMap = new Map<string, {
        amount: number;
        totalCost: number;
        buyCount: number;
    }>();

    for (const tx of transactions) {
        const existing = holdingsMap.get(tx.crypto_symbol) || {
            amount: 0,
            totalCost: 0,
            buyCount: 0,
        };

        const amount = Number(tx.amount);
        const price = Number(tx.price_per_coin);

        if (tx.type === 'BUY') {
            existing.amount += amount;
            existing.totalCost += amount * price;
            existing.buyCount += 1;
        } else {
            // SELL - reduce holdings
            existing.amount -= amount;
            // For simplicity, we don't reduce totalCost on sell
            // This gives us a rough average cost basis
        }

        holdingsMap.set(tx.crypto_symbol, existing);
    }

    // Convert to holdings array with P&L calculation
    const holdings: Holding[] = [];

    for (const [symbol, data] of holdingsMap.entries()) {
        if (data.amount <= 0) continue; // Skip if no holdings

        const currentPrice = currentPrices.get(symbol) || 0;
        const averageBuyPrice = data.buyCount > 0 ? data.totalCost / data.amount : 0;
        const currentValue = data.amount * currentPrice;
        const costBasis = data.amount * averageBuyPrice;
        const pnl = currentValue - costBasis;
        const pnlPercentage = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

        holdings.push({
            symbol,
            amount: data.amount,
            averageBuyPrice,
            totalInvested: costBasis,
            currentPrice,
            currentValue,
            pnl,
            pnlPercentage,
        });
    }

    // Sort by current value descending
    return holdings.sort((a, b) => b.currentValue - a.currentValue);
}

/**
 * Calculate portfolio summary with total P&L
 */
export function calculatePortfolioSummary(
    transactions: Transaction[],
    currentPrices: Map<string, number>
): PortfolioSummary {
    const holdings = calculateHoldings(transactions, currentPrices);

    const totalInvested = holdings.reduce((sum, h) => sum + h.totalInvested, 0);
    const currentValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
    const totalPnl = currentValue - totalInvested;
    const totalPnlPercentage = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

    return {
        totalInvested,
        currentValue,
        totalPnl,
        totalPnlPercentage,
        holdings,
        totalTransactions: transactions.length,
    };
}

/**
 * Format P&L with color indicator
 */
export function formatPnL(pnl: number): { value: string; isPositive: boolean } {
    const isPositive = pnl >= 0;
    const formatted = `${isPositive ? '+' : ''}$${Math.abs(pnl).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
    return { value: formatted, isPositive };
}

/**
 * Format percentage with color indicator
 */
export function formatPercentage(percentage: number): { value: string; isPositive: boolean } {
    const isPositive = percentage >= 0;
    const formatted = `${isPositive ? '+' : ''}${percentage.toFixed(2)}%`;
    return { value: formatted, isPositive };
}
