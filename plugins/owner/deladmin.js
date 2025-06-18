export default {
    command: 'deladmin',
    aliases: ['removeadmin'],
    category: 'owner',
    description: 'Remove user as bot admin',
    usage: 'deladmin @user',
    ownerOnly: true,
    cooldown: 5,
    
    async execute({ msg, args, reply, react, db }) {
        // Check if user mentioned someone or replied to a message
        let target
        if (msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            target = msg.message.extendedTextMessage.contextInfo.mentionedJid[0]
        } else if (msg.message.extendedTextMessage?.contextInfo?.quotedMessage) {
            target = msg.message.extendedTextMessage.contextInfo.participant
        } else if (args[0] && args[0].includes('@')) {
            target = args[0].replace('@', '') + '@s.whatsapp.net'
        } else {
            return reply('❌ Please mention a user or reply to their message.\n\nExample: `deladmin @user`')
        }

        // Check if target is valid
        if (!target) {
            return reply('❌ Invalid user.')
        }

        // Check if target is owner
        if (db.isOwner(target)) {
            return reply('❌ Cannot remove owner from admin!')
        }

        // Check if target is admin
        if (!db.isAdmin(target)) {
            return reply('❌ User is not an admin!')
        }

        try {
            await react('⏳')
            
            // Remove admin
            db.removeAdmin(target)
            
            await react('✅')
            await reply(`✅ Successfully removed @${target.split('@')[0]} from bot admin!`)
            
        } catch (error) {
            console.error('Error removing admin:', error)
            await react('❌')
            await reply('❌ Failed to remove admin.')
        }
    }
}
