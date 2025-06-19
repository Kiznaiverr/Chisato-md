import font from '../../lib/font.js'

export default {
    command: 'listpremium',
    aliases: ['premiumlist', 'listprem'],
    category: 'owner',
    description: 'Show list premumium',
    usage: '',
    ownerOnly: true,
    cooldown: 5,
    
    async execute({ reply, db }) {
        try {
            const allUsers = Object.values(db.users)
            const premiumUsers = allUsers.filter(user => user.premium)
            const owners = allUsers.filter(user => db.isOwner(user.jid))
            
            let listText = `╭─「 💎 ${font.smallCaps('Premium Users List')} 」\n`
            listText += `├ 📊 ${font.smallCaps('Total Premium')}: ${premiumUsers.length}\n`
            listText += `├ 👑 ${font.smallCaps('Total Owners')}: ${owners.length}\n`
            listText += `├─────────────────────────\n`
            
            if (owners.length > 0) {
                listText += `├ 👑 ${font.smallCaps('BOT OWNERS')}:\n`
                owners.forEach((user, index) => {
                    const isLast = index === owners.length - 1 && premiumUsers.length === 0
                    const symbol = isLast ? '╰' : '├'
                    const number = user.jid.split('@')[0]
                    const name = user.name || 'Unknown'
                    
                    listText += `${symbol} 👑 ${name} (${number})\n`
                    if (!isLast || premiumUsers.length > 0) {
                        listText += `│   ↳ ${font.smallCaps('Status')}: ${font.smallCaps('Owner')} (${font.smallCaps('Unlimited')})\n`
                    }
                })
            }
            
            if (premiumUsers.length > 0) {
                if (owners.length > 0) {
                    listText += `├─────────────────────────\n`
                }
                listText += `├ 💎 ${font.smallCaps('PREMIUM MEMBERS')}:\n`
                
                premiumUsers.forEach((user, index) => {
                    const isLast = index === premiumUsers.length - 1
                    const symbol = isLast ? '╰' : '├'
                    const number = user.jid.split('@')[0]
                    const name = user.name || 'Unknown'
                    
                    listText += `${symbol} 💎 ${name} (${number})\n`
                    
                    if (!isLast) {
                        if (user.premiumSince) {
                            const since = new Date(user.premiumSince).toLocaleDateString('id-ID')
                            listText += `│   ├ ${font.smallCaps('Since')}: ${since}\n`
                        }
                        
                        if (user.premiumExpiry) {
                            const expiry = new Date(user.premiumExpiry)
                            const now = new Date()
                            const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))
                            const status = daysLeft > 0 ? `${daysLeft} ${font.smallCaps('days left')}` : font.smallCaps('Expired')
                            
                            listText += `│   ╰ ${font.smallCaps('Expires')}: ${expiry.toLocaleDateString('id-ID')} (${status})\n`
                        } else {
                            listText += `│   ╰ ${font.smallCaps('Expires')}: ${font.smallCaps('Lifetime')}\n`
                        }
                    } else {
                        if (user.premiumSince) {
                            const since = new Date(user.premiumSince).toLocaleDateString('id-ID')
                            listText += `    ├ ${font.smallCaps('Since')}: ${since}\n`
                        }
                        
                        if (user.premiumExpiry) {
                            const expiry = new Date(user.premiumExpiry)
                            const now = new Date()
                            const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))
                            const status = daysLeft > 0 ? `${daysLeft} ${font.smallCaps('days left')}` : font.smallCaps('Expired')
                            
                            listText += `    ╰ ${font.smallCaps('Expires')}: ${expiry.toLocaleDateString('id-ID')} (${status})\n`
                        } else {
                            listText += `    ╰ ${font.smallCaps('Expires')}: ${font.smallCaps('Lifetime')}\n`
                        }
                    }
                })
            }
            
            if (premiumUsers.length === 0 && owners.length === 0) {
                listText += `├ ℹ️ ${font.smallCaps('No premium users found')}\n`
                listText += `╰ ${font.smallCaps('Use .addpremium @user to add premium members')}`
            } else {
                listText += `\n💡 ${font.smallCaps('Management Commands')}:\n`
                listText += `• .addpremium @user [${font.smallCaps('duration')}] - ${font.smallCaps('Add premium')}\n`
                listText += `• .delpremium @user - ${font.smallCaps('Remove premium')}\n`
                listText += `• .config get limitSettings - ${font.smallCaps('View limit settings')}`
            }
            
            await reply(listText)
            
        } catch (error) {
            console.error('Error listing premium users:', error)
            await reply(`❌ ${font.smallCaps('Failed to get premium users list')}.`)
        }
    }
}
