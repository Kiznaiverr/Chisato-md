import path from 'path'
import fs from 'fs'

export default {
    command: 'allmenu',
    aliases: ['allmenu', 'allcommands', 'allcmd'],
    category: 'general',
    description: 'Show all commands',
    usage: 'allmenu',
    cooldown: 3,

    async execute({ reply, db, sender, plugins, prefix, sock, msg }) {
        const isOwner = db.isOwner(sender)
        const isAdmin = db.isAdmin(sender)
        const botName = 'Chisato'
        const userName = db.getUser ? (db.getUser(sender)?.name || 'User') : 'User'
        const userLimit = db.getUser ? (db.getUser(sender)?.limit ?? 0) : 0
        const maxLimit = db.getSetting ? (db.getSetting('dailyLimit') || 10) : 10
        const premiumText = isOwner ? 'Owner' : (db.isPremium ? (db.isPremium(sender) ? 'Premium' : 'Free') : 'Free')

        // Group plugins by category, filter by permission
        const categories = {}
        for (const plugin of plugins) {
            if (plugin.ownerOnly && !isOwner) continue
            if (plugin.adminOnly && !isAdmin && !isOwner) continue
            const cat = (plugin.category || 'other').toLowerCase()
            if (!categories[cat]) categories[cat] = []
            categories[cat].push(plugin)
        }
        const sortedCats = Object.keys(categories).sort()        // HEADER
        let menuText = ''
        menuText += `╭─────────────────────────╮\n`
        menuText += `│  🤖 *${botName} - All Commands*  │\n`
        menuText += `╰─────────────────────────╯\n\n`
        menuText += `👤 *User:* ${userName}\n`
        menuText += `🏷️ *Status:* ${premiumText}\n`
        menuText += `⚡ *Limit:* ${userLimit}/${maxLimit}\n`
        menuText += `🕒 *Time:* ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}\n\n`
        menuText += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`
        menuText += `📚 *SEMUA COMMAND TERSEDIA:*\n\n`
        // MENU KATEGORI
        const categoryIcons = {
            'admin': '👑',
            'owner': '🔱',
            'general': '📋',
            'user': '👤',
            'group': '👥',
            'fun': '🎮',
            'media': '🎨',
            'tools': '🔧',
            'search': '🔍',
            'downloader': '📥'
        }
        
        sortedCats.forEach(cat => {
            const icon = categoryIcons[cat] || '📂'
            const categoryName = cat.charAt(0).toUpperCase() + cat.slice(1)
            menuText += `${icon} *${categoryName.toUpperCase()} COMMANDS:*\n`
            
            // List all commands in this category
            categories[cat].forEach(plugin => {
                const aliases = plugin.aliases ? ` (${plugin.aliases.join(', ')})` : ''
                const description = plugin.description ? ` - ${plugin.description}` : ''
                menuText += `• \`${prefix}${plugin.command}\`${aliases}${description}\n`
            })
            menuText += `\n`
        })
        
        menuText += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`
        menuText += `📊 *Total Commands:* ${plugins.filter(p => {
            if (p.ownerOnly && !isOwner) return false
            if (p.adminOnly && !isAdmin && !isOwner) return false
            return true
        }).length}\n\n`
        menuText += `💡 *Tips:* Gunakan \`.menu\` untuk tampilan kategori yang lebih ringkas\n\n`
        menuText += `🤖 *Powered by Chisato-MD* | Created by Kiznavierr`
        
        // Send allmenu with banner image
        try {
            const bannerPath = path.join(process.cwd(), 'images', 'banner', 'Chisato.jpg')
            
            if (fs.existsSync(bannerPath)) {
                await sock.sendMessage(msg.key.remoteJid, {
                    image: fs.readFileSync(bannerPath),
                    caption: menuText
                }, { quoted: msg })
            } else {
                // Fallback to text only if image not found
                return reply(menuText)
            }
        } catch (error) {
            console.error('Error sending allmenu with image:', error)
            // Fallback to text only on error
            return reply(menuText)
        }
    }
}
