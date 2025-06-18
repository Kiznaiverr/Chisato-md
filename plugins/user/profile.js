export default {
    command: 'profile',
    aliases: ['prof', 'me'],
    category: 'user',
    description: 'View user profile and statistics',
    usage: 'profile [@user]',
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
        let statusText = 'Regular User'
        if (isOwner) {
            statusIcon = '👑'
            statusText = 'Bot Owner'
        } else if (isPremium) {
            statusIcon = '💎'
            statusText = 'Premium Member'
        } else if (isAdmin) {
            statusIcon = '👨‍💼'
            statusText = 'Bot Admin'
        }
        
        // Build profile text
        let profileText = `╭─「 ${statusIcon} User Profile 」\n`
        profileText += `├ 👤 Name: ${user.name || 'Anonymous'}\n`
        profileText += `├ 📱 Number: ${target.split('@')[0]}\n`
        profileText += `├ 🏆 Status: ${statusText}\n`
        
        if (user.registered) {
            profileText += `├ ✅ Registered: Yes\n`
            if (user.regTime) {
                profileText += `├ 📅 Reg Date: ${new Date(user.regTime).toLocaleDateString('id-ID')}\n`
            }
            if (user.age) {
                profileText += `├ 🎂 Age: ${user.age} years\n`
            }
        } else {
            profileText += `├ ❌ Registered: No\n`
        }
        
        profileText += `├─────────────────────────\n`
        profileText += `├ 📊 Statistics:\n`
        profileText += `├ 🎯 Level: ${user.level}\n`
        profileText += `├ ⭐ EXP: ${user.exp}/${nextLevelExp}\n`
        profileText += `├ 📈 Progress: ${progressBar} ${progressPercent}%\n`
        
        // Limit information
        if (isOwner || isPremium) {
            profileText += `├ 🎫 Daily Limit: ∞ Unlimited\n`
        } else {
            const maxLimit = db.getSetting('dailyLimit') || 50
            profileText += `├ 🎫 Daily Limit: ${user.limit}/${maxLimit}\n`
        }
        
        // Premium information
        if (isPremium && !isOwner) {
            profileText += `├─────────────────────────\n`
            profileText += `├ 💎 Premium Info:\n`
            
            if (user.premiumSince) {
                profileText += `├ 📅 Since: ${new Date(user.premiumSince).toLocaleDateString('id-ID')}\n`
            }
            
            if (user.premiumExpiry) {
                const expiry = new Date(user.premiumExpiry)
                const now = new Date()
                const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))
                
                profileText += `├ ⏰ Expires: ${expiry.toLocaleDateString('id-ID')}\n`
                profileText += `├ 🕔 Days Left: ${daysLeft > 0 ? daysLeft : 'Expired'}\n`
            } else {
                profileText += `├ ⏰ Expires: Lifetime\n`
            }
        }
        
        // Additional stats
        profileText += `├─────────────────────────\n`
        profileText += `├ 📈 Activity:\n`
        profileText += `├ ⚠️ Warnings: ${user.warning || 0}\n`
        
        if (user.banned) {
            profileText += `├ 🚫 Status: Banned\n`
        }
        
        if (user.afk) {
            profileText += `├ 😴 AFK: Yes\n`
            if (user.afkReason) {
                profileText += `├ 💭 Reason: ${user.afkReason}\n`
            }
        }
        
        profileText += `├ 👀 Last Seen: ${new Date(user.lastSeen).toLocaleString('id-ID')}\n`
        profileText += `╰─────────────────────────`
        
        // Add helpful commands for self-profile
        if (isSelf) {
            profileText += `\n\n💡 Quick Commands:\n`
            profileText += `• .limit - Check usage limit\n`
            profileText += `• .register - Register as user\n`
            if (!user.registered) {
                profileText += `• .register <name> <age> - Complete registration\n`
            }
        }
        
        await reply(profileText)
    }
}