/**
 * Script de test pour envoyer une vraie notification Discord
 * Usage: npx ts-node scripts/test-discord.ts
 */

async function testDiscordWebhook() {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
        console.error('❌ DISCORD_WEBHOOK_URL not set in environment');
        console.log('💡 Run with: DISCORD_WEBHOOK_URL=https://... npx ts-node scripts/test-discord.ts');
        process.exit(1);
    }

    console.log('🔔 Sending test notification to Discord...');

    const embed = {
        title: '🧪 Test Notification - Crypto Follow',
        description: 'Ceci est un test de notification Discord depuis Crypto Follow.',
        color: 0x6366f1, // Indigo
        fields: [
            {
                name: '📈 Crypto',
                value: 'BTC (Bitcoin)',
                inline: true,
            },
            {
                name: '💰 Prix simulé',
                value: '$67,842.00',
                inline: true,
            },
            {
                name: '🎯 Condition',
                value: 'Supérieur à $65,000',
                inline: true,
            },
        ],
        timestamp: new Date().toISOString(),
        footer: {
            text: '✅ Webhook Discord fonctionnel!',
        },
    };

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: '🚨 **Test d\'alerte Crypto Follow**',
                embeds: [embed],
            }),
        });

        if (response.ok) {
            console.log('✅ Notification Discord envoyée avec succès!');
        } else {
            console.error('❌ Échec:', response.status, response.statusText);
            const text = await response.text();
            console.error('Response:', text);
        }
    } catch (error) {
        console.error('❌ Erreur:', error);
    }
}

testDiscordWebhook();
