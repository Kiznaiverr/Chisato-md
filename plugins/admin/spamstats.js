import font from '../../lib/font.js'

export default {
    command: 'spamstats',
    aliases: ['spaminfo', 'checkspam'],
    category: 'admin',
    description: 'View spam statistics for the group',
    usage: '',
    groupOnly: true,
    adminOnly: true,
    cooldown: 3,
    
    async execute({ sock, msg, args, reply, react, isGroup, db, sender, groupMetadata }) {
        if (!isGroup) return reply(`❌ ${font.smallCaps('This command can only be used in groups')}!`)
        
        const groupId = msg.key.remoteJid
        const groupData = db.getGroup(groupId)
        
        await react('📊')
        
        let statsText = `📊 *${font.smallCaps('Protection Statistics')}*\n\n`
        statsText += `🛡️ ${font.smallCaps('Antispam Status')}: ${groupData.antispam ? `✅ ${font.smallCaps('Enabled')}` : `❌ ${font.smallCaps('Disabled')}`}\n`
        statsText += `🔗 ${font.smallCaps('Antilink Status')}: ${groupData.antilink ? `✅ ${font.smallCaps('Enabled')}` : `❌ ${font.smallCaps('Disabled')}`}\n`
        statsText += `🚫 ${font.smallCaps('Antisticker Status')}: ${groupData.antisticker ? `✅ ${font.smallCaps('Enabled')}` : `❌ ${font.smallCaps('Disabled')}`}\n`
        statsText += `📝 ${font.smallCaps('Whitelisted Users')}: ${groupData.whitelist ? groupData.whitelist.length : 0}\n\n`
          // Check current spam tracking (simplified)
        let activeTracking = 0
        // Note: In a real implementation, this would check the handler's spamTracker
          statsText += `📈 *${font.smallCaps('Current Activity')}*\n`
        statsText += `• ${font.smallCaps('Active tracking')}: ${font.smallCaps('Dynamic')}\n`
        statsText += `• ${font.smallCaps('Group members')}: ${groupMetadata?.participants?.length || 0}\n\n`
          statsText += `⚙️ *${font.smallCaps('Protection Settings')}*\n`
        statsText += `• ${font.smallCaps('Spam threshold')}: ${font.smallCaps('5 messages per minute')}\n`
        statsText += `• ${font.smallCaps('Link detection')}: ${font.smallCaps('WhatsApp/Telegram links')}\n`
        statsText += `• ${font.smallCaps('Sticker detection')}: ${font.smallCaps('All sticker types')}\n`
        statsText += `• ${font.smallCaps('Admin immunity')}: ✅ ${font.smallCaps('Enabled')}\n`
        statsText += `• ${font.smallCaps('Whitelist immunity')}: ✅ ${font.smallCaps('Enabled')}`
        
        return reply(statsText)
    }
}
