export default {
    command: 'unban',
    aliases: ['unblock'],
    category: 'admin',
    description: 'Unban a user from using the bot',
    usage: 'unban @user',
    adminOnly: true,
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
            return reply('❌ Please mention a user or reply to their message.\n\nExample: `unban @user`')
        }

        // Check if target is valid
        if (!target) {
            return reply('❌ Invalid user.')
        }

        // Check if target is banned
        if (!db.isBanned(target)) {
            return reply('❌ User is not banned!')
        }

        try {
            await react('⏳')
            
            // Unban the user
            db.unbanUser(target)
            
            await react('✅')
            await reply(`✅ Successfully unbanned @${target.split('@')[0]}!`)
            
        } catch (error) {
            console.error('Error unbanning user:', error)
            await react('❌')
            await reply('❌ Failed to unban user.')
        }
    }
}
