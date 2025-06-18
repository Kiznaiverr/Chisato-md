export default {
    command: 'info',
    aliases: ['about', 'botinfo'],
    description: 'Show bot information',
    category: 'general',
    usage: '.info',
    cooldown: 5,
    async execute(context) {
        const { reply, sock, db } = context
        const botName = db.getSetting('botName')
        const prefix = db.getSetting('prefix')
        
        // Get bot uptime
        const uptime = process.uptime()
        const hours = Math.floor(uptime / 3600)
        const minutes = Math.floor((uptime % 3600) / 60)
        const seconds = Math.floor(uptime % 60)
        
        // Get memory usage
        const memUsage = process.memoryUsage()
        const memUsed = (memUsage.heapUsed / 1024 / 1024).toFixed(2)
        const memTotal = (memUsage.heapTotal / 1024 / 1024).toFixed(2)
        
        const infoText = `
┌─「 *${botName} INFO* 」
│ 
├ 🤖 *Bot Name:* ${botName}
├ 📱 *Bot Number:* ${sock.user.id.split(':')[0]}
├ ⚙️ *Prefix:* ${prefix}
├ 🕐 *Uptime:* ${hours}h ${minutes}m ${seconds}s
├ 💾 *Memory:* ${memUsed}MB / ${memTotal}MB
├ 📦 *Platform:* ${process.platform}
├ 🚀 *Node.js:* ${process.version}
├ 📚 *Library:* @whiskeysockets/baileys
│ 
├ 👤 *Developer:* Kiznavierr
├ 📧 *Contact:* Use ${prefix}owner
├ 🌐 *Repository:* GitHub
│ 
└────

💡 *Features:*
• Multi-device support
• Plugin system
• Database management
• Auto-response
• Group management
• User profiles & levels
• And much more!

Type ${prefix}menu to see all commands.
        `.trim()
        
        await reply(infoText)
    }
}
