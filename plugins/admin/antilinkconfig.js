import font from '../../lib/font.js'

export default {
    command: 'antilinkconfig',
    aliases: ['linkconfig', 'alconfig'],
    category: 'admin',
    description: 'Configure antilink protection settings',
    usage: '<kick/warn/delete> [on/off]',
    groupOnly: true,
    adminOnly: true,
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
            created: Date.now(),
            welcomeText: '',
            byeText: '',
            whitelist: [],
            antilinkAction: 'delete' // delete, warn, kick
        }
          if (!args[0]) {
            const action = groupData.antilinkAction || font.smallCaps('delete')
            return reply(`🔗 *${font.smallCaps('Antilink Configuration')}*\n\n${font.smallCaps('Current action')}: *${action}*\n\n💡 *${font.smallCaps('Available Actions')}*:\n• ${font.smallCaps('delete - Only delete the link message')}\n• ${font.smallCaps('warn - Delete message and warn user')}\n• ${font.smallCaps('kick - Delete message and kick user')}\n\n${font.smallCaps('Usage')}: ${font.smallCaps('.antilinkconfig <action>')}`)
        }
        
        const action = args[0].toLowerCase()
          if (!['delete', 'warn', 'kick'].includes(action)) {
            return reply(`❌ ${font.smallCaps('Invalid action')}!\n\n${font.smallCaps('Available actions')}: ${font.smallCaps('delete, warn, kick')}`)
        }
          groupData.antilinkAction = action
        db.groups[groupId] = groupData
        db.saveGroups()
        
        await react('✅')
          let actionDesc = ''
        switch (action) {
            case 'delete':
                actionDesc = font.smallCaps('Link messages will be deleted silently')
                break
            case 'warn':
                actionDesc = font.smallCaps('Link messages will be deleted and users will be warned')
                break
            case 'kick':
                actionDesc = font.smallCaps('Link messages will be deleted and users will be kicked')
                break
        }
        
        return reply(`✅ ${font.smallCaps('Antilink action set to')} *${font.smallCaps(action)}*!\n\n${actionDesc}`)
    }
}
