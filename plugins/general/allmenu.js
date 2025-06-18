import path from 'path'
import fs from 'fs'

export default {
    command: 'allmenu',
    aliases: ['allmenu', 'allcommands', 'allcmd'],
    category: 'general',
    description: 'Show all commands grouped by category',
    usage: 'allmenu',
    cooldown: 3,

    async execute({ reply, db, sender, plugins, prefix }) {
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
        const sortedCats = Object.keys(categories).sort()

        // HEADER
        let menuText = ''
        menuText += `⌬〡 ɴᴀᴍᴀ ʙᴏᴛ: ${botName}\n`
        menuText += `⌬〡 ᴜsᴇʀ: ${userName}\n`
        menuText += `⌬〡 sᴛᴀᴛᴜs: ${premiumText}\n`
        menuText += `⌬〡 ʟɪᴍɪᴛ: ${userLimit}/${maxLimit}\n`
        menuText += '  ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌\n'
        menuText += 'Selamat datang di *Chisato All Menu*! Semua fitur bot dikelompokkan berdasarkan kategori di bawah ini.\n'
        menuText += 'Gunakan perintah sesuai kategori, atau ketik ".menu <kategori>" untuk detail tiap kategori.\n'
        menuText += '╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌\n'
        // MENU KATEGORI
        menuText += '┏━━━━°⌜ Chisato ⌟°━━━━┓\n'
        sortedCats.forEach(cat => {
            menuText += `> • .${cat}menu\n`
        })
        menuText += '╰┄┄┄┄┄┄┄┄┄┄┄┄┄〢\nChisato'
        return reply(menuText)
    }
}
