import font from '../../lib/font.js'

export default {
    command: 'setbye',
    aliases: ['byetext', 'byemsg', 'setgoodbye'],
    category: 'admin',
    description: 'Set custom goodbye message for the group',
    usage: '<text>',
    groupOnly: true,
    adminOnly: true,
    cooldown: 5,
    
    async execute({ sock, msg, args, reply, react, isGroup, db, sender, groupMetadata }) {
        if (!isGroup) return reply(`❌ ${font.smallCaps('This command can only be used in groups')}!`)
        
        const groupId = msg.key.remoteJid
        let groupData = db.groups[groupId] || {
            jid: groupId,
            name: groupMetadata?.subject || '',
            welcome: false,
            bye: false,
            antilink: false,
            antispam: false,
            mute: false,
            banned: false,
            created: Date.now(),
            welcomeText: '',
            byeText: ''
        }
          if (!args.length) {
            const currentMsg = groupData.byeText || font.smallCaps('Default goodbye message')
            return reply(`👋 *${font.smallCaps('Current Goodbye Message')}*\n\n${currentMsg}\n\n💡 *${font.smallCaps('Usage')}*: ${font.smallCaps('.setbye <your message>')}\n\n📝 *${font.smallCaps('Variables')}*:\n• ${font.smallCaps('@user - Mention the leaving member')}\n• ${font.smallCaps('@group - Group name')}\n• ${font.smallCaps('@date - Current date')}\n• ${font.smallCaps('@time - Current time')}`)
        }
        
        const byeText = args.join(' ')
        
        if (byeText.length > 500) {
            return reply(`❌ ${font.smallCaps('Goodbye message is too long')}! ${font.smallCaps('Maximum 500 characters')}.`)
        }
          groupData.byeText = byeText
        db.groups[groupId] = groupData
        db.saveGroups()
        
        await react('✅')
        
        const previewText = byeText
            .replace(/@user/g, '@leavingmember')
            .replace(/@group/g, groupMetadata?.subject || 'This Group')
            .replace(/@date/g, new Date().toLocaleDateString('id-ID'))
            .replace(/@time/g, new Date().toLocaleTimeString('id-ID'))
        
        return reply(`✅ ${font.smallCaps('Goodbye message has been set')}!\n\n📋 *${font.smallCaps('Preview')}*:\n${previewText}`)
    }
}
