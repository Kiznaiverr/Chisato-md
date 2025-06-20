import font from '../../lib/font.js'

export default {
    command: 'antilink',
    aliases: ['antilinkgroup', 'setantilink'],
    category: 'admin',
    description: 'Enable or disable antilink protection',
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
            const status = groupData.antilink ? font.smallCaps('enabled') : font.smallCaps('disabled')
            return reply(`🔗 ${font.smallCaps('Antilink protection is currently')} *${status}*\n\n${font.smallCaps('Usage')}: ${font.smallCaps('.antilink on/off')}\n\n${font.smallCaps('Note')}: ${font.smallCaps('When enabled, group links will be automatically deleted')}`)
        }
        
        const action = args[0].toLowerCase()
        
        if (action === 'on' || action === 'enable' || action === '1') {
            if (groupData.antilink) {
                return reply(`✅ ${font.smallCaps('Antilink protection is already enabled')}!`)
            }
              groupData.antilink = true
            db.groups[groupId] = groupData
            db.saveGroups()
            
            await react('🛡️')
            return reply(`🛡️ ${font.smallCaps('Antilink protection has been')} *${font.smallCaps('enabled')}*!\n\n${font.smallCaps('Group links will now be automatically deleted')}`)
            
        } else if (action === 'off' || action === 'disable' || action === '0') {
            if (!groupData.antilink) {
                return reply(`❌ ${font.smallCaps('Antilink protection is already disabled')}!`)
            }
              groupData.antilink = false
            db.groups[groupId] = groupData
            db.saveGroups()
            
            await react('✅')
            return reply(`❌ ${font.smallCaps('Antilink protection has been')} *${font.smallCaps('disabled')}*!`)
            
        } else {
            return reply(`❌ ${font.smallCaps('Invalid option')}!\n\n${font.smallCaps('Usage')}: ${font.smallCaps('.antilink on/off')}`)
        }
    }
}
