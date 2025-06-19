export default {
    command: 'test',
    aliases: ['tes'],
    category: 'general',
    description: 'Test bot response',
    usage: '',
    cooldown: 3,
    
    async execute({ reply, sender, isGroup, groupMetadata }) {
        let testMsg = `✅ Bot is working!\n`
        testMsg += `📱 Your ID: ${sender.split('@')[0]}\n`
        testMsg += `📍 Chat Type: ${isGroup ? 'Group' : 'Private'}\n`
        
        if (isGroup && groupMetadata) {
            testMsg += `👥 Group: ${groupMetadata.subject}\n`
            testMsg += `👤 Members: ${groupMetadata.participants?.length || 0}\n`
        }
        
        testMsg += `⏰ Time: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`
        
        await reply(testMsg)
    }
}
