import config from '../../lib/config.js'

export default {
    command: 'addadmin',
    aliases: ['setadmin'],
    category: 'owner',
    description: 'Add bot admin',
    usage: '@user',
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
            return reply('❌ Please mention a user or reply to their message.\n\nExample: `addadmin @user`')
        }

        // Check if target is valid
        if (!target) {
            return reply('❌ Invalid user.')
        }        // Check if target is already admin
        if (db.isAdmin(target)) {
            return reply('❌ User is already an admin!')
        }try {
            await react('🕔')
              // Add admin using config manager
            const success = db.addAdmin(target)
              if (success) {
                await react('✅')
                await reply(`✅ Successfully added @${target.split('@')[0]} as bot admin!
                
📋 Current admins: ${db.getAdmins().length}
⚙️ Use .config list adminSettings to see all admins`)
            } else {
                await react('❌')
                await reply('❌ User is already an admin or an owner!')
            }
            
        } catch (error) {
            console.error('Error adding admin:', error)
            await react('❌')
            await reply('❌ Failed to add admin.')
        }
    }
}
