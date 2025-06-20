import font from '../../lib/font.js'

export default {
    command: 'add',
    aliases: ['invite'],
    category: 'admin',
    description: 'Add member to group',
    usage: '<number>',
    groupOnly: true,
    adminOnly: true,
    botAdmin: true,
    cooldown: 5,
    
    async execute({ sock, msg, args, reply, react, isGroup }) {
        if (!isGroup) return reply(`❌ ${font.smallCaps('This command can only be used in groups')}!`)
        
        if (!args[0]) {
            return reply(`❌ ${font.smallCaps('Please provide a phone number')}!\n\n${font.smallCaps('Example')}: .add 628123456789`)
        }
        
        try {
            await react('🕔')
            
            // Clean and format phone number
            let number = args[0].replace(/[^0-9]/g, '')
            if (number.startsWith('0')) {
                number = '62' + number.slice(1)
            } else if (!number.startsWith('62')) {
                number = '62' + number
            }
            
            const targetJid = number + '@s.whatsapp.net'
            
            // Add user to group
            const result = await sock.groupParticipantsUpdate(msg.key.remoteJid, [targetJid], 'add')
            
            if (result[0]?.status === '200') {
                await react('✅')
                await reply(`✅ ${font.smallCaps('Successfully added')} @${number} ${font.smallCaps('to the group')}!

╭─「 👥 ${font.smallCaps('Member Added')} 」
├ 📱 ${font.smallCaps('Number')}: +${number}
├ 👮 ${font.smallCaps('Added by')}: ${font.smallCaps('Admin')}
├ 🕒 ${font.smallCaps('Time')}: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}
╰───────────────`)
            } else if (result[0]?.status === '403') {
                await react('⚠️')
                await reply(`⚠️ ${font.smallCaps('Cannot add')} +${number}. ${font.smallCaps('Possible reasons')}:
• ${font.smallCaps('User has privacy settings that prevent being added')}
• ${font.smallCaps('User has blocked the bot')}
• ${font.smallCaps('Number does not exist on WhatsApp')}

💡 ${font.smallCaps('Try sending them the group invite link instead')}.`)
            } else {
                await react('❌')
                await reply(`❌ ${font.smallCaps('Failed to add user')}. ${font.smallCaps('Status')}: ${result[0]?.status || 'Unknown'}`)
            }
            
        } catch (error) {
            console.error('Error adding user:', error)
            await react('❌')
            await reply(`❌ ${font.smallCaps('Failed to add user. Make sure I have admin privileges and the number is valid')}.`)
        }
    }
}
