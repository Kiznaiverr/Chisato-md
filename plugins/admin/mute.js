export default {
    command: 'mute',
    aliases: ['silent'],
    category: 'admin',
    description: 'Mute the group',
    usage: 'mute',
    groupOnly: true,
    adminOnly: true,
    botAdmin: true,
    cooldown: 5,
    
    async execute({ sock, msg, reply, react, isGroup }) {
        if (!isGroup) return reply('❌ This command can only be used in groups.')

        try {
            await react('🕔')
            
            // Mute the group
            await sock.groupSettingUpdate(msg.key.remoteJid, 'announcement')
            
            await react('🔇')
            await reply('🔇 Group has been muted! Only admins can send messages now.')
            
        } catch (error) {
            console.error('Error muting group:', error)
            await react('❌')
            await reply('❌ Failed to mute group. Make sure I have admin privileges.')
        }
    }
}
