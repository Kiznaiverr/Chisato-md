import fs from 'fs'
import path from 'path'

export default {
    command: 'menu',
    aliases: ['help', 'commands', 'm'],
    category: 'general',
    description: '',
    usage: '',
    cooldown: 3,

    async execute({ reply, args, db, sender, plugins, prefix, isGroup, groupMetadata, sock, msg }) {
        const user = db.getUser(sender)
        const isOwner = db.isOwner(sender)
        const isPremium = db.isPremium ? db.isPremium(sender) : false
        const userLimit = user?.limit ?? 0
        const maxLimit = db.getSetting ? (db.getSetting('dailyLimit') || 10) : 10
        const botName = 'Chisato'
        const userName = user?.name || 'Kiznavierr'
        const premiumText = isOwner ? 'Owner' : (isPremium ? 'Premium' : 'Free')

        // Get dynamic categories from plugin folders
        const pluginDir = path.join(process.cwd(), 'plugins')
        const folders = fs.readdirSync(pluginDir).filter(f => fs.statSync(path.join(pluginDir, f)).isDirectory())
        const folderCategories = folders.map(f => f.toLowerCase())

        // Group plugins by category
        const categories = {}
        for (const plugin of plugins) {
            if (plugin.ownerOnly && !isOwner) continue
            if (plugin.adminOnly && !isOwner && !db.isAdmin(sender)) continue
            const cat = (plugin.category || 'other').toLowerCase()
            if (!categories[cat]) categories[cat] = []
            categories[cat].push(plugin)
        }
        const sortedCats = Object.keys(categories).sort()        // HEADER
        let menuText = ''
        menuText += `╭─────────────────────────╮\n`
        menuText += `│  🤖 *${botName} - WhatsApp Bot*  │\n`
        menuText += `╰─────────────────────────╯\n\n`
        menuText += `👤 *User:* ${userName}\n`
        menuText += `🏷️ *Status:* ${premiumText}\n`
        menuText += `⚡ *Limit:* ${userLimit}/${maxLimit}\n`
        menuText += `🕒 *Time:* ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}\n\n`
        menuText += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`
        menuText += `🎯 *Selamat datang di Chisato!*\n\n`
        menuText += `Semua fitur bot dikelompokkan berdasarkan kategori. Pilih kategori yang ingin kamu gunakan:\n\n`
        menuText += `📋 *KATEGORI MENU:*\n`
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
            menuText += `${icon} \`.${cat}menu\` - ${categoryName}\n`
        })
        
        menuText += `\n━━━━━━━━━━━━━━━━━━━━━━━━━\n`
        menuText += `💡 *Tips:* Ketik \`.menu <kategori>\` untuk melihat detail commands di kategori tersebut.\n\n`
        menuText += `🤖 *Powered by Chisato-MD* | Created by Kiznavierr`
        
        // Send menu with banner image
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
            console.error('Error sending menu with image:', error)
            // Fallback to text only on error
            return reply(menuText)
        }
    },

    searchCommands(plugins, query, isOwner, isAdmin) {
        return plugins.filter(plugin => {
            if (plugin.ownerOnly && !isOwner) return false
            if (plugin.adminOnly && !isAdmin && !isOwner) return false
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
