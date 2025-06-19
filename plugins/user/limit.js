export default {
    command: 'limit',
    aliases: ['mylimit', 'checklimit'],
    category: 'user',
    description: 'Check limit',
    usage: '',
    cooldown: 3,
    
    async execute({ reply, db, sender }) {
        const user = db.getUser(sender)
        const isOwner = db.isOwner(sender)
        const isPremium = db.isPremium(sender)
        
        let limitText = `╭─「 🎫 Your Usage Limit 」\n`
        limitText += `├ 👤 User: ${user.name || 'Anonymous'}\n`
        
        if (isOwner) {
            limitText += `├ 👑 Status: Bot Owner\n`
            limitText += `├ 🎫 Daily Limit: ∞ Unlimited\n`
            limitText += `├ 💎 Premium: Yes (Owner)\n`
            limitText += `├ 🚀 Priority: Highest\n`
        } else if (isPremium) {
            limitText += `├ 💎 Status: Premium Member\n`
            limitText += `├ 🎫 Daily Limit: ∞ Unlimited\n`
            limitText += `├ 🚀 Priority: High\n`
            
            if (user.premiumSince) {
                limitText += `├ 📅 Premium Since: ${new Date(user.premiumSince).toLocaleDateString('id-ID')}\n`
            }
            
            if (user.premiumExpiry) {
                const expiryDate = new Date(user.premiumExpiry)
                const now = new Date()
                const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24))
                
                limitText += `├ ⏰ Expires: ${expiryDate.toLocaleDateString('id-ID')}\n`
                limitText += `├ 🕔 Days Left: ${daysLeft > 0 ? daysLeft : 'Expired'}\n`
            } else {
                limitText += `├ ⏰ Expires: Never (Lifetime)\n`
            }
        } else {
            const maxLimit = db.getSetting('dailyLimit') || 50
            const usedLimit = maxLimit - user.limit
            const percentage = Math.round((usedLimit / maxLimit) * 100)
            
            limitText += `├ 🆓 Status: Regular User\n`
            limitText += `├ 🎫 Daily Limit: ${user.limit}/${maxLimit}\n`
            limitText += `├ 📊 Used: ${usedLimit} (${percentage}%)\n`
            limitText += `├ 🚀 Priority: Normal\n`
            
            // Progress bar
            const barLength = 10
            const filledBars = Math.round((usedLimit / maxLimit) * barLength)
            const emptyBars = barLength - filledBars
            const progressBar = '█'.repeat(filledBars) + '░'.repeat(emptyBars)
            limitText += `├ 📈 Progress: ${progressBar}\n`
            
            // Warning if low limit
            if (user.limit <= 5) {
                limitText += `├ ⚠️ Warning: Low limit remaining!\n`
            }
        }
        
        limitText += `├─────────────────────────\n`
        limitText += `├ 🔄 Reset: Daily at 00:00 WIB\n`
        limitText += `├ 🎯 Level: ${user.level} | ⭐ EXP: ${user.exp}\n`
        
        if (!isPremium && !isOwner) {
            limitText += `├─────────────────────────\n`
            limitText += `├ 💡 Want unlimited usage?\n`
            limitText += `├ 💎 Upgrade to Premium!\n`
            limitText += `├ 📞 Contact owner for premium\n`
        }
        
        limitText += `╰─────────────────────────`
        
        await reply(limitText)
    }
}