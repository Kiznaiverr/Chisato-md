import font from '../../lib/font.js'

export default {
    command: 'setdesc',
    aliases: ['changedesc', 'groupdesc'],
    category: 'admin',
    description: 'Change group description',
    usage: '<new description>',
    groupOnly: true,
    adminOnly: true,
    botAdmin: true,
    cooldown: 5,
    
    async execute({ sock, msg, args, reply, react, isGroup, groupMetadata }) {
        if (!isGroup) return reply(`❌ ${font.smallCaps('This command can only be used in groups')}!`)
        
        if (!args[0]) {
            return reply(`❌ ${font.smallCaps('Please provide a new group description')}!\n\n${font.smallCaps('Example')}: .setdesc ${font.smallCaps('Welcome to our amazing group')}!`)
        }
        
        try {
            await react('🕔')
            
            const newDesc = args.join(' ')
            const oldDesc = groupMetadata.desc || font.smallCaps('No description')
            
            // Change group description
            await sock.groupUpdateDescription(msg.key.remoteJid, newDesc)
            
            await react('✅')
            await reply(`✅ ${font.smallCaps('Group description changed successfully')}!

╭─「 📄 ${font.smallCaps('Description Change')} 」
├ 📝 ${font.smallCaps('Old Description')}: ${font.smallCaps(oldDesc)}
├ 🆕 ${font.smallCaps('New Description')}: ${font.smallCaps(newDesc)}
├ 👮 ${font.smallCaps('Changed by')}: ${font.smallCaps('Admin')}
├ 🕒 ${font.smallCaps('Time')}: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}
╰───────────────`)
            
        } catch (error) {
            console.error('Error changing group description:', error)
            await react('❌')
            await reply(`❌ ${font.smallCaps('Failed to change group description. Make sure I have admin privileges')}.`)
        }
    }
}
