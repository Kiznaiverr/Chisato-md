import font from '../../lib/font.js'

export default {
    command: 'rank',
    aliases: ['level', 'lvl'],
    description: 'Show rank',
    category: 'user',
    usage: '',
    cooldown: 5,
    async execute(context) {
        const { reply, sender, db, pushName } = context
        const user = db.getUser(sender)
        
        // Calculate progress to next level
        const requiredExp = user.level * 100
        const progress = Math.round((user.exp / requiredExp) * 100)
        const progressBar = '█'.repeat(Math.floor(progress / 10)) + '░'.repeat(10 - Math.floor(progress / 10))
        
        // Get all users for ranking
        const allUsers = Object.values(db.users)
            .filter(u => u.level > 0)
            .sort((a, b) => {
                if (b.level !== a.level) return b.level - a.level
                return b.exp - a.exp
            })
        
        const userRank = allUsers.findIndex(u => u.jid === sender) + 1
        
        const rankText = `
┌─「 ${font.bold(font.smallCaps('YOUR RANK'))} 」
│ 
├ 👤 ${font.bold(font.smallCaps('Name'))}: ${font.smallCaps(pushName)}
├ ⭐ ${font.bold(font.smallCaps('Level'))}: ${user.level}
├ 🎯 ${font.bold(font.smallCaps('Experience'))}: ${user.exp}/${requiredExp}
├ 📊 ${font.bold(font.smallCaps('Progress'))}: ${progress}%
├ ${progressBar} ${font.bold(`${progress}%`)}
├ 🏆 ${font.bold(font.smallCaps('Rank'))}: #${userRank} ${font.smallCaps('of')} ${allUsers.length}
├ 🎫 ${font.bold(font.smallCaps('Limit'))}: ${user.limit}
├ 💎 ${font.bold(font.smallCaps('Premium'))}: ${user.premium ? font.smallCaps('Yes') : font.smallCaps('No')}
│ 
└────

💡 ${font.bold(font.smallCaps('Tip'))}: ${font.smallCaps('Use commands to gain more experience')}!
        `.trim()
        
        await reply(rankText)
    }
}
