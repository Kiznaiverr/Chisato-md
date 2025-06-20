import font from '../../lib/font.js'

export default {
    command: 'leaderboard',
    aliases: ['lb', 'top', 'ranking'],
    category: 'user',
    description: 'Show top users leaderboard',
    usage: '',
    cooldown: 10,
    
    async execute({ reply, db, sender, react }) {
        try {
            await react('📊')
            
            const allUsers = Object.values(db.users)
            const registeredUsers = allUsers.filter(user => user.registered && !user.banned)
            
            if (registeredUsers.length === 0) {
                return reply(`📊 ${font.smallCaps('No registered users found')}!\n\n💡 ${font.smallCaps('Use .register to join the leaderboard')}`)
            }
            
            // Sort by level first, then by exp
            const topUsers = registeredUsers
                .sort((a, b) => {
                    if (b.level !== a.level) return b.level - a.level
                    return (b.exp || 0) - (a.exp || 0)
                })
                .slice(0, 10)
            
            // Find current user position
            const userIndex = registeredUsers.findIndex(user => user.jid === sender)
            const userRank = userIndex !== -1 ? userIndex + 1 : font.smallCaps('Unranked')
            
            let leaderboardText = `🏆 ${font.bold(font.smallCaps('LEADERBOARD'))}\n\n`
            leaderboardText += `╭─「 📊 ${font.smallCaps('Top 10 Users')} 」\n`
            
            topUsers.forEach((user, index) => {
                const isLast = index === topUsers.length - 1
                const symbol = isLast ? '╰' : '├'
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`
                const number = user.jid.split('@')[0]
                const name = font.smallCaps(user.name || 'Unknown')
                const isCurrentUser = user.jid === sender
                const userIndicator = isCurrentUser ? ' 👈' : ''
                
                leaderboardText += `${symbol} ${medal} ${name}${userIndicator}\n`
                if (!isLast) {
                    leaderboardText += `│   ├ 📱 ${number}\n`
                    leaderboardText += `│   ├ ⭐ ${font.smallCaps('Level')}: ${user.level}\n`
                    leaderboardText += `│   └ 🎯 ${font.smallCaps('EXP')}: ${user.exp || 0}\n`
                } else {
                    leaderboardText += `    ├ 📱 ${number}\n`
                    leaderboardText += `    ├ ⭐ ${font.smallCaps('Level')}: ${user.level}\n`
                    leaderboardText += `    └ 🎯 ${font.smallCaps('EXP')}: ${user.exp || 0}\n`
                }
            })
            
            leaderboardText += `\n╭─「 👤 ${font.smallCaps('Your Position')} 」\n`
            if (userIndex !== -1) {
                const user = registeredUsers[userIndex]
                leaderboardText += `├ 🏆 ${font.smallCaps('Rank')}: #${userRank} ${font.smallCaps('of')} ${registeredUsers.length}\n`
                leaderboardText += `├ ⭐ ${font.smallCaps('Level')}: ${user.level}\n`
                leaderboardText += `├ 🎯 ${font.smallCaps('EXP')}: ${user.exp || 0}\n`
                leaderboardText += `╰ 💪 ${font.smallCaps('Keep using commands to gain more EXP')}!\n`
            } else {
                leaderboardText += `├ ❌ ${font.smallCaps('Not registered')}\n`
                leaderboardText += `╰ 💡 ${font.smallCaps('Use .register to join the leaderboard')}!\n`
            }
            
            leaderboardText += `\n📊 ${font.smallCaps('Total Registered Users')}: ${registeredUsers.length}\n`
            leaderboardText += `🕒 ${font.smallCaps('Updated')}: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}\n\n`
            leaderboardText += `💡 ${font.smallCaps('Tips')}:\n`
            leaderboardText += `• ${font.smallCaps('Use commands to gain EXP')}\n`
            leaderboardText += `• ${font.smallCaps('Check your progress with .rank')}\n`
            leaderboardText += `• ${font.smallCaps('View your profile with .profile')}`
            
            await react('✅')
            await reply(leaderboardText)
            
        } catch (error) {
            console.error('Leaderboard error:', error)
            await react('❌')
            await reply(`❌ ${font.smallCaps('Failed to get leaderboard')}.`)
        }
    }
}
