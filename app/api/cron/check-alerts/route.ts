import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendAlertNotifications } from '@/utils/notifications'
import { getMarketData } from '@/utils/coingecko'

// This route is meant to be called by a cron job (Vercel Cron, GitHub Actions, etc.)
export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Maximum execution time in seconds

/**
 * GET /api/cron/check-alerts
 * Checks all active alerts against current market prices and sends notifications
 */
export async function GET(request: Request) {
    // Verify cron secret (optional but recommended for security)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Initialize Supabase client with service role key for admin access
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Missing Supabase configuration')
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Fetch all active alerts
        const { data: alerts, error: alertsError } = await supabase
            .from('alerts')
            .select(`
                id,
                user_id,
                crypto_symbol,
                target_price,
                condition,
                is_active
            `)
            .eq('is_active', true)

        if (alertsError) {
            throw alertsError
        }

        if (!alerts || alerts.length === 0) {
            return NextResponse.json({
                message: 'No active alerts to check',
                checked: 0,
                triggered: 0,
            })
        }

        // Fetch current market data
        const marketData = await getMarketData()

        if (!Array.isArray(marketData) || marketData.length === 0) {
            throw new Error('Failed to fetch market data')
        }

        // Create price map from market data
        const priceMap = new Map<string, number>()
        marketData.forEach((coin: { symbol: string; current_price: number }) => {
            priceMap.set(coin.symbol.toUpperCase(), coin.current_price)
        })

        // Check each alert
        const triggeredAlerts: number[] = []
        const notifications: Promise<any>[] = []

        for (const alert of alerts) {
            const currentPrice = priceMap.get(alert.crypto_symbol)

            if (!currentPrice) {
                console.log(`No price data for ${alert.crypto_symbol}`)
                continue
            }

            let isTriggered = false

            if (alert.condition === 'ABOVE' && currentPrice > alert.target_price) {
                isTriggered = true
            } else if (alert.condition === 'BELOW' && currentPrice < alert.target_price) {
                isTriggered = true
            }

            if (isTriggered) {
                triggeredAlerts.push(alert.id)

                // Get user email for notification
                const { data: userData } = await supabase.auth.admin.getUserById(alert.user_id)

                // Queue notification
                notifications.push(
                    sendAlertNotifications({
                        crypto_symbol: alert.crypto_symbol,
                        target_price: alert.target_price,
                        current_price: currentPrice,
                        condition: alert.condition,
                        user_email: userData?.user?.email,
                    })
                )

                console.log(`🚨 Alert triggered: ${alert.crypto_symbol} ${alert.condition} ${alert.target_price} (current: ${currentPrice})`)
            }
        }

        // Send all notifications
        await Promise.all(notifications)

        // Mark triggered alerts as inactive
        if (triggeredAlerts.length > 0) {
            const { error: updateError } = await supabase
                .from('alerts')
                .update({ is_active: false })
                .in('id', triggeredAlerts)

            if (updateError) {
                console.error('Error updating alerts:', updateError)
            }
        }

        return NextResponse.json({
            message: 'Alert check completed',
            checked: alerts.length,
            triggered: triggeredAlerts.length,
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        console.error('Error checking alerts:', error)
        return NextResponse.json(
            { error: 'Failed to check alerts', details: String(error) },
            { status: 500 }
        )
    }
}
