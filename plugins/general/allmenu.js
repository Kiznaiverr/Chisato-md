import path from 'path'
import fs from 'fs'
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
    command: 'allmenu',
    aliases: ['allmenu', 'allcommands', 'allcmd'],
    category: 'general',
    description: 'Show all commands',
    usage: '',
    cooldown: 3,

    async execute({ reply, db, sender, plugins, prefix, sock, msg, config }) {
        try {
            const isOwner = db.isOwner(sender)
            const isAdmin = db.isAdmin(sender)
            const user = db.getUser(sender)
            const botSettings = config.get('botSettings')
            const ownerSettings = config.get('ownerSettings')
            
            const userName = user?.name || msg.pushName || 'User'
            const userLimit = user?.limit ?? 0
            const maxLimit = db.getSetting ? (db.getSetting('dailyLimit') || 50) : 50
            const isPremium = db.isPremium ? db.isPremium(sender) : false
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

            // Group plugins by category
            const categories = {}
            const availablePlugins = plugins.filter(plugin => {
                if (plugin.ownerOnly && !isOwner) return false
                if (plugin.adminOnly && !isAdmin && !isOwner) return false
                return true
            })

            for (const plugin of availablePlugins) {
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

            // Build menu text
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

`

            const sortedCats = Object.keys(categories).sort()
            
            sortedCats.forEach(cat => {
                const icon = categoryIcons[cat] || '📂'
                const categoryName = cat.charAt(0).toUpperCase() + cat.slice(1)
                
                menuText += `*╭─────⋠ ${font.smallCaps(categoryName.toUpperCase())} ⋡*\n`
                
                const sortedPlugins = categories[cat].sort((a, b) => a.command.localeCompare(b.command))
                
                sortedPlugins.forEach(plugin => {
                    const isPremiumCmd = plugin.premium ? '🅟' : ''
                    const isLimitCmd = plugin.limit ? '🅛' : ''
                    menuText += `*╎❈* ${prefix}${font.smallCaps(plugin.command)} ${isPremiumCmd} ${isLimitCmd}\n`
                })
                
                menuText += `*╰────────〢*\n\n`
            })

            menuText += `🤖 ${font.smallCaps('powered by chisato-md | created by kiznavierr')}`

            // Send with external ad reply
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
            console.error('Allmenu error:', error)
            return reply('❌ Failed to generate allmenu. Please try again.')
        }
    }
}

