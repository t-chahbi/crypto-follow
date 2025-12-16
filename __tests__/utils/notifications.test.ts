import { sendDiscordNotification, sendEmailNotification, sendAlertNotifications } from '@/utils/notifications'

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('Notification Utilities', () => {
    const mockNotification = {
        crypto_symbol: 'BTC',
        target_price: 50000,
        current_price: 51234,
        condition: 'ABOVE' as const,
        user_email: 'test@example.com',
    }

    beforeEach(() => {
        jest.clearAllMocks()
        // Reset environment variables
        delete process.env.DISCORD_WEBHOOK_URL
    })

    describe('sendDiscordNotification', () => {
        it('returns false when webhook URL is not configured', async () => {
            const result = await sendDiscordNotification(mockNotification)
            expect(result).toBe(false)
            expect(mockFetch).not.toHaveBeenCalled()
        })

        it('sends notification successfully when webhook is configured', async () => {
            process.env.DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/test'
            mockFetch.mockResolvedValueOnce({ ok: true })

            const result = await sendDiscordNotification(mockNotification)

            expect(result).toBe(true)
            expect(mockFetch).toHaveBeenCalledTimes(1)
            expect(mockFetch).toHaveBeenCalledWith(
                'https://discord.com/api/webhooks/test',
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                })
            )
        })

        it('includes correct embed data in the request', async () => {
            process.env.DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/test'
            mockFetch.mockResolvedValueOnce({ ok: true })

            await sendDiscordNotification(mockNotification)

            const callArgs = mockFetch.mock.calls[0]
            const body = JSON.parse(callArgs[1].body)

            expect(body.embeds).toHaveLength(1)
            expect(body.embeds[0].title).toContain('BTC')
            expect(body.embeds[0].color).toBe(0x00ff00) // Green for ABOVE
        })

        it('uses red color for BELOW condition', async () => {
            process.env.DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/test'
            mockFetch.mockResolvedValueOnce({ ok: true })

            await sendDiscordNotification({ ...mockNotification, condition: 'BELOW' })

            const callArgs = mockFetch.mock.calls[0]
            const body = JSON.parse(callArgs[1].body)

            expect(body.embeds[0].color).toBe(0xff0000) // Red for BELOW
        })

        it('returns false when webhook request fails', async () => {
            process.env.DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/test'
            mockFetch.mockResolvedValueOnce({ ok: false, status: 500 })

            const result = await sendDiscordNotification(mockNotification)

            expect(result).toBe(false)
        })

        it('handles network errors gracefully', async () => {
            process.env.DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/test'
            mockFetch.mockRejectedValueOnce(new Error('Network error'))

            const result = await sendDiscordNotification(mockNotification)

            expect(result).toBe(false)
        })
    })

    describe('sendEmailNotification', () => {
        it('returns false when no email is provided', async () => {
            const notificationWithoutEmail = { ...mockNotification, user_email: undefined }
            const result = await sendEmailNotification(notificationWithoutEmail)
            expect(result).toBe(false)
        })

        it('returns true when email is provided (mock mode)', async () => {
            const result = await sendEmailNotification(mockNotification)
            expect(result).toBe(true)
        })
    })

    describe('sendAlertNotifications', () => {
        it('sends both email and discord notifications', async () => {
            process.env.DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/test'
            mockFetch.mockResolvedValueOnce({ ok: true })

            const result = await sendAlertNotifications(mockNotification)

            expect(result.email).toBe(true)
            expect(result.discord).toBe(true)
        })

        it('handles partial failures', async () => {
            // Discord not configured, but email should work
            const result = await sendAlertNotifications(mockNotification)

            expect(result.email).toBe(true)
            expect(result.discord).toBe(false)
        })
    })
})
