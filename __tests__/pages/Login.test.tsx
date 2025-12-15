import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import LoginPage from '@/app/login/page'

// Mock useRouter
jest.mock('next/navigation', () => ({
    useRouter() {
        return {
            push: jest.fn(),
        };
    },
}));

// Mock Supabase client
jest.mock('@/utils/supabase/client', () => ({
    createClient: () => ({
        auth: {
            signInWithPassword: jest.fn().mockResolvedValue({ error: null }),
            signUp: jest.fn().mockResolvedValue({ error: null }),
        },
    }),
}));

describe('LoginPage', () => {
    it('renders login form with email and password inputs', () => {
        render(<LoginPage />)

        expect(screen.getByPlaceholderText('vous@exemple.com')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
    });

    it('renders login button', () => {
        render(<LoginPage />)

        expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument()
    });

    it('allows typing in email input', () => {
        render(<LoginPage />)

        const emailInput = screen.getByPlaceholderText('vous@exemple.com') as HTMLInputElement

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

        expect(emailInput.value).toBe('test@example.com')
    });

    it('allows typing in password input', () => {
        render(<LoginPage />)

        const passwordInput = screen.getByPlaceholderText('••••••••') as HTMLInputElement

        fireEvent.change(passwordInput, { target: { value: 'password123' } })

        expect(passwordInput.value).toBe('password123')
    });

    it('displays the app title', () => {
        render(<LoginPage />)

        // Multiple instances of "Crypto Follow" exist in the page
        expect(screen.getAllByText('Crypto Follow').length).toBeGreaterThan(0)
    });

    it('displays the login form header', () => {
        render(<LoginPage />)

        expect(screen.getByText('Bon retour !')).toBeInTheDocument()
    });
});
