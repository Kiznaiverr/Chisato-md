export default {
    command: 'menu',
    aliases: ['help', 'commands'],
    category: 'general',
    description: 'Show bot command menu',
    usage: 'menu [category]',
    cooldown: 5,
    
    async execute({ reply, args, db, sender, plugins, prefix }) {
        const user = db.getUser(sender)
        const isOwner = db.isOwner(sender)
        const isAdmin = db.isAdmin(sender)
        
        const categories = {
            general: '🌟 General',
            user: '👤 User',
            admin: '👨‍💼 Admin',
            owner: '👑 Owner',
            group: '👥 Group',
            fun: '🎮 Fun',
            media: '📁 Media',
            search: '🔍 Search'
        }

        if (args[0]) {
            const category = args[0].toLowerCase()
            if (!categories[category]) {
                return reply('❌ Invalid category!\n\nAvailable categories:\n' + 
                    Object.entries(categories).map(([key, value]) => `• ${value}`).join('\n'))
            }
            
            const categoryPlugins = plugins.filter(p => p.category === category)
            
            if (categoryPlugins.length === 0) {
                return reply(`❌ No commands found in ${categories[category]} category.`)
            }
            
            let menuText = `┌─「 ${categories[category]} Commands 」\n`
            menuText += `├ Prefix: ${prefix}\n`
            menuText += `├ Total: ${categoryPlugins.length} commands\n`
            menuText += `├─────────────────\n`
            
            categoryPlugins.forEach((plugin, index) => {
                const isLast = index === categoryPlugins.length - 1
                const symbol = isLast ? '└' : '├'
                
                // Check if user has permission to see this command
                if (plugin.ownerOnly && !isOwner) return
                if (plugin.adminOnly && !isAdmin && !isOwner) return
                
                menuText += `${symbol} ${prefix}${plugin.command}`
                if (plugin.aliases && plugin.aliases.length > 0) {
                    menuText += ` (${plugin.aliases.join(', ')})`
                }
                menuText += `\n`
                if (plugin.description) {
                    menuText += `${isLast ? ' ' : '│'} ↳ ${plugin.description}\n`
                }
            })
            
            return reply(menuText)
        }

        // Main menu
        const botName = db.getSetting('botName')
        const now = new Date()
        const time = now.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' })
        const date = now.toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' })

        let menuText = `┌─「 ${botName} 」\n`
        menuText += `├ 👋 Hello, ${user.name || 'User'}!\n`
        menuText += `├ 📅 ${date}\n`
        menuText += `├ 🕒 ${time}\n`
        menuText += `├ 🎯 Level: ${user.level}\n`
        menuText += `├ ⭐ EXP: ${user.exp}\n`
        menuText += `├ 🎫 Limit: ${user.limit}\n`
        menuText += `├ 💎 Premium: ${user.premium ? 'Yes' : 'No'}\n`
        menuText += `├─────────────────\n`
        menuText += `├ 📋 Available Categories:\n`
        
        // Count commands per category
        const categoryCounts = {}
        plugins.forEach(plugin => {
            // Check permissions before counting
            if (plugin.ownerOnly && !isOwner) return
            if (plugin.adminOnly && !isAdmin && !isOwner) return
            
            const category = plugin.category || 'general'
            categoryCounts[category] = (categoryCounts[category] || 0) + 1
        })

        Object.entries(categories).forEach(([key, value], index, arr) => {
            const count = categoryCounts[key] || 0
            if (count > 0) {
                const isLast = index === arr.length - 1
                const symbol = isLast ? '└' : '├'
                menuText += `${symbol} ${value} (${count})\n`
            }
        })

        menuText += `\n💡 Usage: ${prefix}menu <category>\n`
        menuText += `📝 Example: ${prefix}menu general\n`
        menuText += `\n🔗 Bot by Kiznavierr`

        await reply(menuText)
    }
}
