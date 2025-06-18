export default {
    command: 'status',
    aliases: ['stats'],
    category: 'general',
    description: 'Show bot status',
    usage: 'status',
    cooldown: 5,
    
    async execute({ reply, db, plugins, sock }) {
        const botName = db.getSetting('botName')
        const prefix = db.getSetting('prefix')
        
        // Get uptime
        const uptime = process.uptime()
        const days = Math.floor(uptime / 86400)
        const hours = Math.floor((uptime % 86400) / 3600)
        const minutes = Math.floor((uptime % 3600) / 60)
        const seconds = Math.floor(uptime % 60)
        const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`
        
        // Get memory usage
        const memUsage = process.memoryUsage()
        const memUsed = (memUsage.heapUsed / 1024 / 1024).toFixed(2)
        const memTotal = (memUsage.heapTotal / 1024 / 1024).toFixed(2)
        
        // Count plugins by category
        const categories = {}
        plugins.forEach(plugin => {
            const cat = plugin.category || 'general'
            categories[cat] = (categories[cat] || 0) + 1
        })
        
        // Count users and groups
        const userCount = Object.keys(db.users).length
        const groupCount = Object.keys(db.groups).length
        
        // Get admin count
        const admins = db.getSetting('admins')
        const adminCount = admins ? admins.split(',').filter(a => a.trim()).length : 0
        
        let statusText = `┌─「 ${botName} Status 」\n`
        statusText += `├ 🤖 Bot: ${sock.user.id.split(':')[0]}\n`
        statusText += `├ ⏰ Uptime: ${uptimeString}\n`
        statusText += `├ 💾 Memory: ${memUsed}MB / ${memTotal}MB\n`
        statusText += `├ 🎯 Prefix: ${prefix}\n`
        statusText += `├─────────────────\n`
        statusText += `├ 📊 Statistics:\n`
        statusText += `├ 👥 Users: ${userCount}\n`
        statusText += `├ 🏘️ Groups: ${groupCount}\n`
        statusText += `├ 👨‍💼 Admins: ${adminCount}\n`
        statusText += `├ 🔌 Plugins: ${plugins.length}\n`
        statusText += `├─────────────────\n`
        statusText += `├ 📂 Plugin Categories:\n`
        
        Object.entries(categories).forEach(([category, count], index, arr) => {
            const isLast = index === arr.length - 1
            const symbol = isLast ? '└' : '├'
            const categoryName = category.charAt(0).toUpperCase() + category.slice(1)
            statusText += `${symbol} ${categoryName}: ${count}\n`
        })
        
        await reply(statusText)
    }
}
