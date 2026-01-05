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

        expect(screen.getByPlaceholderText('Adresse Email')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Mot de passe')).toBeInTheDocument()
    });

    it('renders login and signup buttons', () => {
        render(<LoginPage />)

        expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /s'inscrire/i })).toBeInTheDocument()
    });

    it('allows typing in email input', () => {
        render(<LoginPage />)

        const emailInput = screen.getByPlaceholderText('Adresse Email') as HTMLInputElement

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

        expect(emailInput.value).toBe('test@example.com')
    });

    it('allows typing in password input', () => {
        render(<LoginPage />)

        const passwordInput = screen.getByPlaceholderText('Mot de passe') as HTMLInputElement

        fireEvent.change(passwordInput, { target: { value: 'password123' } })

        expect(passwordInput.value).toBe('password123')
    });

    it('displays the app title', () => {
        render(<LoginPage />)

        expect(screen.getByText('Crypto Follow')).toBeInTheDocument()
    });

    it('displays the subtitle', () => {
        render(<LoginPage />)

        expect(screen.getByText('Connectez-vous à votre compte')).toBeInTheDocument()
    });
});
