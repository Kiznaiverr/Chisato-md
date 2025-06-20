import font from '../../lib/font.js'

export default {
    command: 'listwarn',
    aliases: ['warnlist', 'warninglist'],
    category: 'admin',
    description: 'list',
    usage: '',
    cooldown: 5,
    groupOnly: true,
    adminOnly: true,

    async execute({ msg, sock, reply, react, db, isGroup }) {
        try {
            await react('📋');

            if (!isGroup) {
                return reply(`❌ ${font.smallCaps('This command can only be used in groups')}!`)
            }

            const groupId = msg.key.remoteJid
            let participants = []
            try {
                const groupInfo = await sock.groupMetadata(groupId)
                participants = groupInfo.participants.map(p => p.id)
            } catch (error) {
                console.error('Error getting group metadata:', error)
                return reply(`❌ ${font.smallCaps('Failed to get group information')}.`)
            }

            const warnedUsers = []
            for (const participantJid of participants) {
                const warnings = db.getWarnings(participantJid)
                if (warnings.count > 0) {
                    warnedUsers.push({
                        jid: participantJid,
                        number: participantJid.split('@')[0],
                        warnings: warnings.count,
                        lastWarning: warnings.lastWarning
                    })
                }
            }

            warnedUsers.sort((a, b) => b.warnings - a.warnings)

            let listMessage = `📋 ${font.bold(font.smallCaps('WARNING LIST'))} 📋\n`
            listMessage += `🏠 ${font.bold(font.smallCaps('Group'))}: ${groupInfo.subject || 'Unknown'}\n`
            listMessage += `📊 ${font.bold(font.smallCaps('Total Warned Users'))}: ${warnedUsers.length}\n\n`

            if (warnedUsers.length === 0) {
                listMessage += `✅ ${font.bold(font.smallCaps('Great news!'))} ${font.smallCaps('No users have warnings in this group')}.\n\n`
                listMessage += `🎉 ${font.smallCaps('Everyone is following the rules perfectly')}!`
            } else {
                listMessage += `⚠️ ${font.bold(font.smallCaps('Users with Warnings'))}:\n\n`
                
                warnedUsers.forEach((user, index) => {
                    const riskLevel = user.warnings === 3 ? '🔴' : user.warnings === 2 ? '🟡' : '🟢'
                    listMessage += `${index + 1}. ${riskLevel} @${user.number}\n`
                    listMessage += `   └ ${user.warnings}/3 ${font.smallCaps('warnings')}`
                    
                    if (user.lastWarning) {
                        const date = new Date(user.lastWarning.timestamp).toLocaleDateString('id-ID')
                        listMessage += ` (${font.smallCaps('Last')}: ${date})`
                    }
                    listMessage += `\n`
                })

                listMessage += `\n📊 ${font.bold(font.smallCaps('Legend'))}:\n`
                listMessage += `🟢 ${font.smallCaps('Low risk')} (1 ${font.smallCaps('warning')})\n`
                listMessage += `🟡 ${font.smallCaps('Medium risk')} (2 ${font.smallCaps('warnings')})\n`
                listMessage += `🔴 ${font.smallCaps('High risk')} (3 ${font.smallCaps('warnings')})\n\n`
                
                listMessage += `🛠️ ${font.bold(font.smallCaps('Admin Commands'))}:\n`
                listMessage += `• \`.cekwarn @user\` - ${font.smallCaps('Check user details')}\n`
                listMessage += `• \`.unwarn @user\` - ${font.smallCaps('Remove a warning')}\n`
                listMessage += `• \`.clearwarn @user\` - ${font.smallCaps('Clear all warnings')}`
            }

            await sock.sendMessage(msg.key.remoteJid, {
                text: listMessage,
                mentions: warnedUsers.map(u => u.jid)
            }, { quoted: msg })

            await react('✅')

        } catch (error) {
            console.error('Error in listwarn command:', error)
            await react('❌')
            await reply(`❌ ${font.smallCaps('An error occurred while getting warning list')}.`)
        }
    }
}
