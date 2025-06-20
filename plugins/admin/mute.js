import font from '../../lib/font.js'

export default {
    command: 'mute',
    aliases: ['silent'],
    category: 'admin',
    description: 'Mute group',
    usage: '',
    groupOnly: true,
    adminOnly: true,
    botAdmin: true,
    cooldown: 5,
    
    async execute({ sock, msg, reply, react, isGroup }) {
        if (!isGroup) return reply(`❌ ${font.smallCaps('This command can only be used in groups')}.`)

        try {
            await react('🕔')
            
            await sock.groupSettingUpdate(msg.key.remoteJid, 'announcement')
            
            await react('🔇')
            await reply(`🔇 ${font.smallCaps('Group has been muted! Only admins can send messages now')}.`)
            
        } catch (error) {
            console.error('Error muting group:', error)
            await react('❌')
            await reply(`❌ ${font.smallCaps('Failed to mute group. Make sure I have admin privileges')}.`)
        }
    }
}
