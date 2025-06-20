import font from '../../lib/font.js'

export default {
    command: 'revokelink',
    aliases: ['resetlink', 'newlink', 'revoke'],
    category: 'admin',
    description: 'Revoke and generate new group invite link',
    usage: '',
    groupOnly: true,
    adminOnly: true,
    botAdmin: true,
    cooldown: 10,
    
    async execute({ sock, msg, reply, react, isGroup, groupMetadata }) {
        if (!isGroup) return reply(`❌ ${font.smallCaps('This command can only be used in groups')}!`)
        
        try {
            await react('🕔')
            
            await sock.groupRevokeInvite(msg.key.remoteJid)
            
            const newInviteCode = await sock.groupInviteCode(msg.key.remoteJid)
            const newInviteLink = `https://chat.whatsapp.com/${newInviteCode}`
            
            await react('✅')
            await reply(`🔄 ${font.bold(font.smallCaps('GROUP LINK REVOKED'))}

╭─「 🔒 ${font.smallCaps('Security Update')} 」
├ 🏷️ ${font.smallCaps('Group')}: ${font.smallCaps(groupMetadata.subject)}
├ ❌ ${font.smallCaps('Old Link')}: ${font.smallCaps('Revoked')}
├ ✅ ${font.smallCaps('New Link')}: ${font.smallCaps('Generated')}
├ 👮 ${font.smallCaps('Updated by')}: ${font.smallCaps('Admin')}
├ 🕒 ${font.smallCaps('Time')}: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}
╰───────────────

🔗 ${font.bold(font.smallCaps('New Invite Link'))}:
${newInviteLink}

ℹ️ ${font.bold(font.smallCaps('What happened'))}:
• ${font.smallCaps('Previous invite link has been disabled')}
• ${font.smallCaps('People with old link can no longer join')}
• ${font.smallCaps('Share the new link to invite people')}

🔒 ${font.smallCaps('This action helps maintain group security')}!`)
            
        } catch (error) {
            console.error('Error revoking group link:', error)
            await react('❌')
            await reply(`❌ ${font.smallCaps('Failed to revoke group invite link. Make sure I have admin privileges')}.`)
        }
    }
}
