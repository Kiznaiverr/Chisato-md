import font from '../../lib/font.js'

export default {
    command: 'demote',
    aliases: ['unadmin'],
    category: 'admin',
    description: 'Demote an admin',
    usage: '@user',
    groupOnly: true,
    adminOnly: true,
    botAdmin: true,
    cooldown: 5,
    
    async execute({ sock, msg, args, reply, react, isGroup, groupMetadata }) {
        if (!isGroup) return reply(`❌ ${font.smallCaps('This command can only be used in groups')}.`)
        
        // Check if user mentioned someone or replied to a message
        let target
        if (msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            target = msg.message.extendedTextMessage.contextInfo.mentionedJid[0]
        } else if (msg.message.extendedTextMessage?.contextInfo?.quotedMessage) {
            target = msg.message.extendedTextMessage.contextInfo.participant
        } else if (args[0] && args[0].includes('@')) {
            target = args[0].replace('@', '') + '@s.whatsapp.net'
        } else {
            return reply(`❌ ${font.smallCaps('Please mention a user or reply to their message')}.\n\n${font.smallCaps('Example')}: \`demote @user\``)
        }

        // Check if target is valid
        if (!target) {
            return reply(`❌ ${font.smallCaps('Invalid user')}.`)
        }

        // Check if target is the bot itself
        if (target === sock.user.id) {
            return reply(`❌ ${font.smallCaps('I cannot demote myself')}!`)
        }

        // Check if target is an admin
        const groupAdmins = groupMetadata.participants.filter(p => p.admin).map(p => p.id)
        if (!groupAdmins.includes(target)) {
            return reply(`❌ ${font.smallCaps('User is not an admin')}!`)
        }

        try {
            await react('🕔')
            
            // Demote the user
            await sock.groupParticipantsUpdate(msg.key.remoteJid, [target], 'demote')
            
            await react('✅')
            await reply(`✅ ${font.smallCaps('Successfully demoted')} @${target.split('@')[0]} ${font.smallCaps('to member')}!`)
            
        } catch (error) {
            console.error('Error demoting user:', error)
            await react('❌')
            await reply(`❌ ${font.smallCaps('Failed to demote user. Make sure I have admin privileges')}.`)
        }
    }
}
