import font from '../../lib/font.js'

export default {
    command: 'info',
    aliases: ['botinfo'],
    category: 'general',
    description: 'Show bot info',
    usage: '',
    cooldown: 5,
    
    async execute({ reply, db, sock }) {
        const botName = db.getSetting('botName')
        const prefix = db.getSetting('prefix')
        const uptime = process.uptime()
        
        // Format uptime
        const days = Math.floor(uptime / 86400)
        const hours = Math.floor((uptime % 86400) / 3600)
        const minutes = Math.floor((uptime % 3600) / 60)
        const seconds = Math.floor(uptime % 60)
        
        const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`
        
        // Get memory usage
        const memUsage = process.memoryUsage()
        const memUsed = (memUsage.heapUsed / 1024 / 1024).toFixed(2)
        const memTotal = (memUsage.heapTotal / 1024 / 1024).toFixed(2)
        
        let infoText = `┌─「 ${font.smallCaps('Bot Information')} 」\n`
        infoText += `├ 🤖 ${font.smallCaps('Name')}: ${font.smallCaps(botName)}\n`
        infoText += `├ 📱 ${font.smallCaps('Number')}: ${sock.user.id.split(':')[0]}\n`
        infoText += `├ 🎯 ${font.smallCaps('Prefix')}: ${prefix}\n`
        infoText += `├ ⏰ ${font.smallCaps('Uptime')}: ${uptimeString}\n`
        infoText += `├ 💾 ${font.smallCaps('Memory')}: ${memUsed}${font.smallCaps('MB')} / ${memTotal}${font.smallCaps('MB')}\n`
        infoText += `├ 🌐 ${font.smallCaps('Platform')}: ${font.smallCaps(process.platform)}\n`
        infoText += `├ 📦 ${font.smallCaps('Node.js')}: ${process.version}\n`
        infoText += `├───────────────\n`
        infoText += `├ 👨‍💻 ${font.smallCaps('Developer')}: ${font.smallCaps('Kiznavierr')}\n`
        infoText += `├ 📚 ${font.smallCaps('Library')}: @whiskeysockets/baileys\n`
        infoText += `└ 💝 ${font.smallCaps('Thanks for using')}!`
        
        await reply(infoText)
    }
}
