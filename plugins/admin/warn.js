import font from '../../lib/font.js'

export default {
    command: 'warn',
    aliases: ['w'],
    category: 'admin',
    description: 'Warn a user',
    usage: '@user [reason]',
    cooldown: 3,
    groupOnly: true,
    adminOnly: true,

    async execute({ msg, sock, reply, react, args, db, isGroup, groupMetadata }) {
        try {
            await react('⚠️');

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
                return reply(`❌ ${font.smallCaps('Please specify a user to warn')}!\n\n${font.bold(font.smallCaps('Usage'))}:\n• ${font.smallCaps('Reply to user\'s message')}: \`.warn [${font.smallCaps('reason')}]\`\n• ${font.smallCaps('Mention user')}: \`.warn @user [${font.smallCaps('reason')}]\`\n• ${font.smallCaps('Use number')}: \`.warn 628xxxxx [${font.smallCaps('reason')}]\``)
            }

            if (db.isOwner(targetJid)) {
                return reply(`❌ ${font.smallCaps('Cannot warn bot owner')}!`)
            }

            if (db.isAdmin(targetJid)) {
                return reply(`❌ ${font.smallCaps('Cannot warn another admin')}!`)
            }

            const groupId = msg.key.remoteJid
            let participants = []
            try {
                const groupInfo = await sock.groupMetadata(groupId)
                participants = groupInfo.participants.map(p => p.id)
            } catch (error) {
                console.error('Error getting group metadata:', error)
            }

            if (!participants.includes(targetJid)) {
                return reply(`❌ ${font.smallCaps('User is not in this group')}!`)
            }

            const senderNumber = msg.key.participant?.split('@')[0] || msg.key.remoteJid.split('@')[0]
            const senderName = msg.pushName || 'Admin'

            const warningCount = db.addWarning(targetJid, reason, `${senderName} (${senderNumber})`)
            const targetNumber = targetJid.split('@')[0]
            const targetUser = db.getUser(targetJid)

            let warnMessage = `⚠️ ${font.bold(font.smallCaps('USER WARNED'))} ⚠️\n\n`
            warnMessage += `👤 ${font.bold(font.smallCaps('Target'))}: @${targetNumber}\n`
            warnMessage += `📝 ${font.bold(font.smallCaps('Reason'))}: ${reason}\n`
            warnMessage += `⚡ ${font.bold(font.smallCaps('Warning Count'))}: ${warningCount}/3\n`
            warnMessage += `👮 ${font.bold(font.smallCaps('Warned by'))}: ${senderName}\n`
            warnMessage += `🕒 ${font.bold(font.smallCaps('Time'))}: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}\n\n`

            if (warningCount >= 3) {
                warnMessage += `🚨 ${font.bold(font.smallCaps('MAXIMUM WARNINGS REACHED'))}!\n`
                warnMessage += `🥾 ${font.smallCaps('User will be kicked from the group')}.\n\n`
                warnMessage += `⚖️ ${font.smallCaps('To appeal this decision, contact group admins')}.`

                await sock.sendMessage(groupId, {
                    text: warnMessage,
                    mentions: [targetJid]
                }, { quoted: msg })

                setTimeout(async () => {
                    try {
                        await sock.groupParticipantsUpdate(groupId, [targetJid], 'remove')
                        
                        await sock.sendMessage(groupId, {
                            text: `✅ @${targetNumber} ${font.smallCaps('has been kicked due to 3 warnings')}.\n\n🔄 ${font.smallCaps('Warnings have been reset')}.`,
                            mentions: [targetJid]
                        })

                        db.clearWarnings(targetJid, `Auto-reset after kick by ${senderName}`)
                        
                    } catch (kickError) {
                        console.error('Error kicking user:', kickError)
                        await reply(`❌ ${font.smallCaps('Failed to kick user. Please check bot permissions')}.\n\n⚠️ ${font.smallCaps('User still has')} ${warningCount} ${font.smallCaps('warnings')}.`)
                    }
                }, 2000)

            } else {
                const remaining = 3 - warningCount
                warnMessage += `⏳ ${font.bold(font.smallCaps('Remaining warnings'))}: ${remaining}\n`
                warnMessage += `💡 ${font.bold(font.smallCaps('Note'))}: ${font.smallCaps('User will be auto-kicked at 3 warnings')}.`

                await sock.sendMessage(groupId, {
                    text: warnMessage,
                    mentions: [targetJid]
                }, { quoted: msg })
            }

            await react('✅')

        } catch (error) {
            console.error('Error in warn command:', error)
            await react('❌')
            await reply(`❌ ${font.smallCaps('An error occurred while processing the warning')}.`)
        }
    }
}
