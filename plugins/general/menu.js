export default {
    command: 'menu',
    aliases: ['help', 'commands'],
    description: 'Show all available commands',
    category: 'general',
    usage: '.menu',
    cooldown: 3,
    async execute(context) {
        const { reply, db, sock } = context
        const prefix = db.getSetting('prefix')
        const botName = db.getSetting('botName')
        
        const menuText = `
┌─「 *${botName}* 」
│ 
├ 📋 *GENERAL COMMANDS*
│ • ${prefix}menu - Show this menu
│ • ${prefix}ping - Check bot response time
│ • ${prefix}info - Show bot information
│ • ${prefix}owner - Show owner contact
│ 
├ 👤 *USER COMMANDS*
│ • ${prefix}profile - Show your profile
│ • ${prefix}rank - Show your level & ranking
│ • ${prefix}limit - Check your daily limit
│ • ${prefix}register - Register to bot
│ 
├ 👥 *GROUP COMMANDS*
│ • ${prefix}group - Group settings menu
│ • ${prefix}adminlist - List group admins
│ • ${prefix}kick - Kick member (admin)
│ • ${prefix}promote - Promote member (admin)
│ • ${prefix}demote - Demote admin (admin)
│ 
├ 🎵 *MEDIA COMMANDS*
│ • ${prefix}sticker - Convert image to sticker
│ 
├ 🔍 *SEARCH COMMANDS*
│ • ${prefix}google - Search on Google
│ 
├ 🎲 *FUN COMMANDS*
│ • ${prefix}truth - Random truth question
│ • ${prefix}dare - Random dare challenge
│ • ${prefix}quote - Random inspirational quote
│ 
├ 🛠️ *OWNER COMMANDS*
│ • ${prefix}eval - Execute code (owner)
│ • ${prefix}ban - Ban user (owner)
│ • ${prefix}unban - Unban user (owner)
│ • ${prefix}broadcast - Broadcast message (owner)
│ 
├ 📊 *BOT STATISTICS*
│ • 📁 Plugin Structure: Organized by categories
│ • 🔌 Total Plugins: Auto-loaded from folders
│ • 💾 Database: Local JSON storage
│ • 🚀 Performance: Optimized for speed
│ 
└────

💡 *Tip:* Bot plugins are organized in folders by category for better management!
        `.trim()
        
        await reply(menuText)
    }
}
