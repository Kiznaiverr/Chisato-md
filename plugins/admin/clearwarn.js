import font from '../../lib/font.js'

export default {
    command: 'clearwarn',
    aliases: ['resetwarn', 'clearwarnings'],
    category: 'admin',
    description: 'Clear warnings',
    usage: '@user [reason]',
    cooldown: 3,
    groupOnly: true,
    adminOnly: true,

    async execute({ msg, sock, reply, react, args, db, isGroup }) {
        try {
            await react('🔄');

            // Check if it's a group
            if (!isGroup) {
                return reply(`❌ ${font.smallCaps('This command can only be used in groups')}!`)
            }

            // Get target user
            let targetJid = null
            let reason = 'Admin discretion'

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
                return reply(`❌ ${font.smallCaps('Please specify a user to clear warnings')}!\n\n${font.bold(font.smallCaps('Usage'))}:\n• ${font.smallCaps('Reply to user\'s message')}: \`.clearwarn [${font.smallCaps('reason')}]\`\n• ${font.smallCaps('Mention user')}: \`.clearwarn @user [${font.smallCaps('reason')}]\`\n• ${font.smallCaps('Use number')}: \`.clearwarn 628xxxxx [${font.smallCaps('reason')}]\``)
            }

            // Get current warnings
            const warnings = db.getWarnings(targetJid)
            
            if (warnings.count === 0) {
                return reply(`ℹ️ @${targetJid.split('@')[0]} ${font.smallCaps('has no warnings to clear')}.`, [targetJid])
            }

            // Get sender info for logging
            const senderNumber = msg.key.participant?.split('@')[0] || msg.key.remoteJid.split('@')[0]
            const senderName = msg.pushName || 'Admin'

            // Clear all warnings
            const clearedCount = db.clearWarnings(targetJid, `${senderName} (${senderNumber}) - ${reason}`)
            const targetNumber = targetJid.split('@')[0]

            // Create clear message
            let clearMessage = `🧹 ${font.bold(font.smallCaps('ALL WARNINGS CLEARED'))} 🧹\n\n`
            clearMessage += `👤 ${font.bold(font.smallCaps('Target'))}: @${targetNumber}\n`
            clearMessage += `📝 ${font.bold(font.smallCaps('Reason'))}: ${reason}\n`
            clearMessage += `🗑️ ${font.bold(font.smallCaps('Warnings Cleared'))}: ${clearedCount}\n`
            clearMessage += `👮 ${font.bold(font.smallCaps('Cleared by'))}: ${senderName}\n`
            clearMessage += `🕒 ${font.bold(font.smallCaps('Time'))}: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}\n\n`
            clearMessage += `✨ ${font.smallCaps('User now has a clean record')}!\n`
            clearMessage += `💡 ${font.smallCaps('This is a fresh start - please follow group rules')}.`

            await sock.sendMessage(msg.key.remoteJid, {
                text: clearMessage,
                mentions: [targetJid]
            }, { quoted: msg })

            await react('✅')

        } catch (error) {
            console.error('Error in clearwarn command:', error)
            await react('❌')
            await reply(`❌ ${font.smallCaps('An error occurred while clearing warnings')}.`)
        }
    }
}
