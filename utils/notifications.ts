/**
 * Notification Utilities
 * Functions for sending email and Discord notifications when alerts are triggered
 */

interface AlertNotification {
    crypto_symbol: string;
    target_price: number;
    current_price: number;
    condition: 'ABOVE' | 'BELOW';
    user_email?: string;
}

/**
 * Send an email notification using a configured email service
 * In production, this would use Resend, SendGrid, or similar
 */
export async function sendEmailNotification(notification: AlertNotification): Promise<boolean> {
    const { crypto_symbol, target_price, current_price, condition, user_email } = notification;

    if (!user_email) {
        console.log('No email address provided for notification');
        return false;
    }

    const subject = `🚨 Alerte ${crypto_symbol} déclenchée !`;
    const message = `
Votre alerte pour ${crypto_symbol} a été déclenchée !

Condition : Prix ${condition === 'ABOVE' ? 'supérieur à' : 'inférieur à'} $${target_price.toLocaleString()}
Prix actuel : $${current_price.toLocaleString()}

Ce message a été envoyé automatiquement par Crypto Follow.
    `.trim();

    // In production, use a real email service like Resend
    // Example with Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //     from: 'alerts@cryptofollow.app',
    //     to: user_email,
    //     subject: subject,
    //     text: message,
    // });

    console.log('📧 Email notification (mock):', { to: user_email, subject, message });
    return true;
}

/**
 * Send a Discord webhook notification
 */
export async function sendDiscordNotification(notification: AlertNotification): Promise<boolean> {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
        console.log('Discord webhook URL not configured');
        return false;
    }

    const { crypto_symbol, target_price, current_price, condition } = notification;

    const embed = {
        title: `🚨 Alerte ${crypto_symbol} déclenchée !`,
        color: condition === 'ABOVE' ? 0x00ff00 : 0xff0000,
        fields: [
            {
                name: 'Condition',
                value: condition === 'ABOVE' ? 'Prix supérieur à' : 'Prix inférieur à',
                inline: true,
            },
            {
                name: 'Prix cible',
                value: `$${target_price.toLocaleString()}`,
                inline: true,
            },
            {
                name: 'Prix actuel',
                value: `$${current_price.toLocaleString()}`,
                inline: true,
            },
        ],
        timestamp: new Date().toISOString(),
        footer: {
            text: 'Crypto Follow Alert System',
        },
    };

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                embeds: [embed],
            }),
        });

        if (!response.ok) {
            console.error('Discord webhook failed:', response.status);
            return false;
        }

        console.log('✅ Discord notification sent');
        return true;
    } catch (error) {
        console.error('Error sending Discord notification:', error);
        return false;
    }
}

/**
 * Send all configured notifications for an alert
 */
export async function sendAlertNotifications(notification: AlertNotification): Promise<{
    email: boolean;
    discord: boolean;
}> {
    const [emailResult, discordResult] = await Promise.all([
        sendEmailNotification(notification),
        sendDiscordNotification(notification),
    ]);

    return {
        email: emailResult,
        discord: discordResult,
    };
}
