import font from '../../lib/font.js'

export default {
    command: 'delpremium',
    aliases: ['removepremium', 'delprem'],
    category: 'owner',
    description: 'Remove premium member',
    usage: '@user',
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
            return reply(`❌ ${font.smallCaps('Please mention a user or reply to their message')}.\n\n💡 ${font.smallCaps('Example')}: \`delpremium @user\``)
        }

        // Check if target is valid
        if (!target) {
            return reply(`❌ ${font.smallCaps('Invalid user')}.`)
        }

        // Check if target is owner
        if (db.isOwner(target)) {
            return reply(`❌ ${font.smallCaps('Cannot remove premium status from bot owner')}!`)
        }

        try {
            await react('🕔')
            
            // Get user data
            const user = db.getUser(target)
            
            if (!user.premium) {
                await react('⚠️')
                return reply(`⚠️ @${target.split('@')[0]} ${font.smallCaps('is not a premium member')}!
                
📊 ${font.smallCaps('Current Status')}:
├ 💎 ${font.smallCaps('Premium')}: ${font.smallCaps('No')}
├ 🎫 ${font.smallCaps('Daily Limit')}: ${user.limit}
└ 💡 ${font.smallCaps('User already has regular status')}`)
            }
            
            // Store premium info for confirmation message
            const wasPremiumSince = user.premiumSince
            const hadExpiry = user.premiumExpiry
            
            // Remove premium status
            user.premium = false
            user.premiumSince = null
            user.premiumExpiry = null
            
            // Reset to regular daily limit
            const regularLimit = db.getSetting('dailyLimit') || 20
            user.limit = regularLimit
            
            db.saveUsers()
            
            await react('✅')
            
            let successText = `✅ ${font.smallCaps('Successfully removed')} @${target.split('@')[0]} ${font.smallCaps('from premium members')}!

╭─「 📋 ${font.smallCaps('Status Change')} 」
├ 👤 ${font.smallCaps('User')}: @${target.split('@')[0]}
├ 💎 ${font.smallCaps('Premium')}: ${font.smallCaps('No')} (${font.smallCaps('was Premium')})
├ 📅 ${font.smallCaps('Was Premium Since')}: ${wasPremiumSince ? new Date(wasPremiumSince).toLocaleString('id-ID') : 'Unknown'}
├ 🎫 ${font.smallCaps('Daily Limit')}: ${regularLimit} (${font.smallCaps('was Unlimited')})
├ 📊 ${font.smallCaps('New Status')}: ${font.smallCaps('Regular User')}
╰─────────────────────────`

            if (hadExpiry) {
                const expiredText = hadExpiry < Date.now() ? font.smallCaps('Expired') : font.smallCaps('Cancelled')
                successText += `\n⏰ ${expiredText}: ${new Date(hadExpiry).toLocaleString('id-ID')}`
            }
            
            successText += `\n\n💡 ${font.smallCaps('User can still use regular commands with daily limits')}.`
            
            return reply(successText)
            
        } catch (error) {
            console.error('Error removing premium:', error)
            await react('❌')
            await reply(`❌ ${font.smallCaps('Failed to remove premium member')}.`)
        }
    }
}
