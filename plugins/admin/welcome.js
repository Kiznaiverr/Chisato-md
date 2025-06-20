import font from '../../lib/font.js'

export default {
    command: 'welcome',
    aliases: ['setwelcome'],
    category: 'admin',
    description: 'Enable or disable welcome message',
    usage: '<on/off>',
    groupOnly: true,
    adminOnly: true,
    botAdmin: true,
    cooldown: 3,
    
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
            antisticker: false,
            mute: false,
            banned: false,
            created: Date.now()
        }
          if (!args[0]) {
            const status = groupData.welcome ? font.smallCaps('enabled') : font.smallCaps('disabled')
            return reply(`🏠 ${font.smallCaps('Welcome message is currently')} *${status}*\n\n${font.smallCaps('Usage')}: ${font.smallCaps('.welcome on/off')}`)
        }
        
        const action = args[0].toLowerCase()
        
        if (action === 'on' || action === 'enable' || action === '1') {
            if (groupData.welcome) {
                return reply(`✅ ${font.smallCaps('Welcome message is already enabled')}!`)
            }
              groupData.welcome = true
            db.groups[groupId] = groupData
            db.saveGroups()
            
            await react('✅')
            return reply(`✅ ${font.smallCaps('Welcome message has been')} *${font.smallCaps('enabled')}*!`)
            
        } else if (action === 'off' || action === 'disable' || action === '0') {
            if (!groupData.welcome) {
                return reply(`❌ ${font.smallCaps('Welcome message is already disabled')}!`)
            }
              groupData.welcome = false
            db.groups[groupId] = groupData
            db.saveGroups()
            
            await react('✅')
            return reply(`❌ ${font.smallCaps('Welcome message has been')} *${font.smallCaps('disabled')}*!`)
            
        } else {
            return reply(`❌ ${font.smallCaps('Invalid option')}!\n\n${font.smallCaps('Usage')}: ${font.smallCaps('.welcome on/off')}`)
        }
    }
}
