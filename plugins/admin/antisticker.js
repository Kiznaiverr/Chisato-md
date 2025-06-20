import font from '../../lib/font.js'

export default {
    command: 'antisticker',
    aliases: ['setantisticker', 'stickerprotection'],
    category: 'admin',
    description: 'Enable or disable antisticker protection',
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
            created: Date.now(),
            welcomeText: '',
            byeText: '',
            whitelist: []
        }
        
        if (!args[0]) {
            const status = groupData.antisticker ? font.smallCaps('enabled') : font.smallCaps('disabled')
            return reply(`🚫 ${font.smallCaps('Antisticker protection is currently')} *${status}*\n\n${font.smallCaps('Usage')}: ${font.smallCaps('.antisticker on/off')}\n\n${font.smallCaps('Note')}: ${font.smallCaps('When enabled, stickers will be automatically deleted')}`)
        }
        
        const action = args[0].toLowerCase()
        
        if (action === 'on' || action === 'enable' || action === '1') {
            if (groupData.antisticker) {
                return reply(`✅ ${font.smallCaps('Antisticker protection is already enabled')}!`)
            }
            
            groupData.antisticker = true
            db.groups[groupId] = groupData
            db.saveGroups()
            
            await react('🛡️')
            return reply(`🛡️ ${font.smallCaps('Antisticker protection has been')} *${font.smallCaps('enabled')}*!\n\n${font.smallCaps('Stickers will now be automatically deleted')}`)
            
        } else if (action === 'off' || action === 'disable' || action === '0') {
            if (!groupData.antisticker) {
                return reply(`❌ ${font.smallCaps('Antisticker protection is already disabled')}!`)
            }
            
            groupData.antisticker = false
            db.groups[groupId] = groupData
            db.saveGroups()
            
            await react('✅')
            return reply(`❌ ${font.smallCaps('Antisticker protection has been')} *${font.smallCaps('disabled')}*!`)
            
        } else {
            return reply(`❌ ${font.smallCaps('Invalid option')}!\n\n${font.smallCaps('Usage')}: ${font.smallCaps('.antisticker on/off')}`)
        }
    }
}
