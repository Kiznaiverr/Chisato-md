import font from '../../lib/font.js'

export default {
    command: 'setwelcome',
    aliases: ['welcometext', 'welcomemsg'],
    category: 'admin',
    description: 'Set custom welcome message for the group',
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
            const currentMsg = groupData.welcomeText || font.smallCaps('Default welcome message')
            return reply(`🏠 *${font.smallCaps('Current Welcome Message')}*\n\n${currentMsg}\n\n💡 *${font.smallCaps('Usage')}*: ${font.smallCaps('.setwelcome <your message>')}\n\n📝 *${font.smallCaps('Variables')}*:\n• ${font.smallCaps('@user - Mention the new member')}\n• ${font.smallCaps('@group - Group name')}\n• ${font.smallCaps('@date - Current date')}\n• ${font.smallCaps('@time - Current time')}`)
        }
        
        const welcomeText = args.join(' ')
        
        if (welcomeText.length > 500) {
            return reply(`❌ ${font.smallCaps('Welcome message is too long')}! ${font.smallCaps('Maximum 500 characters')}.`)
        }
          groupData.welcomeText = welcomeText
        db.groups[groupId] = groupData
        db.saveGroups()
        
        await react('✅')
        
        const previewText = welcomeText
            .replace(/@user/g, '@newmember')
            .replace(/@group/g, groupMetadata?.subject || 'This Group')
            .replace(/@date/g, new Date().toLocaleDateString('id-ID'))
            .replace(/@time/g, new Date().toLocaleTimeString('id-ID'))
        
        return reply(`✅ ${font.smallCaps('Welcome message has been set')}!\n\n📋 *${font.smallCaps('Preview')}*:\n${previewText}`)
    }
}
