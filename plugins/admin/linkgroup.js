import font from '../../lib/font.js'

export default {
    command: 'linkgroup',
    aliases: ['link', 'grouplink', 'invitelink'],
    category: 'admin',
    description: 'Get group invite link',
    usage: '',
    groupOnly: true,
    adminOnly: true,
    botAdmin: true,
    cooldown: 5,
    
    async execute({ sock, msg, reply, react, isGroup, groupMetadata }) {
        if (!isGroup) return reply(`❌ ${font.smallCaps('This command can only be used in groups')}!`)
        
        try {
            await react('🕔')
            
            // Get group invite code
            const inviteCode = await sock.groupInviteCode(msg.key.remoteJid)
            const inviteLink = `https://chat.whatsapp.com/${inviteCode}`
            
            await react('✅')
            await reply(`🔗 ${font.bold(font.smallCaps('GROUP INVITE LINK'))}

╭─「 📋 ${font.smallCaps('Group Info')} 」
├ 🏷️ ${font.smallCaps('Name')}: ${font.smallCaps(groupMetadata.subject)}
├ 👥 ${font.smallCaps('Members')}: ${groupMetadata.participants.length}
├ 📅 ${font.smallCaps('Created')}: ${new Date(groupMetadata.creation * 1000).toLocaleDateString('id-ID')}
╰───────────────

🔗 ${font.bold(font.smallCaps('Invite Link'))}:
${inviteLink}

⚠️ ${font.bold(font.smallCaps('Important Notes'))}:
• ${font.smallCaps('Only share this link with trusted people')}
• ${font.smallCaps('Anyone with this link can join the group')}
• ${font.smallCaps('You can revoke this link anytime using')} .revokelink

🕒 ${font.smallCaps('Generated at')}: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`)
            
        } catch (error) {
            console.error('Error getting group link:', error)
            await react('❌')
            await reply(`❌ ${font.smallCaps('Failed to get group invite link. Make sure I have admin privileges')}.`)
        }
    }
}
