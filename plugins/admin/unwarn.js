export default {
    command: 'unwarn',
    aliases: ['uw', 'removewarn'],
    category: 'admin',
    description: 'Remove warning',
    usage: '.unwarn @user [reason]',
    cooldown: 3,
    groupOnly: true,
    adminOnly: true,

    async execute({ msg, sock, reply, react, args, db, isGroup }) {
        try {
            await react('🔄');

            // Check if it's a group
            if (!isGroup) {
                return reply('❌ This command can only be used in groups!')
            }

            // Get target user
            let targetJid = null
            let reason = 'No reason provided'

            // Check if replying to a message
            if (msg.message.extendedTextMessage?.contextInfo?.quotedMessage) {
                targetJid = msg.message.extendedTextMessage.contextInfo.participant
                reason = args.join(' ') || reason
            }
            // Check if mentioning a user
            else if (msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
                targetJid = msg.message.extendedTextMessage.contextInfo.mentionedJid[0]
                reason = args.slice(1).join(' ') || reason
            }
            // Check if providing number manually
            else if (args[0]) {
                let number = args[0].replace(/[^0-9]/g, '')
                if (number.startsWith('0')) number = '62' + number.slice(1)
                if (!number.startsWith('62')) number = '62' + number
                targetJid = number + '@s.whatsapp.net'
                reason = args.slice(1).join(' ') || reason
            }

            if (!targetJid) {
                return reply(`❌ Please specify a user to unwarn!\n\n*Usage:*\n• Reply to user's message: \`.unwarn [reason]\`\n• Mention user: \`.unwarn @user [reason]\`\n• Use number: \`.unwarn 628xxxxx [reason]\``)
            }

            // Get current warnings
            const warnings = db.getWarnings(targetJid)
            
            if (warnings.count === 0) {
                return reply(`ℹ️ @${targetJid.split('@')[0]} has no warnings to remove.`, [targetJid])
            }

            // Get sender info for logging
            const senderNumber = msg.key.participant?.split('@')[0] || msg.key.remoteJid.split('@')[0]
            const senderName = msg.pushName || 'Admin'

            // Remove warning
            const newWarningCount = db.removeWarning(targetJid, `${senderName} (${senderNumber})`)
            const targetNumber = targetJid.split('@')[0]

            // Create unwarn message
            let unwarnMessage = `✅ *WARNING REMOVED* ✅\n\n`
            unwarnMessage += `👤 *Target:* @${targetNumber}\n`
            unwarnMessage += `📝 *Reason:* ${reason}\n`
            unwarnMessage += `⚡ *New Warning Count:* ${newWarningCount}/3\n`
            unwarnMessage += `👮 *Removed by:* ${senderName}\n`
            unwarnMessage += `🕒 *Time:* ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}\n\n`
            
            if (newWarningCount === 0) {
                unwarnMessage += `🎉 User now has a clean record!`
            } else {
                unwarnMessage += `📊 User still has ${newWarningCount} warning(s).`
            }

            await sock.sendMessage(msg.key.remoteJid, {
                text: unwarnMessage,
                mentions: [targetJid]
            }, { quoted: msg })

            await react('✅')

        } catch (error) {
            console.error('Error in unwarn command:', error)
            await react('❌')
            await reply('❌ An error occurred while removing the warning.')
        }
    }
}
