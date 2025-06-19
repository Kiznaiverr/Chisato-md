import font from '../../lib/font.js'

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
        
        let limitText = `╭─「 🎫 ${font.smallCaps('Your Usage Limit')} 」\n`
        limitText += `├ 👤 ${font.smallCaps('User')}: ${user.name || 'Anonymous'}\n`
        
        if (isOwner) {
            limitText += `├ 👑 ${font.smallCaps('Status')}: ${font.smallCaps('Bot Owner')}\n`
            limitText += `├ 🎫 ${font.smallCaps('Daily Limit')}: ∞ ${font.smallCaps('Unlimited')}\n`
            limitText += `├ 💎 ${font.smallCaps('Premium')}: ${font.smallCaps('Yes')} (${font.smallCaps('Owner')})\n`
            limitText += `├ 🚀 ${font.smallCaps('Priority')}: ${font.smallCaps('Highest')}\n`
        } else if (isPremium) {
            limitText += `├ 💎 ${font.smallCaps('Status')}: ${font.smallCaps('Premium Member')}\n`
            limitText += `├ 🎫 ${font.smallCaps('Daily Limit')}: ∞ ${font.smallCaps('Unlimited')}\n`
            limitText += `├ 🚀 ${font.smallCaps('Priority')}: ${font.smallCaps('High')}\n`
            
            if (user.premiumSince) {
                limitText += `├ 📅 ${font.smallCaps('Premium Since')}: ${new Date(user.premiumSince).toLocaleDateString('id-ID')}\n`
            }
            
            if (user.premiumExpiry) {
                const expiryDate = new Date(user.premiumExpiry)
                const now = new Date()
                const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24))
                
                limitText += `├ ⏰ ${font.smallCaps('Expires')}: ${expiryDate.toLocaleDateString('id-ID')}\n`
                limitText += `├ 🕔 ${font.smallCaps('Days Left')}: ${daysLeft > 0 ? daysLeft : font.smallCaps('Expired')}\n`
            } else {
                limitText += `├ ⏰ ${font.smallCaps('Expires')}: ${font.smallCaps('Never')} (${font.smallCaps('Lifetime')})\n`
            }
        } else {
            const maxLimit = db.getSetting('dailyLimit') || 50
            const usedLimit = maxLimit - user.limit
            const percentage = Math.round((usedLimit / maxLimit) * 100)
            
            limitText += `├ 🆓 ${font.smallCaps('Status')}: ${font.smallCaps('Regular User')}\n`
            limitText += `├ 🎫 ${font.smallCaps('Daily Limit')}: ${user.limit}/${maxLimit}\n`
            limitText += `├ 📊 ${font.smallCaps('Used')}: ${usedLimit} (${percentage}%)\n`
            limitText += `├ 🚀 ${font.smallCaps('Priority')}: ${font.smallCaps('Normal')}\n`
            
            // Progress bar
            const barLength = 10
            const filledBars = Math.round((usedLimit / maxLimit) * barLength)
            const emptyBars = barLength - filledBars
            const progressBar = '█'.repeat(filledBars) + '░'.repeat(emptyBars)
            limitText += `├ 📈 ${font.smallCaps('Progress')}: ${progressBar}\n`
            
            // Warning if low limit
            if (user.limit <= 5) {
                limitText += `├ ⚠️ ${font.smallCaps('Warning')}: ${font.smallCaps('Low limit remaining')}!\n`
            }
        }
        
        limitText += `├─────────────────────────\n`
        limitText += `├ 🔄 ${font.smallCaps('Reset')}: ${font.smallCaps('Daily at 00:00 WIB')}\n`
        limitText += `├ 🎯 ${font.smallCaps('Level')}: ${user.level} | ⭐ ${font.smallCaps('EXP')}: ${user.exp}\n`
        
        if (!isPremium && !isOwner) {
            limitText += `├─────────────────────────\n`
            limitText += `├ 💡 ${font.smallCaps('Want unlimited usage')}?\n`
            limitText += `├ 💎 ${font.smallCaps('Upgrade to Premium')}!\n`
            limitText += `├ 📞 ${font.smallCaps('Contact owner for premium')}\n`
        }
        
        limitText += `╰─────────────────────────`
        
        await reply(limitText)
    }
}