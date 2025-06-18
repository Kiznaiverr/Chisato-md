export default {
    command: 'cmdinfo',
    aliases: ['commandinfo', 'cmd'],
    category: 'general',
    description: 'Show detailed information about a specific command',
    usage: 'cmdinfo <command>',
    cooldown: 3,
    
    async execute({ reply, args, db, sender, plugins, prefix }) {
        if (!args[0]) {
            return reply(`❌ Please specify a command!\n\n💡 Usage: ${prefix}cmdinfo <command>\n📝 Example: ${prefix}cmdinfo ping`)
        }
        
        const isOwner = db.isOwner(sender)
        const isAdmin = db.isAdmin(sender)
        const commandName = args[0].toLowerCase().replace(prefix, '')
        
        // Find the command
        const plugin = plugins.find(p => 
            p.command === commandName || (p.aliases && p.aliases.includes(commandName))
        )
        
        if (!plugin) {
            return reply(`❌ Command "${commandName}" not found!\n\n🔍 Use ${prefix}menu to see all available commands`)
        }
        
        // Check if user has permission to view this command
        if (plugin.ownerOnly && !isOwner) {
            return reply(`🔒 Command "${commandName}" is only available for bot owner`)
        }
        
        if (plugin.adminOnly && !isAdmin && !isOwner) {
            return reply(`🔒 Command "${commandName}" is only available for admins`)
        }
        
        // Build detailed info
        let infoText = `╭─「 📖 Command Info: ${plugin.command} 」\n`
        
        // Basic info
        infoText += `├ 🏷️ Command: ${prefix}${plugin.command}\n`
        
        if (plugin.aliases && plugin.aliases.length > 0) {
            infoText += `├ 🔄 Aliases: ${plugin.aliases.map(alias => `${prefix}${alias}`).join(', ')}\n`
        }
        
        infoText += `├ 📂 Category: ${this.getCategoryIcon(plugin.category)} ${(plugin.category || 'misc').toUpperCase()}\n`
        
        if (plugin.description) {
            infoText += `├ 📝 Description: ${plugin.description}\n`
        }
        
        if (plugin.usage) {
            infoText += `├ 💡 Usage: ${prefix}${plugin.usage}\n`
        }
        
        // Permissions & Requirements
        infoText += `├─────────────────────────\n`
        infoText += `├ 🔐 Permissions:\n`
        
        if (plugin.ownerOnly) {
            infoText += `├ 👑 Owner Only: Yes\n`
        } else if (plugin.adminOnly) {
            infoText += `├ 👨‍💼 Admin Only: Yes\n`
        } else {
            infoText += `├ 🌐 Public: Yes\n`
        }
        
        if (plugin.groupOnly) {
            infoText += `├ 👥 Group Only: Yes\n`
        } else if (plugin.privateOnly) {
            infoText += `├ 💬 Private Only: Yes\n`
        } else {
            infoText += `├ 📍 Available: Everywhere\n`
        }
        
        if (plugin.botAdmin) {
            infoText += `├ 🤖 Requires Bot Admin: Yes\n`
        }
        
        // Limits & Cooldowns
        infoText += `├─────────────────────────\n`
        infoText += `├ ⚙️ Settings:\n`
        
        if (plugin.cooldown) {
            infoText += `├ ⏱️ Cooldown: ${plugin.cooldown} seconds\n`
        }
        
        if (plugin.limit) {
            infoText += `├ 🎫 Cost: ${plugin.limit} limit(s)\n`
        }
        
        if (plugin.premium) {
            infoText += `├ 💎 Premium: Required\n`
        }
        
        infoText += `╰─────────────────────────\n`
        infoText += `\n🔍 Search similar: ${prefix}menu ${plugin.category || 'misc'}\n`
        infoText += `📋 All commands: ${prefix}listcmd`
        
        await reply(infoText)
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
