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
                return reply(`❌ Please specify a user to warn!\n\n*Usage:*\n• Reply to user's message: \`.warn [reason]\`\n• Mention user: \`.warn @user [reason]\`\n• Use number: \`.warn 628xxxxx [reason]\``)
            }

            // Check if target is bot owner
            if (db.isOwner(targetJid)) {
                return reply('❌ Cannot warn bot owner!')
            }

            // Check if target is admin (optional - remove if you want admins to warn each other)
            if (db.isAdmin(targetJid)) {
                return reply('❌ Cannot warn another admin!')
            }

            // Get group participants to check if user is in group
            const groupId = msg.key.remoteJid
            let participants = []
            try {
                const groupInfo = await sock.groupMetadata(groupId)
                participants = groupInfo.participants.map(p => p.id)
            } catch (error) {
                console.error('Error getting group metadata:', error)
            }

            // Check if target is in the group
            if (!participants.includes(targetJid)) {
                return reply('❌ User is not in this group!')
            }

            // Get sender info for logging
            const senderNumber = msg.key.participant?.split('@')[0] || msg.key.remoteJid.split('@')[0]
            const senderName = msg.pushName || 'Admin'

            // Add warning
            const warningCount = db.addWarning(targetJid, reason, `${senderName} (${senderNumber})`)
            const targetNumber = targetJid.split('@')[0]
            const targetUser = db.getUser(targetJid)

            // Create warning message
            let warnMessage = `⚠️ *USER WARNED* ⚠️\n\n`
            warnMessage += `👤 *Target:* @${targetNumber}\n`
            warnMessage += `📝 *Reason:* ${reason}\n`
            warnMessage += `⚡ *Warning Count:* ${warningCount}/3\n`
            warnMessage += `👮 *Warned by:* ${senderName}\n`
            warnMessage += `🕒 *Time:* ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}\n\n`

            if (warningCount >= 3) {
                warnMessage += `🚨 *MAXIMUM WARNINGS REACHED!*\n`
                warnMessage += `🥾 User will be kicked from the group.\n\n`
                warnMessage += `⚖️ To appeal this decision, contact group admins.`

                // Send warning message first
                await sock.sendMessage(groupId, {
                    text: warnMessage,
                    mentions: [targetJid]
                }, { quoted: msg })

                // Wait a moment then kick
                setTimeout(async () => {
                    try {
                        await sock.groupParticipantsUpdate(groupId, [targetJid], 'remove')
                        
                        // Send kick confirmation
                        await sock.sendMessage(groupId, {
                            text: `✅ @${targetNumber} has been kicked due to 3 warnings.\n\n🔄 Warnings have been reset.`,
                            mentions: [targetJid]
                        })

                        // Reset warnings after kick
                        db.clearWarnings(targetJid, `Auto-reset after kick by ${senderName}`)
                        
                    } catch (kickError) {
                        console.error('Error kicking user:', kickError)
                        await reply(`❌ Failed to kick user. Please check bot permissions.\n\n⚠️ User still has ${warningCount} warnings.`)
                    }
                }, 2000)

            } else {
                const remaining = 3 - warningCount
                warnMessage += `⏳ *Remaining warnings:* ${remaining}\n`
                warnMessage += `💡 *Note:* User will be auto-kicked at 3 warnings.`

                await sock.sendMessage(groupId, {
                    text: warnMessage,
                    mentions: [targetJid]
                }, { quoted: msg })
            }

            await react('✅')

        } catch (error) {
            console.error('Error in warn command:', error)
            await react('❌')
            await reply('❌ An error occurred while processing the warning.')
        }
    }
}
