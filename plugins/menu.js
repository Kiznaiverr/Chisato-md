export default {
    command: 'menu',
    aliases: ['help', 'commands', 'm'],
    category: 'general',
    description: 'Show dynamic bot command menu',
    usage: 'menu [category] or menu [search]',
    cooldown: 3,
    
    async execute({ reply, args, db, sender, plugins, prefix, isGroup, groupMetadata }) {
        const user = db.getUser(sender)
        const isOwner = db.isOwner(sender)
        const isAdmin = db.isAdmin(sender)
        
        // Dynamic category detection from plugins
        const availableCategories = {}
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
        
        // Dynamically build categories from loaded plugins
        plugins.forEach(plugin => {
            // Check permissions before counting
            if (plugin.ownerOnly && !isOwner) return
            if (plugin.adminOnly && !isAdmin && !isOwner) return
            
            const category = plugin.category || 'misc'
            if (!availableCategories[category]) {
                const icon = categoryIcons[category] || '📦'
                const name = category.charAt(0).toUpperCase() + category.slice(1)
                availableCategories[category] = {
                    name: `${icon} ${name}`,
                    count: 0,
                    plugins: []
                }
            }
            availableCategories[category].count++
            availableCategories[category].plugins.push(plugin)
        })

        // Handle category or search query
        if (args[0]) {
            const query = args[0].toLowerCase()
            
            // Check if it's a category
            if (availableCategories[query]) {
                return this.showCategoryMenu(availableCategories[query], query, prefix, reply)
            }
            
            // Check if it's a search query
            const searchResults = this.searchCommands(plugins, query, isOwner, isAdmin)
            if (searchResults.length > 0) {
                return this.showSearchResults(searchResults, query, prefix, reply)
            }
            
            // Invalid query
            const categoryList = Object.entries(availableCategories)
                .map(([key, value]) => `${value.name} (${value.count})`)
                .join('\n├ ')
            
            return reply(
                `❌ Category or command "${query}" not found!\n\n` +
                `📂 Available categories:\n├ ${categoryList}\n\n` +
                `💡 You can also search commands: ${prefix}menu <keyword>`
            )
        }

        // Main dynamic menu
        await this.showMainMenu(availableCategories, user, db, prefix, reply, isGroup, groupMetadata)
    },
    
    showMainMenu(categories, user, db, prefix, reply, isGroup, groupMetadata) {
        const botName = db.getSetting('botName')
        const now = new Date()
        const time = now.toLocaleTimeString('id-ID', { 
            timeZone: 'Asia/Jakarta',
            hour12: false 
        })
        const date = now.toLocaleDateString('id-ID', { 
            timeZone: 'Asia/Jakarta',
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric'
        })
        
        // Calculate total commands
        const totalCommands = Object.values(categories).reduce((sum, cat) => sum + cat.count, 0)
        
        // User status
        const isOwner = db.isOwner(user.jid)
        const isPremium = db.isPremium(user.jid)
        const userLevel = user.level || 1
        const userExp = user.exp || 0
        const nextLevelExp = userLevel * 100
        const expProgress = Math.round((userExp / nextLevelExp) * 10)
        const progressBar = '█'.repeat(expProgress) + '░'.repeat(10 - expProgress)
        
        // Status text and icon
        let statusIcon = '🆓'
        let statusText = 'Free'
        if (isOwner) {
            statusIcon = '👑'
            statusText = 'Owner'
        } else if (isPremium) {
            statusIcon = '💎'
            statusText = 'Premium'
        }
        
        let menuText = `╭─「 🤖 ${botName} Menu 」\n`
        menuText += `├ 👋 Welcome, ${user.name || 'User'}!\n`
        menuText += `├ 📅 ${date} • 🕒 ${time}\n`
        menuText += `├ 📍 ${isGroup ? `Group: ${(groupMetadata?.subject || 'Unknown').substring(0, 20)}...` : 'Private Chat'}\n`
        menuText += `├─────────────────────────\n`
        menuText += `├ 📊 Your Stats:\n`
        menuText += `├ 🎯 Level: ${userLevel} | ⭐ EXP: ${userExp}/${nextLevelExp}\n`
        menuText += `├ 📈 Progress: ${progressBar} ${Math.round((userExp/nextLevelExp)*100)}%\n`
        
        // Limit display
        if (isOwner || isPremium) {
            menuText += `├ 🎫 Daily Limit: ∞ Unlimited\n`
        } else {
            const maxLimit = db.getSetting('dailyLimit') || 50
            menuText += `├ 🎫 Daily Limit: ${user.limit || 0}/${maxLimit}\n`
        }
        
        menuText += `├ ${statusIcon} Status: ${statusText}\n`
        menuText += `├─────────────────────────\n`
        menuText += `├ 📦 Command Categories (${totalCommands} total):\n`
        
        // Dynamic category list
        Object.entries(categories).forEach(([key, value], index, arr) => {
            const isLast = index === arr.length - 1
            const symbol = isLast ? '╰' : '├'
            const commandText = value.count === 1 ? 'command' : 'commands'
            menuText += `${symbol} ${value.name} • ${value.count} ${commandText}\n`
        })
        
        menuText += `\n🎯 Navigation:\n`
        menuText += `• ${prefix}menu <category> - View category\n`
        menuText += `• ${prefix}menu <keyword> - Search commands\n`
        menuText += `• ${prefix}ping - Check bot status\n`
        menuText += `\n💡 Example: ${prefix}menu fun\n`
        menuText += `🔍 Search: ${prefix}menu kick\n`
        menuText += `\n🔗 Powered by Kiznavierr`
        
        return reply(menuText)
    },
    
    showCategoryMenu(categoryData, categoryName, prefix, reply) {
        let menuText = `╭─「 ${categoryData.name} Commands 」\n`
        menuText += `├ 🎯 Prefix: ${prefix}\n`
        menuText += `├ 📊 Total: ${categoryData.count} commands\n`
        menuText += `├─────────────────────────\n`
        
        categoryData.plugins.forEach((plugin, index) => {
            const isLast = index === categoryData.plugins.length - 1
            const symbol = isLast ? '╰' : '├'
            
            // Command with aliases
            let commandLine = `${symbol} ${prefix}${plugin.command}`
            if (plugin.aliases && plugin.aliases.length > 0) {
                const aliasText = plugin.aliases.map(alias => `${prefix}${alias}`).join(', ')
                commandLine += ` (${aliasText})`
            }
            
            menuText += `${commandLine}\n`
            
            // Description with proper indentation
            if (plugin.description) {
                const indent = isLast ? '  ' : '│ '
                menuText += `${indent}↳ ${plugin.description}\n`
            }
            
            // Usage example if available
            if (plugin.usage) {
                const indent = isLast ? '  ' : '│ '
                menuText += `${indent}💡 Usage: ${prefix}${plugin.usage}\n`
            }
        })
        
        menuText += `\n🏠 Back to main: ${prefix}menu\n`
        menuText += `🔍 Search: ${prefix}menu <keyword>`
        
        return reply(menuText)
    },
    
    showSearchResults(results, query, prefix, reply) {
        let menuText = `╭─「 🔍 Search: "${query}" 」\n`
        menuText += `├ 📊 Found: ${results.length} ${results.length === 1 ? 'command' : 'commands'}\n`
        menuText += `├─────────────────────────\n`
        
        results.forEach((plugin, index) => {
            const isLast = index === results.length - 1
            const symbol = isLast ? '╰' : '├'
            
            // Show category badge
            const categoryIcon = plugin.category ? 
                (plugin.category === 'admin' ? '👨‍💼' : 
                 plugin.category === 'owner' ? '👑' : 
                 plugin.category === 'fun' ? '🎮' : '📦') : '📦'
            
            menuText += `${symbol} ${prefix}${plugin.command} ${categoryIcon}\n`
            
            if (plugin.description) {
                const indent = isLast ? '  ' : '│ '
                menuText += `${indent}↳ ${plugin.description}\n`
            }
        })
        
        menuText += `\n🏠 Back to main: ${prefix}menu\n`
        menuText += `� View category: ${prefix}menu <category>`
        
        return reply(menuText)
    },
    
    searchCommands(plugins, query, isOwner, isAdmin) {
        return plugins.filter(plugin => {
            // Permission check
            if (plugin.ownerOnly && !isOwner) return false
            if (plugin.adminOnly && !isAdmin && !isOwner) return false
            
            // Search in command name, aliases, description
            const searchText = [
                plugin.command,
                ...(plugin.aliases || []),
                plugin.description || '',
                plugin.category || ''
            ].join(' ').toLowerCase()
            
            return searchText.includes(query)
        })
    }
}
