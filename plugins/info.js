export default {
    command: 'info',
    aliases: ['botinfo'],
    category: 'general',
    description: 'Show bot information',
    usage: 'info',
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
        
        let infoText = `┌─「 Bot Information 」\n`
        infoText += `├ 🤖 Name: ${botName}\n`
        infoText += `├ 📱 Number: ${sock.user.id.split(':')[0]}\n`
        infoText += `├ 🎯 Prefix: ${prefix}\n`
        infoText += `├ ⏰ Uptime: ${uptimeString}\n`
        infoText += `├ 💾 Memory: ${memUsed}MB / ${memTotal}MB\n`
        infoText += `├ 🌐 Platform: ${process.platform}\n`
        infoText += `├ 📦 Node.js: ${process.version}\n`
        infoText += `├─────────────────\n`
        infoText += `├ 👨‍💻 Developer: Kiznavierr\n`
        infoText += `├ 📚 Library: @whiskeysockets/baileys\n`
        infoText += `└ 💝 Thanks for using!`
        
        await reply(infoText)
    }
}
