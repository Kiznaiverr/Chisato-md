import font from '../../lib/font.js'

export default {
    command: 'owner',
    aliases: ['creator', 'dev'],
    description: 'Show owner details',
    category: 'general',
    usage: '',
    cooldown: 5,
    async execute(context) {
        const { reply, sock, config } = context
        
        const ownerInfo = config.get('ownerSettings')
        const botInfo = config.get('botSettings')
        
        const ownerText = `
👨‍💻 ${font.bold(font.smallCaps('BOT OWNER'))}

📱 ${font.bold(font.smallCaps('Name'))}: ${ownerInfo.ownerName || 'Bot Owner'}
📞 ${font.bold(font.smallCaps('Number'))}: +${ownerInfo.ownerNumber || 'Not Set'}
🤖 ${font.bold(font.smallCaps('Bot'))}: ${botInfo.botName || 'Chisato-MD'}
🌐 ${font.bold(font.smallCaps('Version'))}: ${botInfo.version || '1.0.0'}

💻 ${font.bold(font.smallCaps('About Owner'))}:
${font.smallCaps('Passionate developer specializing in WhatsApp bot development using modern technologies like Baileys, Node.js, and JavaScript')}

🛠️ ${font.bold(font.smallCaps('Services'))}:
• ${font.smallCaps('WhatsApp Bot Development')}
• ${font.smallCaps('Custom Plugin Development')}
• ${font.smallCaps('Bot Maintenance & Support')}
• ${font.smallCaps('API Integration')}

💎 ${font.bold(font.smallCaps('This Bot Features'))}:
• ${font.smallCaps('Modern Plugin System')}
• ${font.smallCaps('Local JSON Database')}
• ${font.smallCaps('User Profile Management')}
• ${font.smallCaps('Group Administration')}
• ${font.smallCaps('Auto Response System')}

📝 ${font.bold(font.smallCaps('Want a custom bot'))}?
${font.smallCaps('Contact the owner through the number above for bot services')}!

🙏 ${font.bold(font.smallCaps('Support the project'))}:
${font.smallCaps('Give a')} ⭐ ${font.smallCaps('if you like this bot')}!
        `.trim()
          await reply(ownerText)
    }
}
