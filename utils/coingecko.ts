const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

export async function getMarketData() {
    try {
        const res = await fetch(`${COINGECKO_API_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=true&price_change_percentage=24h`, {
            next: { revalidate: 60 } // Cache for 60 seconds
        });

        if (!res.ok) {
            throw new Error('Failed to fetch market data');
        }

        return res.json();
    } catch (error) {
        console.error('Error fetching market data:', error);
        return [];
    }
}

export async function getGlobalStats() {
    try {
        const res = await fetch(`${COINGECKO_API_URL}/global`, {
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!res.ok) {
            throw new Error('Failed to fetch global stats');
        }

        const data = await res.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching global stats:', error);
        return null;
    }
}

export async function getCoinHistory(id: string) {
    try {
        const res = await fetch(`${COINGECKO_API_URL}/coins/${id}/market_chart?vs_currency=usd&days=7&interval=daily`, {
            next: { revalidate: 3600 }
        });
        if (!res.ok) throw new Error('Failed to fetch history');
        return res.json();
    } catch (error) {
        console.error('Error fetching history:', error);
        return null;
    }
}

export async function getCoinDetails(id: string) {
    try {
        const res = await fetch(`${COINGECKO_API_URL}/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true`, {
            next: { revalidate: 60 }
        });
        if (!res.ok) throw new Error('Failed to fetch coin details');
        return res.json();
    } catch (error) {
        console.error('Error fetching coin details:', error);
        return null;
    }
}
