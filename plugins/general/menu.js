import fs from 'fs'
import path from 'path'
import os from 'os'
import font from '../../lib/font.js'

const runtimes = (seconds) => {
    seconds = Number(seconds)
    var d = Math.floor(seconds / (3600 * 24))
    var h = Math.floor(seconds % (3600 * 24) / 3600)
    var m = Math.floor(seconds % 3600 / 60)
    var s = Math.floor(seconds % 60)
    var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : ""
    var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : ""
    var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : ""
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : ""
    return dDisplay + hDisplay + mDisplay + sDisplay
}

const readMore = String.fromCharCode(8206).repeat(4001)

export default {
    command: 'menu',
    aliases: function() {
        const baseAliases = ['help', 'commands', 'm', '?']
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
    description: 'Main menu',
    usage: '',
    cooldown: 3,

    async execute({ reply, args, db, sender, plugins, prefix, isGroup, groupMetadata, sock, msg, command, config }) {
        try {
            const user = db.getUser(sender)
            const isOwner = db.isOwner(sender)
            const isPremium = db.isPremium ? db.isPremium(sender) : false
            const userLimit = user?.limit ?? 0
            const maxLimit = db.getSetting ? (db.getSetting('dailyLimit') || 50) : 50
            const botSettings = config.get('botSettings')
            const ownerSettings = config.get('ownerSettings')
            
            const userName = user?.name || msg.pushName || 'User'
            const premiumText = isOwner ? 'Owner' : (isPremium ? 'Premium' : 'Free')
            const uptime = runtimes(process.uptime())

            // Get database size
            let dbSize = 'Unknown'
            try {
                const dbPath = path.join(process.cwd(), 'database', 'users.json')
                if (fs.existsSync(dbPath)) {
                    const dbSizeBytes = fs.statSync(dbPath).size
                    dbSize = dbSizeBytes > 1000000 
                        ? `${(dbSizeBytes / 1000000).toFixed(2)} MB` 
                        : `${(dbSizeBytes / 1000).toFixed(2)} KB`
                }
            } catch (error) {
                dbSize = 'Unknown'
            }

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
                if (plugin.adminOnly && !db.isAdmin(sender) && !isOwner) continue
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
                'downloader': '📥',
                'ai': '🤖'
            }

            if (requestedCategory) {
                // Show specific category menu
                const categoryPlugins = categories[requestedCategory] || []
                const icon = categoryIcons[requestedCategory] || '📂'
                const categoryName = requestedCategory.charAt(0).toUpperCase() + requestedCategory.slice(1)

                let categoryMenuText = `${font.smallCaps('Hello')}! ${userName}, ${font.smallCaps("I'm")} ${botSettings.botName || font.smallCaps('Chisato')}, ${font.smallCaps('here are the')} ${categoryName} ${font.smallCaps('commands available')}.

⛨〡︎ *${font.smallCaps('Premium')}:* ${premiumText} 🅟
⛨〡︎ *${font.smallCaps('Limit')}:* ${userLimit}/${maxLimit} 🅛
⛨〡 *${font.smallCaps('Uptime')}* : *${uptime}*
⛨〡 *${font.smallCaps('Category')}* : *${categoryName.toUpperCase()}*
⛨〡 *${font.smallCaps('Prefix Used')}* : *[ ${prefix} ]*
${readMore}

`

                if (categoryPlugins.length === 0) {
                    categoryMenuText += `*╭─────⋠ ${font.smallCaps('NO COMMANDS')} ⋡*\n`
                    categoryMenuText += `*╎❈* ${font.smallCaps('No commands available in this category')}\n`
                    categoryMenuText += `*╰────────〢*\n\n`
                } else {
                    categoryMenuText += `*╭─────⋠ ${font.smallCaps(categoryName.toUpperCase())} ⋡*\n`
                    
                    const sortedPlugins = categoryPlugins.sort((a, b) => a.command.localeCompare(b.command))
                    
                    sortedPlugins.forEach(plugin => {
                        const isPremiumCmd = plugin.premium ? '🅟' : ''
                        const isLimitCmd = plugin.limit ? '🅛' : ''
                        categoryMenuText += `*╎❈* ${prefix}${font.smallCaps(plugin.command)} ${isPremiumCmd} ${isLimitCmd}\n`
                    })
                    
                    categoryMenuText += `*╰────────〢*\n\n`
                }

                categoryMenuText += `🤖 ${font.smallCaps('powered by chisato-md | created by kiznavierr')}`

                await sock.sendMessage(msg.key.remoteJid, {
                    text: categoryMenuText,
                    contextInfo: {
                        externalAdReply: {
                            title: botSettings.botName || 'Chisato-MD',
                            body: ownerSettings.ownerName || 'Kiznavierr',
                            thumbnail: fs.existsSync(path.join(process.cwd(), 'images', 'banner', 'Chisato.jpg')) 
                                ? fs.readFileSync(path.join(process.cwd(), 'images', 'banner', 'Chisato.jpg'))
                                : Buffer.alloc(0),
                            sourceUrl: 'https://github.com/kiznaiverr/chisato-md',
                            mediaType: 1,
                            renderLargerThumbnail: true,
                        }
                    }
                }, { quoted: msg })
                return
            }

            // Main menu
            const sortedCats = Object.keys(categories).sort()
            
            let menuText = `${font.smallCaps('Hello')}! ${userName}, ${font.smallCaps("I'm")} ${botSettings.botName || font.smallCaps('Chisato')}, ${font.smallCaps('a WhatsApp-based smart assistant who is here to help you')}.

⛨〡︎ *${font.smallCaps('Premium')}:* ${premiumText} 🅟
⛨〡︎ *${font.smallCaps('Limit')}:* ${userLimit}/${maxLimit} 🅛
⛨〡 *${font.smallCaps('Uptime')}* : *${uptime}*
⛨〡 *${font.smallCaps('Version')}* : *2.0.0*
⛨〡 *${font.smallCaps('Prefix Used')}* : *[ ${prefix} ]*
⛨〡︎ *${font.smallCaps('HomePage')}:* https://kiznavierr.my.id
⛨〡︎ *${font.smallCaps('Database')}:* ${dbSize}

${font.smallCaps('What can I do for you? I am designed to provide information, perform specific tasks, and provide direct support via WhatsApp messages')}.
${readMore}

*╭─────⋠ ${font.smallCaps('CATEGORIES')} ⋡*
`
            
            sortedCats.forEach(cat => {
                const icon = categoryIcons[cat] || '📂'
                const count = categories[cat].length
                menuText += `*╎❈* ${prefix}${font.smallCaps(cat + 'menu')} (${count})\n`
            })
            
            menuText += `*╰────────〢*\n\n`
            menuText += `🤖 ${font.smallCaps('powered by chisato-md | created by kiznavierr')}`
            
            await sock.sendMessage(msg.key.remoteJid, {
                text: menuText,
                contextInfo: {
                    externalAdReply: {
                        title: botSettings.botName || 'Chisato-MD',
                        body: ownerSettings.ownerName || 'Kiznavierr',
                        thumbnail: fs.existsSync(path.join(process.cwd(), 'images', 'banner', 'Chisato.jpg')) 
                            ? fs.readFileSync(path.join(process.cwd(), 'images', 'banner', 'Chisato.jpg'))
                            : Buffer.alloc(0),
                        sourceUrl: 'https://github.com/kiznaiverr/chisato-md',
                        mediaType: 1,
                        renderLargerThumbnail: true,
                    }
                }
            }, { quoted: msg })

        } catch (error) {
            console.error('Menu error:', error)
            return reply('❌ Failed to generate menu. Please try again.')
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