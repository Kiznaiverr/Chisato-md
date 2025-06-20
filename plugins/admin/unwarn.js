import font from '../../lib/font.js'

export default {
    command: 'unwarn',
    aliases: ['uw', 'removewarn'],
    category: 'admin',
    description: 'Remove warning',
    usage: '@user [reason]',
    cooldown: 3,
    groupOnly: true,
    adminOnly: true,

    async execute({ msg, sock, reply, react, args, db, isGroup }) {
        try {
            await react('🔄');

            if (!isGroup) {
                return reply(`❌ ${font.smallCaps('This command can only be used in groups')}!`)
            }

            let targetJid = null
            let reason = 'No reason provided'

            if (msg.message.extendedTextMessage?.contextInfo?.quotedMessage) {
                targetJid = msg.message.extendedTextMessage.contextInfo.participant
                reason = args.join(' ') || reason
            }
            else if (msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
                targetJid = msg.message.extendedTextMessage.contextInfo.mentionedJid[0]
                reason = args.slice(1).join(' ') || reason
            }
            else if (args[0]) {
                let number = args[0].replace(/[^0-9]/g, '')
                if (number.startsWith('0')) number = '62' + number.slice(1)
                if (!number.startsWith('62')) number = '62' + number
                targetJid = number + '@s.whatsapp.net'
                reason = args.slice(1).join(' ') || reason
            }

            if (!targetJid) {
                return reply(`❌ ${font.smallCaps('Please specify a user to unwarn')}!\n\n${font.bold(font.smallCaps('Usage'))}:\n• ${font.smallCaps('Reply to user\'s message')}: \`.unwarn [${font.smallCaps('reason')}]\`\n• ${font.smallCaps('Mention user')}: \`.unwarn @user [${font.smallCaps('reason')}]\`\n• ${font.smallCaps('Use number')}: \`.unwarn 628xxxxx [${font.smallCaps('reason')}]\``)
            }

            const warnings = db.getWarnings(targetJid)
            
            if (warnings.count === 0) {
                return reply(`ℹ️ @${targetJid.split('@')[0]} ${font.smallCaps('has no warnings to remove')}.`, [targetJid])
            }

            const senderNumber = msg.key.participant?.split('@')[0] || msg.key.remoteJid.split('@')[0]
            const senderName = msg.pushName || 'Admin'

            const newWarningCount = db.removeWarning(targetJid, `${senderName} (${senderNumber})`)
            const targetNumber = targetJid.split('@')[0]

            let unwarnMessage = `✅ ${font.bold(font.smallCaps('WARNING REMOVED'))} ✅\n\n`
            unwarnMessage += `👤 ${font.bold(font.smallCaps('Target'))}: @${targetNumber}\n`
            unwarnMessage += `📝 ${font.bold(font.smallCaps('Reason'))}: ${reason}\n`
            unwarnMessage += `⚡ ${font.bold(font.smallCaps('New Warning Count'))}: ${newWarningCount}/3\n`
            unwarnMessage += `👮 ${font.bold(font.smallCaps('Removed by'))}: ${senderName}\n`
            unwarnMessage += `🕒 ${font.bold(font.smallCaps('Time'))}: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}\n\n`
            
            if (newWarningCount === 0) {
                unwarnMessage += `🎉 ${font.smallCaps('User now has a clean record')}!`
            } else {
                unwarnMessage += `📊 ${font.smallCaps('User still has')} ${newWarningCount} ${font.smallCaps('warning(s)')}.`
            }

            await sock.sendMessage(msg.key.remoteJid, {
                text: unwarnMessage,
                mentions: [targetJid]
            }, { quoted: msg })

            await react('✅')

        } catch (error) {
            console.error('Error in unwarn command:', error)
            await react('❌')
            await reply(`❌ ${font.smallCaps('An error occurred while removing the warning')}.`)
        }
    }
}
