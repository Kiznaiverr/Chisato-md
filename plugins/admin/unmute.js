import font from '../../lib/font.js'

export default {
    command: 'unmute',
    aliases: ['unsilent'],
    category: 'admin',
    description: 'Unmute the group',
    usage: 'unmute',
    groupOnly: true,
    adminOnly: true,
    botAdmin: true,
    cooldown: 5,
    
    async execute({ sock, msg, reply, react, isGroup }) {
        if (!isGroup) return reply(`❌ ${font.smallCaps('This command can only be used in groups')}.`)

        try {
            await react('🕔')
            
            await sock.groupSettingUpdate(msg.key.remoteJid, 'not_announcement')
            
            await react('🔊')
            await reply(`🔊 ${font.smallCaps('Group has been unmuted! All members can send messages now')}.`)
            
        } catch (error) {
            console.error('Error unmuting group:', error)
            await react('❌')
            await reply(`❌ ${font.smallCaps('Failed to unmute group. Make sure I have admin privileges')}.`)
        }
    }
}
