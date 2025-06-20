import fs from 'fs'
import path from 'path'
import font from '../../lib/font.js'

export default {
    command: 'menu',
    aliases: function() {
        const baseAliases = ['help', 'commands', 'm']
        const pluginDir = path.join(process.cwd(), 'plugins')
        
        try {
            const folders = fs.readdirSync(pluginDir).filter(f => fs.statSync(path.join(pluginDir, f)).isDirectory())
            const categoryMenus = folders.map(folder => folder.toLowerCase() + 'menu')
            return [...baseAliases, ...categoryMenus]
        } catch (error) {
            return baseAliases
        }
    }(),
    category: 'general',
    description: '',
    usage: '',
    cooldown: 3,

    async execute({ reply, args, db, sender, plugins, prefix, isGroup, groupMetadata, sock, msg, command }) {
        const user = db.getUser(sender)
        const isOwner = db.isOwner(sender)
        const isPremium = db.isPremium ? db.isPremium(sender) : false
        const userLimit = user?.limit ?? 0
        const maxLimit = db.getSetting ? (db.getSetting('dailyLimit') || 10) : 10
        const botName = font.smallCaps('Chisato')
        const userName = font.smallCaps(user?.name || 'User')
        const premiumText = isOwner ? font.smallCaps('Owner') : (isPremium ? font.smallCaps('Premium') : font.smallCaps('Free'))

        const categoryMenus = {}
        const pluginDir = path.join(process.cwd(), 'plugins')
        
        try {
            const folders = fs.readdirSync(pluginDir).filter(f => fs.statSync(path.join(pluginDir, f)).isDirectory())
            folders.forEach(folder => {
                categoryMenus[folder.toLowerCase() + 'menu'] = folder.toLowerCase()
            })
        } catch (error) {
            console.log('Could not read plugin directories')
        }

        const requestedCategory = categoryMenus[command]

        const categories = {}
        for (const plugin of plugins) {
            if (plugin.ownerOnly && !isOwner) continue
            if (plugin.adminOnly && !isOwner && !db.isAdmin(sender)) continue
            const cat = (plugin.category || 'other').toLowerCase()
            if (!categories[cat]) categories[cat] = []
            categories[cat].push(plugin)
        }

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

        if (requestedCategory) {
            const categoryPlugins = categories[requestedCategory] || []
            const icon = categoryIcons[requestedCategory] || '📂'
            const categoryName = requestedCategory.charAt(0).toUpperCase() + requestedCategory.slice(1)

            let categoryMenuText = `╭───────────────╮\n`
            categoryMenuText += `│  ${icon} ${font.smallCaps(categoryName + ' Menu')}  │\n`
            categoryMenuText += `╰───────────────╯\n\n`
            categoryMenuText += `👤 ${font.smallCaps('user')}: ${userName}\n`
            categoryMenuText += `🏷️ ${font.smallCaps('status')}: ${premiumText}\n`
            categoryMenuText += `⚡ ${font.smallCaps('limit')}: ${userLimit}/${maxLimit}\n`
            categoryMenuText += `🕒 ${font.smallCaps('time')}: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}\n\n`
            categoryMenuText += `━━━━━━━━━━━━━━━\n`

            if (categoryPlugins.length === 0) {
                categoryMenuText += `📭 ${font.smallCaps('No commands available in this category')}\n`
                categoryMenuText += `💡 ${font.smallCaps('This might be due to permission restrictions')}\n\n`
            } else {
                categoryMenuText += `📋 ${font.smallCaps(categoryName + ' Commands')} (${categoryPlugins.length}):\n\n`
                
                categoryPlugins.forEach((plugin, index) => {
                    const aliases = plugin.aliases && plugin.aliases.length > 0 ? ` (${plugin.aliases.map(alias => font.smallCaps(alias)).join(', ')})` : ''
                    
                    let usageText = ''
                    if (plugin.usage && plugin.usage.trim()) {
                        usageText = ` - ${plugin.usage.replace(/<([^>]+)>/g, (match, content) => {
                            return `<${font.smallCaps(content)}>`
                        }).replace(/\[([^\]]+)\]/g, (match, content) => {
                            return `[${font.smallCaps(content)}]`
                        }).replace(/@(\w+)/g, (match, content) => {
                            return `@${font.smallCaps(content)}`
                        })}`
                    }
                    
                    const commandName = font.smallCaps(plugin.command)
                    
                    categoryMenuText += `${index + 1}. ${prefix}${commandName}${aliases}${usageText}\n`
                })
            }

            categoryMenuText += `\n━━━━━━━━━━━━━━━\n`
            categoryMenuText += `💡 ${font.smallCaps('Tips')}:\n`
            categoryMenuText += `• ${font.smallCaps('Use')} ${prefix}${font.smallCaps('menu')} ${font.smallCaps('to see all categories')}\n`
            categoryMenuText += `• ${font.smallCaps('Use')} ${prefix}${font.smallCaps('allmenu')} ${font.smallCaps('to see all commands')}\n\n`
            categoryMenuText += `🤖 ${font.smallCaps('powered by chisato-md | created by kiznavierr')}`

            try {
                const bannerPath = path.join(process.cwd(), 'images', 'banner', 'Chisato.jpg')
                
                if (fs.existsSync(bannerPath)) {
                    await sock.sendMessage(msg.key.remoteJid, {
                        image: fs.readFileSync(bannerPath),
                        caption: categoryMenuText
                    }, { quoted: msg })
                } else {
                    return reply(categoryMenuText)
                }
            } catch (error) {
                console.error('Error sending category menu with image:', error)
                return reply(categoryMenuText)
            }
            return
        }

        // Default main menu
        const sortedCats = Object.keys(categories).sort()
        
        // HEADER
        let menuText = ''
        menuText += `╭───────────────╮\n`
        menuText += `│    🤖 ${font.smallCaps('chisato - menu')}    │\n`
        menuText += `╰───────────────╯\n\n`
        menuText += `👤 ${font.smallCaps('user')}: ${userName}\n`
        menuText += `🏷️ ${font.smallCaps('status')}: ${premiumText}\n`
        menuText += `⚡ ${font.smallCaps('limit')}: ${userLimit}/${maxLimit}\n`
        menuText += `🕒 ${font.smallCaps('time')}: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}\n\n`
        menuText += `━━━━━━━━━━━━━━━\n`
        menuText += `📋 ${font.smallCaps('kategori menu')}:\n\n`
        
        sortedCats.forEach(cat => {
            const icon = categoryIcons[cat] || '📂'
            const count = categories[cat].length
            menuText += `${icon} .${font.smallCaps(cat + 'menu')} (${count})\n`
        })
        
        menuText += `\n━━━━━━━━━━━━━━━\n`
        menuText += `💡 ${font.smallCaps('tips')}:\n`
        menuText += `• ${font.smallCaps('ketik')} .${font.smallCaps('<kategori>menu')} ${font.smallCaps('untuk detail')}\n`
        menuText += `• ${font.smallCaps('contoh')}: .${font.smallCaps('toolsmenu')} ${font.smallCaps('atau')} .${font.smallCaps('funmenu')}\n`
        menuText += `• ${font.smallCaps('gunakan')} .${font.smallCaps('allmenu')} ${font.smallCaps('untuk semua command')}\n\n`
        menuText += `🤖 ${font.smallCaps('powered by chisato-md | created by kiznavierr')}`
        
        try {
            const bannerPath = path.join(process.cwd(), 'images', 'banner', 'Chisato.jpg')
            
            if (fs.existsSync(bannerPath)) {
                await sock.sendMessage(msg.key.remoteJid, {
                    image: fs.readFileSync(bannerPath),
                    caption: menuText
                }, { quoted: msg })
            } else {
                return reply(menuText)
            }
        } catch (error) {
            console.error('Error sending menu with image:', error)
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

