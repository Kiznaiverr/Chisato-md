import font from '../../lib/font.js'

export default {
    command: 'listuser',
    aliases: ['userlist', 'users'],
    category: 'owner',
    description: 'Show all bot users',
    usage: '',
    ownerOnly: true,
    cooldown: 10,
    
    async execute({ reply, db }) {
        try {
            const allUsers = Object.values(db.users)
            const totalUsers = allUsers.length
            const registeredUsers = allUsers.filter(user => user.registered).length
            const premiumUsers = allUsers.filter(user => user.premium).length
            const bannedUsers = allUsers.filter(user => user.banned).length
            const activeUsers = allUsers.filter(user => {
                const lastSeen = new Date(user.lastSeen)
                const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
                return lastSeen > dayAgo
            }).length
            
            let listText = `╭─「 👥 ${font.smallCaps('Bot Users List')} 」\n`
            listText += `├ 📊 ${font.smallCaps('Total Users')}: ${totalUsers}\n`
            listText += `├ ✅ ${font.smallCaps('Registered')}: ${registeredUsers}\n`
            listText += `├ 💎 ${font.smallCaps('Premium')}: ${premiumUsers}\n`
            listText += `├ 🚫 ${font.smallCaps('Banned')}: ${bannedUsers}\n`
            listText += `├ 🟢 ${font.smallCaps('Active (24h)')}: ${activeUsers}\n`
            listText += `├───────────────\n`
            
            if (totalUsers === 0) {
                listText += `├ ℹ️ ${font.smallCaps('No users found')}\n`
                listText += `╰ ${font.smallCaps('Users will appear here when they interact with the bot')}`
            } else {
                listText += `├ 📋 ${font.smallCaps('Recent Users')}:\n`
                
                // Sort by last seen and take top 10
                const recentUsers = allUsers
                    .sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen))
                    .slice(0, 10)
                
                recentUsers.forEach((user, index) => {
                    const isLast = index === recentUsers.length - 1
                    const symbol = isLast ? '╰' : '├'
                    const number = user.jid.split('@')[0]
                    const name = font.smallCaps(user.name || 'Unknown')
                    
                    let status = '👤'
                    if (user.banned) status = '🚫'
                    else if (user.premium) status = '💎'
                    else if (db.isOwner(user.jid)) status = '👑'
                    else if (user.registered) status = '✅'
                    
                    const lastSeen = new Date(user.lastSeen).toLocaleDateString('id-ID')
                    
                    listText += `${symbol} ${status} ${name} (${number})\n`
                    if (!isLast) {
                        listText += `│   ↳ ${font.smallCaps('Last seen')}: ${lastSeen}\n`
                    } else {
                        listText += `    ↳ ${font.smallCaps('Last seen')}: ${lastSeen}\n`
                    }
                })
                
                if (totalUsers > 10) {
                    listText += `\n💡 ${font.smallCaps('Showing 10 of')} ${totalUsers} ${font.smallCaps('users')}`
                }
            }
            
            listText += `\n\n🛠️ ${font.smallCaps('Management Commands')}:\n`
            listText += `• .ban @user - ${font.smallCaps('Ban a user')}\n`
            listText += `• .unban @user - ${font.smallCaps('Unban a user')}\n`
            listText += `• .addpremium @user - ${font.smallCaps('Add premium')}\n`
            listText += `• .delpremium @user - ${font.smallCaps('Remove premium')}`
            
            await reply(listText)
            
        } catch (error) {
            console.error('Error listing users:', error)
            await reply(`❌ ${font.smallCaps('Failed to get users list')}.`)
        }
    }
}
