export default {
    command: 'owner',
    aliases: ['creator', 'dev'],
    description: 'Show owner contact information',
    category: 'general',
    usage: '.owner',
    cooldown: 5,
    async execute(context) {
        const { reply, sock, config } = context
        
        const ownerInfo = config.get('ownerSettings')
        const botInfo = config.get('botSettings')
        
        const ownerText = `
👨‍💻 *BOT OWNER*

📱 *Name:* ${ownerInfo.ownerName || 'Bot Owner'}
📞 *Number:* +${ownerInfo.ownerNumber || 'Not Set'}
🤖 *Bot:* ${botInfo.botName || 'Chisato-MD'}
🌐 *Version:* ${botInfo.version || '1.0.0'}

💻 *About Owner:*
Passionate developer specializing in WhatsApp bot development using modern technologies like Baileys, Node.js, and JavaScript.

🛠️ *Services:*
• WhatsApp Bot Development
• Custom Plugin Development
• Bot Maintenance & Support
• API Integration

💎 *This Bot Features:*
• Modern Plugin System
• Local JSON Database
• User Profile Management
• Group Administration
• Auto Response System

📝 *Want a custom bot?*
Contact the owner through the number above for bot services!

🙏 *Support the project:*
Give a ⭐ if you like this bot!
        `.trim()
          await reply(ownerText)
    }
}
