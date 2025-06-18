export default {
    command: 'ban',
    aliases: ['block'],
    category: 'admin',
    description: 'Ban a user from using the bot',
    usage: 'ban @user',
    adminOnly: true,
    cooldown: 5,
    
    async execute({ msg, args, reply, react, db, sender }) {
        // Check if user mentioned someone or replied to a message
        let target
        if (msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            target = msg.message.extendedTextMessage.contextInfo.mentionedJid[0]
        } else if (msg.message.extendedTextMessage?.contextInfo?.quotedMessage) {
            target = msg.message.extendedTextMessage.contextInfo.participant
        } else if (args[0] && args[0].includes('@')) {
            target = args[0].replace('@', '') + '@s.whatsapp.net'
        } else {
            return reply('❌ Please mention a user or reply to their message.\n\nExample: `ban @user`')
        }

        // Check if target is valid
        if (!target) {
            return reply('❌ Invalid user.')
        }

        // Check if target is already banned
        if (db.isBanned(target)) {
            return reply('❌ User is already banned!')
        }

        // Check if target is owner
        if (db.isOwner(target)) {
            return reply('❌ Cannot ban the owner!')
        }

        // Check if target is admin and sender is not owner
        if (db.isAdmin(target) && !db.isOwner(sender)) {
            return reply('❌ You cannot ban an admin!')
        }

        try {
            await react('🕔')
            
            // Ban the user
            db.banUser(target)
            
            await react('✅')
            await reply(`✅ Successfully banned @${target.split('@')[0]} from using the bot!`)
            
        } catch (error) {
            console.error('Error banning user:', error)
            await react('❌')
            await reply('❌ Failed to ban user.')
        }
    }
}
