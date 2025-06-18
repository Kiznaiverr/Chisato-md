import fs from 'fs'
import path from 'path'

export default {
    command: 'menu',
    aliases: ['help', 'commands', 'm'],
    category: 'general',
    description: '',
    usage: 'menu [category] or menu [search]',
    cooldown: 3,

    async execute({ reply, args, db, sender, plugins, prefix, isGroup, groupMetadata }) {
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
        const sortedCats = Object.keys(categories).sort()

        // HEADER
        let menuText = ''
        menuText += `⌬〡 ɴᴀᴍᴀ ʙᴏᴛ: ${botName}\n`
        menuText += `⌬〡 ᴜsᴇʀ: ${userName}\n`
        menuText += `⌬〡 sᴛᴀᴛᴜs: ${premiumText}\n`
        menuText += `⌬〡 ʟɪᴍɪᴛ: ${userLimit}/${maxLimit}\n`
        menuText += '  ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌\n'
        menuText += 'Selamat datang di *Chisato Menu*! Semua fitur bot dikelompokkan berdasarkan kategori di bawah ini.\n'
        menuText += 'Gunakan perintah sesuai kategori, atau ketik ".menu <kategori>" untuk detail tiap kategori.\n'
        menuText += '╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌\n'
        // MENU KATEGORI
        menuText += '┏━━━━°⌜ Chisato ⌟°━━━━┓\n'
        sortedCats.forEach(cat => {
            menuText += `> • .${cat}menu\n`
        })
        menuText += '╰┄┄┄┄┄┄┄┄┄┄┄┄┄〢\nChisato'
        return reply(menuText)
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
