import font from '../../lib/font.js'

export default {
    command: 'antispam',
    aliases: ['setantispam', 'spamprotection'],
    category: 'admin',
    description: 'Enable or disable antispam protection',
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
            const status = groupData.antispam ? font.smallCaps('enabled') : font.smallCaps('disabled')
            return reply(`🚫 ${font.smallCaps('Antispam protection is currently')} *${status}*\n\n${font.smallCaps('Usage')}: ${font.smallCaps('.antispam on/off')}\n\n${font.smallCaps('Note')}: ${font.smallCaps('When enabled, spam messages will be detected and users may be warned or kicked')}`)
        }
        
        const action = args[0].toLowerCase()
        
        if (action === 'on' || action === 'enable' || action === '1') {
            if (groupData.antispam) {
                return reply(`✅ ${font.smallCaps('Antispam protection is already enabled')}!`)
            }
              groupData.antispam = true
            db.groups[groupId] = groupData
            db.saveGroups()
            
            await react('🛡️')
            return reply(`🛡️ ${font.smallCaps('Antispam protection has been')} *${font.smallCaps('enabled')}*!\n\n${font.smallCaps('Spam messages will now be monitored and action will be taken against spammers')}`)
            
        } else if (action === 'off' || action === 'disable' || action === '0') {
            if (!groupData.antispam) {
                return reply(`❌ ${font.smallCaps('Antispam protection is already disabled')}!`)
            }
              groupData.antispam = false
            db.groups[groupId] = groupData
            db.saveGroups()
            
            await react('✅')
            return reply(`❌ ${font.smallCaps('Antispam protection has been')} *${font.smallCaps('disabled')}*!`)
            
        } else {
            return reply(`❌ ${font.smallCaps('Invalid option')}!\n\n${font.smallCaps('Usage')}: ${font.smallCaps('.antispam on/off')}`)
        }
    }
}
