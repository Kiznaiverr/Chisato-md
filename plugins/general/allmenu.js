import path from 'path'
import fs from 'fs'
import font from '../../lib/font.js'

export default {
    command: 'allmenu',
    aliases: ['allmenu', 'allcommands', 'allcmd'],
    category: 'general',
    description: 'Show all commands',
    usage: '',
    cooldown: 3,

    async execute({ reply, db, sender, plugins, prefix, sock, msg }) {
        const isOwner = db.isOwner(sender)
        const isAdmin = db.isAdmin(sender)
        const botName = font.smallCaps('Chisato')
        const userName = db.getUser ? font.smallCaps(db.getUser(sender)?.name || 'User') : font.smallCaps('User')
        const userLimit = db.getUser ? (db.getUser(sender)?.limit ?? 0) : 0
        const maxLimit = db.getSetting ? (db.getSetting('dailyLimit') || 10) : 10
        const premiumText = isOwner ? font.smallCaps('Owner') : (db.isPremium ? (db.isPremium(sender) ? font.smallCaps('Premium') : font.smallCaps('Free')) : font.smallCaps('Free'))

        // Group plugins by category, filter by permission
        const categories = {}
        for (const plugin of plugins) {
            if (plugin.ownerOnly && !isOwner) continue
            if (plugin.adminOnly && !isAdmin && !isOwner) continue
            const cat = (plugin.category || 'other').toLowerCase()
            if (!categories[cat]) categories[cat] = []
            categories[cat].push(plugin)
        }
        const sortedCats = Object.keys(categories).sort()

        // HEADER
        let menuText = ''
        menuText += `╭───────────────╮\n`
        menuText += `│   🤖 ${font.smallCaps('chisato - all cmd')}   │\n`
        menuText += `╰───────────────╯\n\n`
        menuText += `👤 ${font.smallCaps('user')}: ${userName}\n`
        menuText += `🏷️ ${font.smallCaps('status')}: ${premiumText}\n`
        menuText += `⚡ ${font.smallCaps('limit')}: ${userLimit}/${maxLimit}\n`
        menuText += `🕒 ${font.smallCaps('time')}: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}\n\n`
        menuText += `━━━━━━━━━━━━━━━\n`
        menuText += `📚 ${font.smallCaps('semua command tersedia')}:\n\n`
        
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
            menuText += `${icon} ${font.smallCaps(categoryName + ' commands')}:\n`
            
            // List all commands in this category - command and usage with smallcaps
            categories[cat].forEach(plugin => {
                // Apply smallcaps to command name and usage text content
                let usage = ''
                if (plugin.usage) {
                    // Convert the usage content to smallcaps while preserving structure
                    usage = ` • ${plugin.usage.replace(/<([^>]+)>/g, (match, content) => {
                        return `<${font.smallCaps(content)}>`
                    }).replace(/\[([^\]]+)\]/g, (match, content) => {
                        return `[${font.smallCaps(content)}]`
                    }).replace(/@(\w+)/g, (match, content) => {
                        return `@${font.smallCaps(content)}`
                    })}`
                }
                
                // Convert command name to smallcaps too
                const commandName = font.smallCaps(plugin.command)
                menuText += `  ◦ ${prefix}${commandName}${usage}\n`
            })
            menuText += `\n`
        })
        
        menuText += `━━━━━━━━━━━━━━━\n`
        menuText += `📊 ${font.smallCaps('total commands')}: ${plugins.filter(p => {
            if (p.ownerOnly && !isOwner) return false
            if (p.adminOnly && !isAdmin && !isOwner) return false
            return true
        }).length}\n\n`
        menuText += `💡 ${font.smallCaps('tips')}: ${font.smallCaps('gunakan')} .${font.smallCaps('menu')} ${font.smallCaps('untuk tampilan kategori')}\n\n`
        menuText += `🤖 ${font.smallCaps('powered by chisato-md | created by kiznavierr')}`
        
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
