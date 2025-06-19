export default {
    command: 'group',
    aliases: ['grup'],
    description: 'Group management settings',
    category: 'group',
    usage: '<setting> <on/off>',
    groupOnly: true,
    cooldown: 5,
    async execute(context) {
        const { reply, args, sock, msg, sender, db } = context
        
        // Get group metadata
        const groupMetadata = await sock.groupMetadata(msg.key.remoteJid)
        const participants = groupMetadata.participants
        
        // Check if sender is admin
        const senderAdmin = participants.find(p => p.id === sender)?.admin
        if (!senderAdmin && !db.isOwner(sender)) {
            return await reply('❌ You need to be an admin to use this command!')
        }
        
        const groupData = db.getGroup(msg.key.remoteJid)
        
        if (args.length === 0) {
            const settingsText = `
┌─「 *GROUP SETTINGS* 」
│ 
├ 🏷️ *Name:* ${groupMetadata.subject}
├ 👥 *Members:* ${participants.length}
├ 📝 *Description:* ${groupMetadata.desc || 'No description'}
│ 
├ ⚙️ *Bot Settings:*
├ 👋 *Welcome:* ${groupData.welcome ? '✅ ON' : '❌ OFF'}
├ 👋 *Goodbye:* ${groupData.bye ? '✅ ON' : '❌ OFF'}
├ 🔗 *Anti-Link:* ${groupData.antilink ? '✅ ON' : '❌ OFF'}
├ 🚫 *Anti-Spam:* ${groupData.antispam ? '✅ ON' : '❌ OFF'}
├ 🔇 *Mute:* ${groupData.mute ? '✅ ON' : '❌ OFF'}
│ 
└────

📋 *Usage:*
• .group welcome on/off
• .group bye on/off  
• .group antilink on/off
• .group antispam on/off
• .group mute on/off
            `.trim()
            
            return await reply(settingsText)
        }
        
        const setting = args[0].toLowerCase()
        const value = args[1]?.toLowerCase()
        
        if (!value || (value !== 'on' && value !== 'off')) {
            return await reply('❌ Please specify on or off!\nExample: .group welcome on')
        }
        
        const isOn = value === 'on'
        
        switch (setting) {
            case 'welcome':
                groupData.welcome = isOn
                db.saveGroups()
                await reply(`✅ Welcome message ${isOn ? 'enabled' : 'disabled'}`)
                break
                
            case 'bye':
            case 'goodbye':
                groupData.bye = isOn
                db.saveGroups()
                await reply(`✅ Goodbye message ${isOn ? 'enabled' : 'disabled'}`)
                break
                
            case 'antilink':
                groupData.antilink = isOn
                db.saveGroups()
                await reply(`✅ Anti-link ${isOn ? 'enabled' : 'disabled'}`)
                break
                
            case 'antispam':
                groupData.antispam = isOn
                db.saveGroups()
                await reply(`✅ Anti-spam ${isOn ? 'enabled' : 'disabled'}`)
                break
                
            case 'mute':
                groupData.mute = isOn
                db.saveGroups()
                await reply(`✅ Group ${isOn ? 'muted' : 'unmuted'}`)
                break
                
            default:
                await reply('❌ Invalid setting! Available: welcome, bye, antilink, antispam, mute')
        }
    }
}
