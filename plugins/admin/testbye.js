import font from '../../lib/font.js'
import config from '../../lib/config.js'

export default {
    command: 'testbye',
    aliases: ['testgoodbye', 'byetest'],
    category: 'admin',
    description: 'Test the goodbye message',
    usage: '',
    groupOnly: true,
    adminOnly: true,
    cooldown: 5,
    
    async execute({ sock, msg, args, reply, react, isGroup, db, sender, groupMetadata }) {
        if (!isGroup) return reply(`❌ ${font.smallCaps('This command can only be used in groups')}!`)
        
        const groupId = msg.key.remoteJid
        const groupData = db.getGroup(groupId)
        
        if (!groupData.bye) {
            return reply(`❌ ${font.smallCaps('Goodbye message is disabled')}!\n\n${font.smallCaps('Enable it first with')}: ${font.smallCaps('.bye on')}`)
        }
        
        await react('🧪')
        
        let byeMsg = groupData.byeText || config?.get('replyMessages', 'goodbye') || font.smallCaps('👋 Goodbye @user! Thanks for being part of our group!')
        
        // Replace variables for test
        byeMsg = byeMsg
            .replace(/@user/g, `@${sender.split('@')[0]}`)
            .replace(/@{user}/g, sender.split('@')[0])
            .replace(/@group/g, groupData.name || groupMetadata?.subject || font.smallCaps('This Group'))
            .replace(/@date/g, new Date().toLocaleDateString('id-ID'))
            .replace(/@time/g, new Date().toLocaleTimeString('id-ID'))
        
        await sock.sendMessage(msg.key.remoteJid, {
            text: `🧪 *${font.smallCaps('Goodbye Message Test')}*\n\n${byeMsg}\n\n📝 ${font.smallCaps('This is how the goodbye message will look')}`,
            mentions: [sender]
        })
    }
}
