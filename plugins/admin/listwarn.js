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

            // Check if it's a group
            if (!isGroup) {
                return reply('❌ This command can only be used in groups!')
            }

            // Get group participants
            const groupId = msg.key.remoteJid
            let participants = []
            try {
                const groupInfo = await sock.groupMetadata(groupId)
                participants = groupInfo.participants.map(p => p.id)
            } catch (error) {
                console.error('Error getting group metadata:', error)
                return reply('❌ Failed to get group information.')
            }

            // Get all users with warnings in this group
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

            // Sort by warning count (highest first)
            warnedUsers.sort((a, b) => b.warnings - a.warnings)

            let listMessage = `📋 *WARNING LIST* 📋\n`
            listMessage += `🏠 *Group:* ${groupInfo.subject || 'Unknown'}\n`
            listMessage += `📊 *Total Warned Users:* ${warnedUsers.length}\n\n`

            if (warnedUsers.length === 0) {
                listMessage += `✅ *Great news!* No users have warnings in this group.\n\n`
                listMessage += `🎉 Everyone is following the rules perfectly!`
            } else {
                listMessage += `⚠️ *Users with Warnings:*\n\n`
                
                warnedUsers.forEach((user, index) => {
                    const riskLevel = user.warnings === 3 ? '🔴' : user.warnings === 2 ? '🟡' : '🟢'
                    listMessage += `${index + 1}. ${riskLevel} @${user.number}\n`
                    listMessage += `   └ ${user.warnings}/3 warnings`
                    
                    if (user.lastWarning) {
                        const date = new Date(user.lastWarning.timestamp).toLocaleDateString('id-ID')
                        listMessage += ` (Last: ${date})`
                    }
                    listMessage += `\n`
                })

                listMessage += `\n📊 *Legend:*\n`
                listMessage += `🟢 Low risk (1 warning)\n`
                listMessage += `🟡 Medium risk (2 warnings)\n`
                listMessage += `🔴 High risk (3 warnings)\n\n`
                
                listMessage += `🛠️ *Admin Commands:*\n`
                listMessage += `• \`.cekwarn @user\` - Check user details\n`
                listMessage += `• \`.unwarn @user\` - Remove a warning\n`
                listMessage += `• \`.clearwarn @user\` - Clear all warnings`
            }

            await sock.sendMessage(msg.key.remoteJid, {
                text: listMessage,
                mentions: warnedUsers.map(u => u.jid)
            }, { quoted: msg })

            await react('✅')

        } catch (error) {
            console.error('Error in listwarn command:', error)
            await react('❌')
            await reply('❌ An error occurred while getting warning list.')
        }
    }
}
