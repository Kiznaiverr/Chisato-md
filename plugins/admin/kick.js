import font from '../../lib/font.js'

export default {
    command: 'kick',
    aliases: ['remove'],
    category: 'admin',
    description: 'Kick a member',
    usage: '@user',
    groupOnly: true,
    adminOnly: true,
    botAdmin: true,
    cooldown: 5,
    
    async execute({ sock, msg, args, reply, react, isGroup, groupMetadata }) {
        if (!isGroup) return reply(`❌ ${font.smallCaps('This command can only be used in groups')}.`)
        
        let target
        if (msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            target = msg.message.extendedTextMessage.contextInfo.mentionedJid[0]
        } else if (msg.message.extendedTextMessage?.contextInfo?.quotedMessage) {
            target = msg.message.extendedTextMessage.contextInfo.participant
        } else if (args[0] && args[0].includes('@')) {
            target = args[0].replace('@', '') + '@s.whatsapp.net'
        } else {
            return reply(`❌ ${font.smallCaps('Please mention a user or reply to their message')}.\n\n${font.smallCaps('Example')}: \`kick @user\``)
        }

        if (!target) {
            return reply(`❌ ${font.smallCaps('Invalid user')}.`)
        }

        if (target === sock.user.id) {
            return reply(`❌ ${font.smallCaps('I cannot kick myself')}!`)
        }

        const groupAdmins = groupMetadata.participants.filter(p => p.admin).map(p => p.id)
        if (groupAdmins.includes(target)) {
            return reply(`❌ ${font.smallCaps('Cannot kick an admin')}!`)
        }

        try {
            await react('🕔')
            
            await sock.groupParticipantsUpdate(msg.key.remoteJid, [target], 'remove')
            
            await react('✅')
            await reply(`✅ ${font.smallCaps('Successfully kicked')} @${target.split('@')[0]} ${font.smallCaps('from the group')}!`)
            
        } catch (error) {
            console.error('Error kicking user:', error)
            await react('❌')
            await reply(`❌ ${font.smallCaps('Failed to kick user. Make sure I have admin privileges')}.`)
        }
    }
}
