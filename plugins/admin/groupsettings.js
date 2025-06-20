import font from '../../lib/font.js'

export default {
    command: 'groupsettings',
    aliases: ['groupset', 'gsettings', 'groupconfig'],
    category: 'admin',
    description: 'View or manage all group settings',
    usage: '',
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
            created: Date.now()
        }
        
        await react('⚙️')
          const getStatus = (value) => value ? `✅ ${font.smallCaps('Enabled')}` : `❌ ${font.smallCaps('Disabled')}`
        const groupName = groupData.name || groupMetadata?.subject || font.smallCaps('Unknown Group')
          const settingsText = `⚙️ *${font.smallCaps('Group Settings')}*
        
📊 *${font.smallCaps('Group Info')}*
• ${font.smallCaps('Name')}: ${groupName}
• ${font.smallCaps('ID')}: ${groupId.split('@')[0]}
• ${font.smallCaps('Members')}: ${groupMetadata?.participants?.length || 0}
• ${font.smallCaps('Created')}: ${new Date(groupData.created).toLocaleDateString()}

🎛️ *${font.smallCaps('Features')}*
• 🏠 ${font.smallCaps('Welcome')}: ${getStatus(groupData.welcome)}
• 👋 ${font.smallCaps('Goodbye')}: ${getStatus(groupData.bye)}
• 🔗 ${font.smallCaps('Antilink')}: ${getStatus(groupData.antilink)}
• 🚫 ${font.smallCaps('Antispam')}: ${getStatus(groupData.antispam)}
• � ${font.smallCaps('Antisticker')}: ${getStatus(groupData.antisticker)}
• �🔇 ${font.smallCaps('Muted')}: ${getStatus(groupData.mute)}
• 📝 ${font.smallCaps('Whitelisted Users')}: ${groupData.whitelist ? groupData.whitelist.length : 0}

� *${font.smallCaps('Custom Messages')}*
• ${font.smallCaps('Welcome Text')}: ${groupData.welcomeText ? `✅ ${font.smallCaps('Set')}` : `❌ ${font.smallCaps('Default')}`}
• ${font.smallCaps('Goodbye Text')}: ${groupData.byeText ? `✅ ${font.smallCaps('Set')}` : `❌ ${font.smallCaps('Default')}`}

�💡 *${font.smallCaps('Available Commands')}*
• ${font.smallCaps('.welcome on/off ')}
• ${font.smallCaps('.bye on/off ')}  
• ${font.smallCaps('.antilink on/off ')}
• ${font.smallCaps('.antispam on/off ')}
• ${font.smallCaps('.antisticker on/off ')}
• ${font.smallCaps('.setwelcome <text> ')}
• ${font.smallCaps('.setbye <text> ')}
• ${font.smallCaps('.whitelist add/remove @user')}
• ${font.smallCaps('.spamstats - View spam stats')}
• ${font.smallCaps('.mute - Mute/unmute')}`
        
        return reply(settingsText)
    }
}
