import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import CryptoChart from '@/components/CryptoChart'

// Mock Recharts ResponsiveContainer to avoid size issues in JSDOM
jest.mock('recharts', () => {
    const OriginalModule = jest.requireActual('recharts');
    return {
        ...OriginalModule,
        ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
            <div style={{ width: 800, height: 800 }}>{children}</div>
        ),
    };
});

describe('CryptoChart', () => {
    const mockData = [
        { timestamp: '2023-01-01', price: 100 },
        { timestamp: '2023-01-02', price: 110 },
    ];

    it('renders without crashing', () => {
        const { container } = render(<CryptoChart data={mockData} />)
        expect(container).toBeInTheDocument()
    });
});
