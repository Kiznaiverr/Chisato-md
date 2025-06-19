import font from '../../lib/font.js'

export default {
    command: 'addpremium',
    aliases: ['setpremium', 'addprem'],
    category: 'owner',
    description: 'Add premium member',
    usage: '@user [duration]',
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
            return reply(`❌ ${font.smallCaps('Please mention a user or reply to their message')}.\n\n💡 ${font.smallCaps('Example')}: \`addpremium @user\` ${font.smallCaps('or')} \`addpremium @user 30d\``)
        }

        // Check if target is valid
        if (!target) {
            return reply(`❌ ${font.smallCaps('Invalid user')}.`)
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
                        duration = `${value} ${font.smallCaps('minute')}${value > 1 ? 's' : ''}`
                        break
                    case 'h':
                        durationMs = value * 60 * 60 * 1000
                        duration = `${value} ${font.smallCaps('hour')}${value > 1 ? 's' : ''}`
                        break
                    case 'd':
                    default:
                        durationMs = value * 24 * 60 * 60 * 1000
                        duration = `${value} ${font.smallCaps('day')}${value > 1 ? 's' : ''}`
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
                return reply(`⚠️ @${target.split('@')[0]} ${font.smallCaps('is already a premium member')}!
                
📊 ${font.smallCaps('Current Status')}:
├ 💎 ${font.smallCaps('Premium')}: ${font.smallCaps('Yes')}
├ ⏰ ${font.smallCaps('Expires')}: ${user.premiumExpiry ? new Date(user.premiumExpiry).toLocaleString('id-ID') : font.smallCaps('Never')}
└ 🎫 ${font.smallCaps('Limit')}: ${font.smallCaps('Unlimited')}

💡 ${font.smallCaps('Use')} \`delpremium @user\` ${font.smallCaps('to remove premium status first')}.`)
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
            
            let successText = `✅ ${font.smallCaps('Successfully added')} @${target.split('@')[0]} ${font.smallCaps('as premium member')}!

╭─「 💎 ${font.smallCaps('Premium Status')} 」
├ 👤 ${font.smallCaps('User')}: @${target.split('@')[0]}
├ 💎 ${font.smallCaps('Status')}: ${font.smallCaps('Premium Member')}
├ 📅 ${font.smallCaps('Since')}: ${new Date().toLocaleString('id-ID')}
├ ⏰ ${font.smallCaps('Duration')}: ${duration || font.smallCaps('Lifetime')}
├ 🎫 ${font.smallCaps('Daily Limit')}: ${premiumLimit} (${font.smallCaps('was')} ${user.limit})
├ 🚀 ${font.smallCaps('Benefits')}: ${font.smallCaps('Unlimited commands, priority support')}
╰───────────────

🎉 ${font.smallCaps('Welcome to premium tier')}!`

            if (user.premiumExpiry) {
                successText += `\n⏰ ${font.smallCaps('Expires')}: ${new Date(user.premiumExpiry).toLocaleString('id-ID')}`
            }
            
            return reply(successText)
            
        } catch (error) {
            console.error('Error adding premium:', error)
            await react('❌')
            await reply(`❌ ${font.smallCaps('Failed to add premium member')}.`)
        }
    }
}
