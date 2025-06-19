import font from '../../lib/font.js'

export default {
    command: 'test',
    aliases: ['tes'],
    category: 'general',
    description: 'Test bot response',
    usage: '',
    cooldown: 3,
    
    async execute({ reply, sender, isGroup, groupMetadata }) {
        let testMsg = `✅ ${font.smallCaps('Bot is working!')} \n`
        testMsg += `📱 ${font.smallCaps('Your ID')}: ${sender.split('@')[0]}\n`
        testMsg += `📍 ${font.smallCaps('Chat Type')}: ${isGroup ? font.smallCaps('Group') : font.smallCaps('Private')}\n`
        
        if (isGroup && groupMetadata) {
            testMsg += `👥 ${font.smallCaps('Group')}: ${groupMetadata.subject}\n`
            testMsg += `👤 ${font.smallCaps('Members')}: ${groupMetadata.participants?.length || 0}\n`
        }
        
        testMsg += `⏰ ${font.smallCaps('Time')}: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`
        
        await reply(testMsg)
    }
}
