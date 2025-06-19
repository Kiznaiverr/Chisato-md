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
┌─「 *YOUR RANK* 」
│ 
├ 👤 *Name:* ${pushName}
├ ⭐ *Level:* ${user.level}
├ 🎯 *Experience:* ${user.exp}/${requiredExp}
├ 📊 *Progress:* ${progress}%
├ ${progressBar} *${progress}%*
├ 🏆 *Rank:* #${userRank} of ${allUsers.length}
├ 🎫 *Limit:* ${user.limit}
├ 💎 *Premium:* ${user.premium ? 'Yes' : 'No'}
│ 
└────

💡 *Tip:* Use commands to gain more experience!
        `.trim()
        
        await reply(rankText)
    }
}
