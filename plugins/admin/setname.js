import font from '../../lib/font.js'

export default {
    command: 'setname',
    aliases: ['changename', 'groupname'],
    category: 'admin',
    description: 'Change group name',
    usage: '<new name>',
    groupOnly: true,
    adminOnly: true,
    botAdmin: true,
    cooldown: 5,
    
    async execute({ sock, msg, args, reply, react, isGroup, groupMetadata }) {
        if (!isGroup) return reply(`❌ ${font.smallCaps('This command can only be used in groups')}!`)
        
        if (!args[0]) {
            return reply(`❌ ${font.smallCaps('Please provide a new group name')}!\n\n${font.smallCaps('Example')}: .setname ${font.smallCaps('My Awesome Group')}`)
        }
        
        try {
            await react('🕔')
            
            const newName = args.join(' ')
            const oldName = groupMetadata.subject
            
            // Change group name
            await sock.groupUpdateSubject(msg.key.remoteJid, newName)
            
            await react('✅')
            await reply(`✅ ${font.smallCaps('Group name changed successfully')}!

╭─「 📝 ${font.smallCaps('Name Change')} 」
├ 🏷️ ${font.smallCaps('Old Name')}: ${font.smallCaps(oldName)}
├ 🆕 ${font.smallCaps('New Name')}: ${font.smallCaps(newName)}
├ 👮 ${font.smallCaps('Changed by')}: ${font.smallCaps('Admin')}
├ 🕒 ${font.smallCaps('Time')}: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}
╰───────────────`)
            
        } catch (error) {
            console.error('Error changing group name:', error)
            await react('❌')
            await reply(`❌ ${font.smallCaps('Failed to change group name. Make sure I have admin privileges')}.`)
        }
    }
}
