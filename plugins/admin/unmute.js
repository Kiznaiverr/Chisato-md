export default {
    command: 'unmute',
    aliases: ['unsilent'],
    category: 'admin',
    description: 'Unmute the group (all members can send messages)',
    usage: 'unmute',
    groupOnly: true,
    adminOnly: true,
    botAdmin: true,
    cooldown: 5,
    
    async execute({ sock, msg, reply, react, isGroup }) {
        if (!isGroup) return reply('❌ This command can only be used in groups.')

        try {
            await react('🕔')
            
            // Unmute the group
            await sock.groupSettingUpdate(msg.key.remoteJid, 'not_announcement')
            
            await react('🔊')
            await reply('🔊 Group has been unmuted! All members can send messages now.')
            
        } catch (error) {
            console.error('Error unmuting group:', error)
            await react('❌')
            await reply('❌ Failed to unmute group. Make sure I have admin privileges.')
        }
    }
}
