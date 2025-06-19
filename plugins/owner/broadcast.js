import font from '../../lib/font.js'

export default {
    command: 'broadcast',
    aliases: ['bc'],
    description: 'Send message to all',
    category: 'owner',
    usage: '<message>',
    ownerOnly: true,
    cooldown: 0,
    async execute(context) {
        const { reply, text, sock, db } = context
        
        if (!text) {
            return await reply(`❌ ${font.smallCaps('Please provide message to broadcast')}!\n${font.smallCaps('Example')}: .broadcast ${font.smallCaps('Hello everyone')}!`)
        }
        
        await reply(`📡 ${font.smallCaps('Starting broadcast')}...`)
        
        // Get all user chats
        const users = Object.values(db.users)
        let sent = 0
        let failed = 0
        
        const broadcastMessage = `
📢 ${font.bold(font.smallCaps('BROADCAST MESSAGE'))}

${text}

━━━━━━━━━━━━━━━━━━━━━━
🤖 ${font.smallCaps('From')}: ${db.getSetting('botName')}
📅 ${font.smallCaps('Time')}: ${new Date().toLocaleString()}
        `.trim()
        
        for (const user of users) {
            if (user.jid && !user.banned) {
                try {
                    await sock.sendMessage(user.jid, { 
                        text: broadcastMessage 
                    })
                    sent++
                    
                    // Small delay to prevent spam detection
                    await new Promise(resolve => setTimeout(resolve, 100))
                } catch (error) {
                    failed++
                    console.error(`Broadcast failed for ${user.jid}:`, error)
                }
            }
        }
        
        const resultText = `
✅ ${font.bold(font.smallCaps('BROADCAST COMPLETED'))}

📊 ${font.bold(font.smallCaps('Statistics'))}:
• ✅ ${font.smallCaps('Sent')}: ${sent} ${font.smallCaps('users')}
• ❌ ${font.smallCaps('Failed')}: ${failed} ${font.smallCaps('users')}
• 📈 ${font.smallCaps('Success Rate')}: ${Math.round((sent / (sent + failed)) * 100) || 0}%

🕐 ${font.smallCaps('Completed at')}: ${new Date().toLocaleString()}
        `.trim()
        
        await reply(resultText)
    }
}
