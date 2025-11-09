import { formatCurrency } from '@/utils/format';

describe('formatCurrency', () => {
    it('formats number as USD currency', () => {
        expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });

    it('handles zero', () => {
        expect(formatCurrency(0)).toBe('$0.00');
    });

    it('handles negative numbers', () => {
        expect(formatCurrency(-500)).toBe('-$500.00');
    });
});
