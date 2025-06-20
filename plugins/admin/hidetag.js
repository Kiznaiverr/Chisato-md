import font from '../../lib/font.js'

export default {
    command: 'hidetag',
    aliases: ['ht', 'htag'],
    category: 'admin',
    description: 'Send hidden tag message',
    usage: '<message>',
    groupOnly: true,
    adminOnly: true,
    cooldown: 5,
    
    async execute({ sock, msg, args, reply, react, isGroup, groupMetadata }) {
        if (!isGroup) return reply(`❌ ${font.smallCaps('This command can only be used in groups')}!`)
        
        if (!args[0]) {
            return reply(`❌ ${font.smallCaps('Please provide a message')}!\n\n${font.smallCaps('Example')}: .hidetag ${font.smallCaps('Hello everyone')}!`)
        }
        
        try {
            await react('🕔')
            
            const message = args.join(' ')
            const participants = groupMetadata.participants
            const mentions = participants.map(p => p.id)
            
            await sock.sendMessage(msg.key.remoteJid, {
                text: message,
                mentions: mentions
            })
            
            await react('✅')
            
        } catch (error) {
            console.error('Error in hidetag command:', error)
            await react('❌')
            await reply(`❌ ${font.smallCaps('Failed to send hidden tag message')}.`)
        }
    }
}
