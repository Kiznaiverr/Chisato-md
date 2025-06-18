export default {
    command: 'listpremium',
    aliases: ['premiumlist', 'listprem'],
    category: 'owner',
    description: 'Show list premumium',
    usage: 'listpremium',
    ownerOnly: true,
    cooldown: 5,
    
    async execute({ reply, db }) {
        try {
            const allUsers = Object.values(db.users)
            const premiumUsers = allUsers.filter(user => user.premium)
            const owners = allUsers.filter(user => db.isOwner(user.jid))
            
            let listText = `╭─「 💎 Premium Users List 」\n`
            listText += `├ 📊 Total Premium: ${premiumUsers.length}\n`
            listText += `├ 👑 Total Owners: ${owners.length}\n`
            listText += `├─────────────────────────\n`
            
            if (owners.length > 0) {
                listText += `├ 👑 BOT OWNERS:\n`
                owners.forEach((user, index) => {
                    const isLast = index === owners.length - 1 && premiumUsers.length === 0
                    const symbol = isLast ? '╰' : '├'
                    const number = user.jid.split('@')[0]
                    const name = user.name || 'Unknown'
                    
                    listText += `${symbol} 👑 ${name} (${number})\n`
                    if (!isLast || premiumUsers.length > 0) {
                        listText += `│   ↳ Status: Owner (Unlimited)\n`
                    }
                })
            }
            
            if (premiumUsers.length > 0) {
                if (owners.length > 0) {
                    listText += `├─────────────────────────\n`
                }
                listText += `├ 💎 PREMIUM MEMBERS:\n`
                
                premiumUsers.forEach((user, index) => {
                    const isLast = index === premiumUsers.length - 1
                    const symbol = isLast ? '╰' : '├'
                    const number = user.jid.split('@')[0]
                    const name = user.name || 'Unknown'
                    
                    listText += `${symbol} 💎 ${name} (${number})\n`
                    
                    if (!isLast) {
                        if (user.premiumSince) {
                            const since = new Date(user.premiumSince).toLocaleDateString('id-ID')
                            listText += `│   ├ Since: ${since}\n`
                        }
                        
                        if (user.premiumExpiry) {
                            const expiry = new Date(user.premiumExpiry)
                            const now = new Date()
                            const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))
                            const status = daysLeft > 0 ? `${daysLeft} days left` : 'Expired'
                            
                            listText += `│   ╰ Expires: ${expiry.toLocaleDateString('id-ID')} (${status})\n`
                        } else {
                            listText += `│   ╰ Expires: Lifetime\n`
                        }
                    } else {
                        if (user.premiumSince) {
                            const since = new Date(user.premiumSince).toLocaleDateString('id-ID')
                            listText += `    ├ Since: ${since}\n`
                        }
                        
                        if (user.premiumExpiry) {
                            const expiry = new Date(user.premiumExpiry)
                            const now = new Date()
                            const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))
                            const status = daysLeft > 0 ? `${daysLeft} days left` : 'Expired'
                            
                            listText += `    ╰ Expires: ${expiry.toLocaleDateString('id-ID')} (${status})\n`
                        } else {
                            listText += `    ╰ Expires: Lifetime\n`
                        }
                    }
                })
            }
            
            if (premiumUsers.length === 0 && owners.length === 0) {
                listText += `├ ℹ️ No premium users found\n`
                listText += `╰ Use .addpremium @user to add premium members`
            } else {
                listText += `\n💡 Management Commands:\n`
                listText += `• .addpremium @user [duration] - Add premium\n`
                listText += `• .delpremium @user - Remove premium\n`
                listText += `• .config get limitSettings - View limit settings`
            }
            
            await reply(listText)
            
        } catch (error) {
            console.error('Error listing premium users:', error)
            await reply('❌ Failed to get premium users list.')
        }
    }
}
