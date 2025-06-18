export default {
    command: 'promote',
    aliases: ['admin'],
    category: 'admin',
    description: 'Promote a member to admin',
    usage: 'promote @user',
    groupOnly: true,
    adminOnly: true,
    botAdmin: true,
    cooldown: 5,
    
    async execute({ sock, msg, args, reply, react, isGroup, groupMetadata }) {
        if (!isGroup) return reply('❌ This command can only be used in groups.')
        
        // Check if user mentioned someone or replied to a message
        let target
        if (msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            target = msg.message.extendedTextMessage.contextInfo.mentionedJid[0]
        } else if (msg.message.extendedTextMessage?.contextInfo?.quotedMessage) {
            target = msg.message.extendedTextMessage.contextInfo.participant
        } else if (args[0] && args[0].includes('@')) {
            target = args[0].replace('@', '') + '@s.whatsapp.net'
        } else {
            return reply('❌ Please mention a user or reply to their message.\n\nExample: `promote @user`')
        }

        // Check if target is valid
        if (!target) {
            return reply('❌ Invalid user.')
        }

        // Check if target is the bot itself
        if (target === sock.user.id) {
            return reply('❌ I cannot promote myself!')
        }

        // Check if target is already an admin
        const groupAdmins = groupMetadata.participants.filter(p => p.admin).map(p => p.id)
        if (groupAdmins.includes(target)) {
            return reply('❌ User is already an admin!')
        }

        try {
            await react('⏳')
            
            // Promote the user
            await sock.groupParticipantsUpdate(msg.key.remoteJid, [target], 'promote')
            
            await react('✅')
            await reply(`✅ Successfully promoted @${target.split('@')[0]} to admin!`)
            
        } catch (error) {
            console.error('Error promoting user:', error)
            await react('❌')
            await reply('❌ Failed to promote user. Make sure I have admin privileges.')
        }
    }
}
