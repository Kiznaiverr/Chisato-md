export default {
    command: 'owner',
    aliases: ['creator', 'dev'],
    description: 'Show owner contact information',
    category: 'general',
    usage: '.owner',
    cooldown: 5,
    async execute(context) {
        const { reply, sock } = context
        
        const ownerText = `
👨‍💻 *BOT DEVELOPER*

📱 *Name:* Kiznavierr
🌐 *GitHub:* @kiznavierr
📧 *Contact:* Available on GitHub

💻 *About Developer:*
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
Contact the developer through GitHub for custom bot development services!

🙏 *Support the project:*
Give a ⭐ on GitHub if you like this bot!
        `.trim()
        
        await reply(ownerText)
    }
}
