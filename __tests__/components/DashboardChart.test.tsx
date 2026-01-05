import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import DashboardChart from '@/components/DashboardChart'

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

describe('DashboardChart', () => {
    const mockPrices: [number, number][] = [
        [1704067200000, 42000],
        [1704153600000, 42500],
        [1704240000000, 43000],
        [1704326400000, 42800],
        [1704412800000, 43500],
        [1704499200000, 44000],
        [1704585600000, 44200],
    ];

    const mockData = { prices: mockPrices };

    it('renders without crashing', () => {
        const { container } = render(<DashboardChart data={mockData} />)
        expect(container).toBeInTheDocument()
    });

    it('returns null when data is missing', () => {
        const { container } = render(<DashboardChart data={null as any} />)
        expect(container.firstChild).toBeNull()
    });

    it('returns null when prices array is missing', () => {
        const { container } = render(<DashboardChart data={{}} />)
        expect(container.firstChild).toBeNull()
    });

    it('renders with custom coin name', () => {
        const { getByText } = render(<DashboardChart data={mockData} coinName="Ethereum" />)
        expect(getByText(/Tendance Ethereum/)).toBeInTheDocument()
    });

    it('defaults to Bitcoin when coinName is not provided', () => {
        const { getByText } = render(<DashboardChart data={mockData} />)
        expect(getByText(/Tendance Bitcoin/)).toBeInTheDocument()
    });
});
