export default {
    command: 'addpremium',
    aliases: ['setpremium', 'addprem'],
    category: 'owner',
    description: 'Add user as premium member',
    usage: 'addpremium @user [duration]',
    ownerOnly: true,
    cooldown: 5,
    
    async execute({ msg, args, reply, react, db }) {
        // Check if user mentioned someone or replied to a message
        let target
        if (msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            target = msg.message.extendedTextMessage.contextInfo.mentionedJid[0]
        } else if (msg.message.extendedTextMessage?.contextInfo?.quotedMessage) {
            target = msg.message.extendedTextMessage.contextInfo.participant
        } else if (args[0] && args[0].includes('@')) {
            target = args[0].replace('@', '') + '@s.whatsapp.net'
        } else {
            return reply('❌ Please mention a user or reply to their message.\n\n💡 Example: `addpremium @user` or `addpremium @user 30d`')
        }

        // Check if target is valid
        if (!target) {
            return reply('❌ Invalid user.')
        }

        // Parse duration (optional)
        let duration = null
        let durationMs = 0
        const durationArg = args[1] || args[0] // Support both positions
        
        if (durationArg && !durationArg.includes('@')) {
            const durationMatch = durationArg.match(/(\d+)([dhm]?)/)
            if (durationMatch) {
                const value = parseInt(durationMatch[1])
                const unit = durationMatch[2] || 'd'
                
                switch (unit) {
                    case 'm':
                        durationMs = value * 60 * 1000
                        duration = `${value} minute${value > 1 ? 's' : ''}`
                        break
                    case 'h':
                        durationMs = value * 60 * 60 * 1000
                        duration = `${value} hour${value > 1 ? 's' : ''}`
                        break
                    case 'd':
                    default:
                        durationMs = value * 24 * 60 * 60 * 1000
                        duration = `${value} day${value > 1 ? 's' : ''}`
                        break
                }
            }
        }

        try {
            await react('🕔')
            
            // Get user data
            const user = db.getUser(target)
            
            if (user.premium) {
                await react('⚠️')
                return reply(`⚠️ @${target.split('@')[0]} is already a premium member!
                
📊 Current Status:
├ 💎 Premium: Yes
├ ⏰ Expires: ${user.premiumExpiry ? new Date(user.premiumExpiry).toLocaleString('id-ID') : 'Never'}
└ 🎫 Limit: Unlimited

💡 Use \`delpremium @user\` to remove premium status first.`)
            }
            
            // Set premium status
            user.premium = true
            user.premiumSince = Date.now()
            
            if (duration && durationMs > 0) {
                user.premiumExpiry = Date.now() + durationMs
            } else {
                user.premiumExpiry = null // Lifetime premium
            }
            
            // Reset daily limit to premium amount
            const premiumLimit = db.getSetting('premiumLimit') || 999
            user.limit = premiumLimit
            
            db.saveUsers()
            
            await react('✅')
            
            let successText = `✅ Successfully added @${target.split('@')[0]} as premium member!

╭─「 💎 Premium Status 」
├ 👤 User: @${target.split('@')[0]}
├ 💎 Status: Premium Member
├ 📅 Since: ${new Date().toLocaleString('id-ID')}
├ ⏰ Duration: ${duration || 'Lifetime'}
├ 🎫 Daily Limit: ${premiumLimit} (was ${user.limit})
├ 🚀 Benefits: Unlimited commands, priority support
╰─────────────────────────

🎉 Welcome to premium tier!`

            if (user.premiumExpiry) {
                successText += `\n⏰ Expires: ${new Date(user.premiumExpiry).toLocaleString('id-ID')}`
            }
            
            return reply(successText)
            
        } catch (error) {
            console.error('Error adding premium:', error)
            await react('❌')
            await reply('❌ Failed to add premium member.')
        }
    }
}
