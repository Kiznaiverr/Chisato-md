import config from '../../lib/config.js'
import font from '../../lib/font.js'

export default {
    command: 'deladmin',
    aliases: ['removeadmin'],
    category: 'owner',
    description: 'Remove bot admin',
    usage: '@user',
    ownerOnly: true,
    cooldown: 5,
    
    async execute({ msg, args, reply, react, db }) {
        let target
        if (msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            target = msg.message.extendedTextMessage.contextInfo.mentionedJid[0]
        } else if (msg.message.extendedTextMessage?.contextInfo?.quotedMessage) {
            target = msg.message.extendedTextMessage.contextInfo.participant
        } else if (args[0] && args[0].includes('@')) {
            target = args[0].replace('@', '') + '@s.whatsapp.net'
        } else {
            return reply(`❌ ${font.smallCaps('Please mention a user or reply to their message')}.\n\n${font.smallCaps('Example')}: \`deladmin @user\``)
        }

        if (!target) {
            return reply(`❌ ${font.smallCaps('Invalid user')}.`)
        }        
        if (db.isOwner(target)) {
            return reply(`❌ ${font.smallCaps('Cannot remove owner from admin')}!`)
        }

        if (!db.isAdmin(target)) {
            return reply(`❌ ${font.smallCaps('User is not an admin')}!`)
        }

        try {
            await react('🕔')
            const success = db.removeAdmin(target)
            
            if (success) {
                await react('✅')
                await reply(`✅ ${font.smallCaps('Successfully removed')} @${target.split('@')[0]} ${font.smallCaps('from bot admin')}!
                
📋 ${font.smallCaps('Remaining admins')}: ${config.getAdmins().length}
⚙️ ${font.smallCaps('Use .config list adminSettings to see all admins')}`)
            } else {
                await react('❌')
                await reply(`❌ ${font.smallCaps('Cannot remove owner or user is not an admin')}!`)
            }
            
        } catch (error) {
            console.error('Error removing admin:', error)
            await react('❌')
            await reply(`❌ ${font.smallCaps('Failed to remove admin')}.`)
        }
    }
}
