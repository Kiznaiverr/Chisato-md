import font from '../../lib/font.js'

export default {
    command: 'profile',
    aliases: ['prof', 'me'],
    category: 'user',
    description: 'View user profile',
    usage: '@user',
    cooldown: 5,
    
    async execute({ msg, args, reply, db, sender }) {
        // Get target user (mentioned user or sender)
        let target = sender
        if (msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            target = msg.message.extendedTextMessage.contextInfo.mentionedJid[0]
        } else if (args[0] && args[0].includes('@')) {
            target = args[0].replace('@', '') + '@s.whatsapp.net'
        }

        const user = db.getUser(target)
        const isOwner = db.isOwner(target)
        const isPremium = db.isPremium(target)
        const isAdmin = db.isAdmin(target)
        const isSelf = target === sender
        
        // Calculate next level requirements
        const nextLevelExp = user.level * 100
        const expProgress = Math.round((user.exp / nextLevelExp) * 10)
        const progressBar = '█'.repeat(expProgress) + '░'.repeat(10 - expProgress)
        const progressPercent = Math.round((user.exp / nextLevelExp) * 100)
        
        // Determine user status
        let statusIcon = '👤'
        let statusText = font.smallCaps('Regular User')
        if (isOwner) {
            statusIcon = '👑'
            statusText = font.smallCaps('Bot Owner')
        } else if (isPremium) {
            statusIcon = '💎'
            statusText = font.smallCaps('Premium Member')
        } else if (isAdmin) {
            statusIcon = '👨‍💼'
            statusText = font.smallCaps('Bot Admin')
        }
        
        // Build profile text
        let profileText = `╭─「 ${statusIcon} ${font.smallCaps('User Profile')} 」\n`
        profileText += `├ 👤 ${font.smallCaps('Name')}: ${font.smallCaps(user.name || 'Anonymous')}\n`
        profileText += `├ 📱 ${font.smallCaps('Number')}: ${target.split('@')[0]}\n`
        profileText += `├ 🏆 ${font.smallCaps('Status')}: ${statusText}\n`
        
        if (user.registered) {
            profileText += `├ ✅ ${font.smallCaps('Registered')}: ${font.smallCaps('Yes')}\n`
            if (user.regTime) {
                profileText += `├ 📅 ${font.smallCaps('Reg Date')}: ${new Date(user.regTime).toLocaleDateString('id-ID')}\n`
            }
            if (user.age) {
                profileText += `├ 🎂 ${font.smallCaps('Age')}: ${user.age} ${font.smallCaps('years')}\n`
            }
        } else {
            profileText += `├ ❌ ${font.smallCaps('Registered')}: ${font.smallCaps('No')}\n`
        }
        
        profileText += `├───────────────\n`
        profileText += `├ 📊 ${font.smallCaps('Statistics')}:\n`
        profileText += `├ 🎯 ${font.smallCaps('Level')}: ${user.level}\n`
        profileText += `├ ⭐ ${font.smallCaps('EXP')}: ${user.exp}/${nextLevelExp}\n`
        profileText += `├ 📈 ${font.smallCaps('Progress')}: ${progressBar} ${progressPercent}%\n`
        
        // Limit information
        if (isOwner || isPremium) {
            profileText += `├ 🎫 ${font.smallCaps('Daily Limit')}: ∞ ${font.smallCaps('Unlimited')}\n`
        } else {
            const maxLimit = db.getSetting('dailyLimit') || 50
            profileText += `├ 🎫 ${font.smallCaps('Daily Limit')}: ${user.limit}/${maxLimit}\n`
        }
        
        // Premium information
        if (isPremium && !isOwner) {
            profileText += `├───────────────\n`
            profileText += `├ 💎 ${font.smallCaps('Premium Info')}:\n`
            
            if (user.premiumSince) {
                profileText += `├ 📅 ${font.smallCaps('Since')}: ${new Date(user.premiumSince).toLocaleDateString('id-ID')}\n`
            }
            
            if (user.premiumExpiry) {
                const expiry = new Date(user.premiumExpiry)
                const now = new Date()
                const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))
                
                profileText += `├ ⏰ ${font.smallCaps('Expires')}: ${expiry.toLocaleDateString('id-ID')}\n`
                profileText += `├ 🕔 ${font.smallCaps('Days Left')}: ${daysLeft > 0 ? daysLeft : font.smallCaps('Expired')}\n`
            } else {
                profileText += `├ ⏰ ${font.smallCaps('Expires')}: ${font.smallCaps('Lifetime')}\n`
            }
        }
        
        // Additional stats
        profileText += `├───────────────\n`
        profileText += `├ 📈 ${font.smallCaps('Activity')}:\n`
        profileText += `├ ⚠️ ${font.smallCaps('Warnings')}: ${user.warning || 0}\n`
        
        if (user.banned) {
            profileText += `├ 🚫 ${font.smallCaps('Status')}: ${font.smallCaps('Banned')}\n`
        }
        
        if (user.afk) {
            profileText += `├ 😴 ${font.smallCaps('AFK')}: ${font.smallCaps('Yes')}\n`
            if (user.afkReason) {
                profileText += `├ 💭 ${font.smallCaps('Reason')}: ${user.afkReason}\n`
            }
        }
        
        profileText += `├ 👀 ${font.smallCaps('Last Seen')}: ${new Date(user.lastSeen).toLocaleString('id-ID')}\n`
        profileText += `╰───────────────`
        
        // Add helpful commands for self-profile
        if (isSelf) {
            profileText += `\n\n💡 ${font.smallCaps('Quick Commands')}:\n`
            profileText += `• .limit - ${font.smallCaps('Check usage limit')}\n`
            profileText += `• .register - ${font.smallCaps('Register as user')}\n`
            if (!user.registered) {
                profileText += `• .register <${font.smallCaps('name')}> <${font.smallCaps('age')}> - ${font.smallCaps('Complete registration')}\n`
            }
        }
        
        await reply(profileText)
    }
}