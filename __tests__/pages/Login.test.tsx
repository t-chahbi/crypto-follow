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
    it('renders login form', () => {
        render(<LoginPage />)

        expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    });

    it('allows typing in inputs', () => {
        render(<LoginPage />)

        const emailInput = screen.getByPlaceholderText('Email address') as HTMLInputElement
        const passwordInput = screen.getByPlaceholderText('Password') as HTMLInputElement

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'password123' } })

        expect(emailInput.value).toBe('test@example.com')
        expect(passwordInput.value).toBe('password123')
    });
});
