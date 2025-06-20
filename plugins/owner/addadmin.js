import config from '../../lib/config.js'
import font from '../../lib/font.js'

export default {
    command: 'addadmin',
    aliases: ['setadmin'],
    category: 'owner',
    description: 'Add bot admin',
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
            return reply(`❌ ${font.smallCaps('Please mention a user or reply to their message')}.\n\n${font.smallCaps('Example')}: \`addadmin @user\``)
        }

        if (!target) {
            return reply(`❌ ${font.smallCaps('Invalid user')}.`)
        }        
        if (db.isAdmin(target)) {
            return reply(`❌ ${font.smallCaps('User is already an admin')}!`)
        }try {
            await react('🕔')
            const success = db.addAdmin(target)
              if (success) {
                await react('✅')
                await reply(`✅ ${font.smallCaps('Successfully added')} @${target.split('@')[0]} ${font.smallCaps('as bot admin')}!
                
📋 ${font.smallCaps('Current admins')}: ${db.getAdmins().length}
⚙️ ${font.smallCaps('Use .config list adminSettings to see all admins')}`)
            } else {
                await react('❌')
                await reply(`❌ ${font.smallCaps('User is already an admin or an owner')}!`)
            }
            
        } catch (error) {
            console.error('Error adding admin:', error)
            await react('❌')
            await reply(`❌ ${font.smallCaps('Failed to add admin')}.`)
        }
    }
}
