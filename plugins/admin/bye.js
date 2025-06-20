import font from '../../lib/font.js'

export default {
    command: 'bye',
    aliases: ['setbye', 'goodbye'],
    category: 'admin',
    description: 'Enable or disable goodbye message',
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
            mute: false,
            banned: false,
            created: Date.now()
        }
          if (!args[0]) {
            const status = groupData.bye ? font.smallCaps('enabled') : font.smallCaps('disabled')
            return reply(`👋 ${font.smallCaps('Goodbye message is currently')} *${status}*\n\n${font.smallCaps('Usage')}: ${font.smallCaps('.bye on/off')}`)
        }
        
        const action = args[0].toLowerCase()
        
        if (action === 'on' || action === 'enable' || action === '1') {
            if (groupData.bye) {
                return reply(`✅ ${font.smallCaps('Goodbye message is already enabled')}!`)
            }
              groupData.bye = true
            db.groups[groupId] = groupData
            db.saveGroups()
            
            await react('✅')
            return reply(`✅ ${font.smallCaps('Goodbye message has been')} *${font.smallCaps('enabled')}*!`)
            
        } else if (action === 'off' || action === 'disable' || action === '0') {
            if (!groupData.bye) {
                return reply(`❌ ${font.smallCaps('Goodbye message is already disabled')}!`)
            }
              groupData.bye = false
            db.groups[groupId] = groupData
            db.saveGroups()
            
            await react('✅')
            return reply(`❌ ${font.smallCaps('Goodbye message has been')} *${font.smallCaps('disabled')}*!`)
            
        } else {
            return reply(`❌ ${font.smallCaps('Invalid option')}!\n\n${font.smallCaps('Usage')}: ${font.smallCaps('.bye on/off')}`)
        }
    }
}
