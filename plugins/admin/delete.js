import font from '../../lib/font.js'

export default {
    command: 'delete',
    aliases: ['del', 'd'],
    category: 'admin',
    description: 'Delete a message',
    usage: '',
    groupOnly: true,
    adminOnly: true,
    cooldown: 3,
    
    async execute({ sock, msg, reply, react, isGroup }) {
        if (!isGroup) return reply(`❌ ${font.smallCaps('This command can only be used in groups')}!`)
        
        // Check if replying to a message
        const quotedMessage = msg.message.extendedTextMessage?.contextInfo?.quotedMessage
        
        if (!quotedMessage) {
            return reply(`❌ ${font.smallCaps('Please reply to a message you want to delete')}!\n\n💡 ${font.smallCaps('Usage')}:\n${font.smallCaps('Reply to any message and type')} .delete`)
        }
        
        try {
            await react('🕔')
            
            // Get the message key from quoted message
            const messageKey = {
                remoteJid: msg.key.remoteJid,
                fromMe: false,
                id: msg.message.extendedTextMessage.contextInfo.stanzaId,
                participant: msg.message.extendedTextMessage.contextInfo.participant
            }
            
            // Delete the message
            await sock.sendMessage(msg.key.remoteJid, {
                delete: messageKey
            })
            
            await react('✅')
            
            // Send confirmation message that will auto-delete
            const confirmMsg = await sock.sendMessage(msg.key.remoteJid, {
                text: `🗑️ ${font.smallCaps('Message deleted by admin')}.`
            })
            
            // Auto-delete confirmation after 3 seconds
            setTimeout(async () => {
                try {
                    await sock.sendMessage(msg.key.remoteJid, {
                        delete: confirmMsg.key
                    })
                } catch (err) {
                    console.log('Could not delete confirmation message')
                }
            }, 3000)
            
        } catch (error) {
            console.error('Error deleting message:', error)
            await react('❌')
            await reply(`❌ ${font.smallCaps('Failed to delete message. The message might be too old or I don\'t have permission')}.`)
        }
    }
}
