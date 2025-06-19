import font from '../../lib/font.js'

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
            return await reply(`❌ ${font.smallCaps('You need to be an admin to use this command')}!`)
        }
        
        const groupData = db.getGroup(msg.key.remoteJid)
        
        if (args.length === 0) {
            const settingsText = `
┌─「 ${font.bold(font.smallCaps('GROUP SETTINGS'))} 」
│ 
├ 🏷️ ${font.bold(font.smallCaps('Name'))}: ${groupMetadata.subject}
├ 👥 ${font.bold(font.smallCaps('Members'))}: ${participants.length}
├ 📝 ${font.bold(font.smallCaps('Description'))}: ${groupMetadata.desc || font.smallCaps('No description')}
│ 
├ ⚙️ ${font.bold(font.smallCaps('Bot Settings'))}:
├ 👋 ${font.bold(font.smallCaps('Welcome'))}: ${groupData.welcome ? `✅ ${font.smallCaps('ON')}` : `❌ ${font.smallCaps('OFF')}`}
├ 👋 ${font.bold(font.smallCaps('Goodbye'))}: ${groupData.bye ? `✅ ${font.smallCaps('ON')}` : `❌ ${font.smallCaps('OFF')}`}
├ 🔗 ${font.bold(font.smallCaps('Anti-Link'))}: ${groupData.antilink ? `✅ ${font.smallCaps('ON')}` : `❌ ${font.smallCaps('OFF')}`}
├ 🚫 ${font.bold(font.smallCaps('Anti-Spam'))}: ${groupData.antispam ? `✅ ${font.smallCaps('ON')}` : `❌ ${font.smallCaps('OFF')}`}
├ 🔇 ${font.bold(font.smallCaps('Mute'))}: ${groupData.mute ? `✅ ${font.smallCaps('ON')}` : `❌ ${font.smallCaps('OFF')}`}
│ 
└────

📋 ${font.bold(font.smallCaps('Usage'))}:
• .group ${font.smallCaps('welcome')} ${font.smallCaps('on/off')}
• .group ${font.smallCaps('bye')} ${font.smallCaps('on/off')}  
• .group ${font.smallCaps('antilink')} ${font.smallCaps('on/off')}
• .group ${font.smallCaps('antispam')} ${font.smallCaps('on/off')}
• .group ${font.smallCaps('mute')} ${font.smallCaps('on/off')}
            `.trim()
            
            return await reply(settingsText)
        }
        
        const setting = args[0].toLowerCase()
        const value = args[1]?.toLowerCase()
        
        if (!value || (value !== 'on' && value !== 'off')) {
            return await reply(`❌ ${font.smallCaps('Please specify on or off')}!\n${font.smallCaps('Example')}: .group ${font.smallCaps('welcome')} ${font.smallCaps('on')}`)
        }
        
        const isOn = value === 'on'
        
        switch (setting) {
            case 'welcome':
                groupData.welcome = isOn
                db.saveGroups()
                await reply(`✅ ${font.smallCaps('Welcome message')} ${isOn ? font.smallCaps('enabled') : font.smallCaps('disabled')}`)
                break
                
            case 'bye':
            case 'goodbye':
                groupData.bye = isOn
                db.saveGroups()
                await reply(`✅ ${font.smallCaps('Goodbye message')} ${isOn ? font.smallCaps('enabled') : font.smallCaps('disabled')}`)
                break
                
            case 'antilink':
                groupData.antilink = isOn
                db.saveGroups()
                await reply(`✅ ${font.smallCaps('Anti-link')} ${isOn ? font.smallCaps('enabled') : font.smallCaps('disabled')}`)
                break
                
            case 'antispam':
                groupData.antispam = isOn
                db.saveGroups()
                await reply(`✅ ${font.smallCaps('Anti-spam')} ${isOn ? font.smallCaps('enabled') : font.smallCaps('disabled')}`)
                break
                
            case 'mute':
                groupData.mute = isOn
                db.saveGroups()
                await reply(`✅ ${font.smallCaps('Group')} ${isOn ? font.smallCaps('muted') : font.smallCaps('unmuted')}`)
                break
                
            default:
                await reply(`❌ ${font.smallCaps('Invalid setting! Available')}: ${font.smallCaps('welcome, bye, antilink, antispam, mute')}`)
        }
    }
}
