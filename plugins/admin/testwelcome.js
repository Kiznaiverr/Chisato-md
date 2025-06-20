import font from '../../lib/font.js'
import config from '../../lib/config.js'

export default {
    command: 'testwelcome',
    aliases: ['testwel', 'welcometest'],
    category: 'admin',
    description: 'Test the welcome message',
    usage: '',
    groupOnly: true,
    adminOnly: true,
    cooldown: 5,
    
    async execute({ sock, msg, args, reply, react, isGroup, db, sender, groupMetadata }) {
        if (!isGroup) return reply(`❌ ${font.smallCaps('This command can only be used in groups')}!`)
        
        const groupId = msg.key.remoteJid
        const groupData = db.getGroup(groupId)
        
        if (!groupData.welcome) {
            return reply(`❌ ${font.smallCaps('Welcome message is disabled')}!\n\n${font.smallCaps('Enable it first with')}: ${font.smallCaps('.welcome on')}`)
        }
        
        await react('🧪')
        
        let welcomeMsg = groupData.welcomeText || config?.get('replyMessages', 'welcome') || font.smallCaps('👋 Welcome to the group, @user!')
        
        // Replace variables for test
        welcomeMsg = welcomeMsg
            .replace(/@user/g, `@${sender.split('@')[0]}`)
            .replace(/@{user}/g, sender.split('@')[0])
            .replace(/@group/g, groupData.name || groupMetadata?.subject || font.smallCaps('This Group'))
            .replace(/@date/g, new Date().toLocaleDateString('id-ID'))
            .replace(/@time/g, new Date().toLocaleTimeString('id-ID'))
        
        await sock.sendMessage(msg.key.remoteJid, {
            text: `🧪 *${font.smallCaps('Welcome Message Test')}*\n\n${welcomeMsg}\n\n📝 ${font.smallCaps('This is how the welcome message will look')}`,
            mentions: [sender]
        })
    }
}
