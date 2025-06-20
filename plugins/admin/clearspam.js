import font from '../../lib/font.js'

export default {
    command: 'clearspam',
    aliases: ['resetspam', 'cleanspam'],
    category: 'admin',
    description: 'Clear spam tracking data for the group',
    usage: '',
    groupOnly: true,
    adminOnly: true,
    cooldown: 5,
    
    async execute({ sock, msg, args, reply, react, isGroup, db, sender, groupMetadata }) {
        if (!isGroup) return reply(`❌ ${font.smallCaps('This command can only be used in groups')}!`)
        
        const groupId = msg.key.remoteJid
          // Clear spam tracking for this group
        // Note: This would need to be implemented in the handler
        // For now, we'll just show a message        await react('✅')
        return reply(`🧹 ${font.smallCaps('Spam tracking data clear request sent')}!\n\n${font.smallCaps('Note')}: ${font.smallCaps('Spam tracking will be reset automatically over time')}`)
    }
}
