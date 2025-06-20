import font from '../../lib/font.js'

export default {
    command: 'tagall',
    aliases: ['everyone', 'all'],
    category: 'admin',
    description: 'Tag all group members',
    usage: '[message]',
    groupOnly: true,
    adminOnly: true,
    cooldown: 10,
    
    async execute({ sock, msg, args, reply, react, isGroup, groupMetadata }) {
        if (!isGroup) return reply(`❌ ${font.smallCaps('This command can only be used in groups')}!`)
        
        try {
            await react('🕔')
            
            const message = args.join(' ') || font.smallCaps('Group announcement')
            const participants = groupMetadata.participants
            const mentions = participants.map(p => p.id)
            
            let tagMessage = `📢 ${font.bold(font.smallCaps('GROUP ANNOUNCEMENT'))}\n\n`
            tagMessage += `💬 ${font.bold(font.smallCaps('Message'))}: ${font.smallCaps(message)}\n\n`
            tagMessage += `👥 ${font.bold(font.smallCaps('Tagged Members'))} (${participants.length}):\n`
            
            // Create mention list
            participants.forEach((participant, index) => {
                const number = participant.id.split('@')[0]
                tagMessage += `${index + 1}. @${number}\n`
            })
            
            tagMessage += `\n📅 ${font.smallCaps('Time')}: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`
            
            await sock.sendMessage(msg.key.remoteJid, {
                text: tagMessage,
                mentions: mentions
            })
            
            await react('✅')
            
        } catch (error) {
            console.error('Error in tagall command:', error)
            await react('❌')
            await reply(`❌ ${font.smallCaps('Failed to tag all members')}.`)
        }
    }
}
