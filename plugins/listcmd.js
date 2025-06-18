export default {
    command: 'listcmd',
    aliases: ['cmdlist', 'commands', 'list'],
    category: 'general',
    description: 'Show quick list of all available commands',
    usage: 'listcmd [category]',
    cooldown: 2,
    
    async execute({ reply, args, db, sender, plugins, prefix }) {
        const isOwner = db.isOwner(sender)
        const isAdmin = db.isAdmin(sender)
        
        // Filter plugins based on permissions
        const availablePlugins = plugins.filter(plugin => {
            if (plugin.ownerOnly && !isOwner) return false
            if (plugin.adminOnly && !isAdmin && !isOwner) return false
            return true
        })
        
        // If category specified
        if (args[0]) {
            const category = args[0].toLowerCase()
            const categoryPlugins = availablePlugins.filter(plugin => 
                (plugin.category || 'misc').toLowerCase() === category
            )
            
            if (categoryPlugins.length === 0) {
                return reply(`❌ No commands found in category "${category}"`)
            }
            
            const categoryName = category.charAt(0).toUpperCase() + category.slice(1)
            let text = `╭─「 📋 ${categoryName} Commands 」\n`
            text += `├ 🎯 Prefix: ${prefix}\n`
            text += `├ 📊 Total: ${categoryPlugins.length} commands\n`
            text += `├─────────────────────────\n`
            
            categoryPlugins.forEach((plugin, index) => {
                const isLast = index === categoryPlugins.length - 1
                const symbol = isLast ? '╰' : '├'
                
                // Format: prefix + command + aliases
                let cmdText = `${prefix}${plugin.command}`
                if (plugin.aliases && plugin.aliases.length > 0) {
                    cmdText += ` (${plugin.aliases.join(', ')})`
                }
                
                text += `${symbol} ${cmdText}\n`
            })
            
            text += `\n💡 Use ${prefix}cmdinfo <command> for details`
            return reply(text)
        }
        
        // Group by categories
        const categories = {}
        availablePlugins.forEach(plugin => {
            const category = plugin.category || 'misc'
            if (!categories[category]) {
                categories[category] = []
            }
            categories[category].push(plugin)
        })
        
        // Build compact list
        let text = `╭─「 📋 Quick Command List 」\n`
        text += `├ 🎯 Prefix: ${prefix}\n`
        text += `├ 📊 Total: ${availablePlugins.length} commands\n`
        text += `├─────────────────────────\n`
        
        const categoryIcons = {
            general: '🌟',
            user: '👤', 
            admin: '👨‍💼',
            owner: '👑',
            group: '👥',
            fun: '🎮',
            media: '📁',
            search: '🔍',
            misc: '🔧'
        }
        
        Object.entries(categories).forEach(([categoryName, plugins], catIndex, catArr) => {
            const isLastCategory = catIndex === catArr.length - 1
            const icon = categoryIcons[categoryName] || '📦'
            const categoryTitle = categoryName.charAt(0).toUpperCase() + categoryName.slice(1)
            
            text += `├ ${icon} ${categoryTitle} (${plugins.length}):\n`
            
            // Show commands in compact format (3 per line)
            const commandList = plugins.map(p => prefix + p.command)
            const chunked = []
            for (let i = 0; i < commandList.length; i += 3) {
                chunked.push(commandList.slice(i, i + 3))
            }
            
            chunked.forEach((chunk, chunkIndex) => {
                const isLastChunk = chunkIndex === chunked.length - 1 && isLastCategory
                const symbol = isLastChunk ? '╰' : '│'
                text += `${symbol}   ${chunk.join(' • ')}\n`
            })
        })
        
        text += `\n🎯 Navigation:\n`
        text += `• ${prefix}listcmd <category> - Category commands\n`
        text += `• ${prefix}cmdinfo <command> - Command details\n`
        text += `• ${prefix}menu - Full interactive menu`
        
        return reply(text)
    },    
    getCategoryIcon(category) {
        const icons = {
            general: '🌟',
            user: '👤', 
            admin: '👨‍💼',
            owner: '👑',
            group: '👥',
            fun: '🎮',
            media: '📁',
            search: '🔍',
            misc: '🔧'
        }
        return icons[category] || '📦'
    }
}
