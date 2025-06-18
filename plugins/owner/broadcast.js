export default {
    command: 'broadcast',
    aliases: ['bc'],
    description: 'Send message to all',
    category: 'owner',
    usage: '.broadcast <message>',
    ownerOnly: true,
    cooldown: 0,
    async execute(context) {
        const { reply, text, sock, db } = context
        
        if (!text) {
            return await reply('❌ Please provide message to broadcast!\nExample: .broadcast Hello everyone!')
        }
        
        await reply('📡 Starting broadcast...')
        
        // Get all user chats
        const users = Object.values(db.users)
        let sent = 0
        let failed = 0
        
        const broadcastMessage = `
📢 *BROADCAST MESSAGE*

${text}

━━━━━━━━━━━━━━━━━━━━━━
🤖 From: ${db.getSetting('botName')}
📅 Time: ${new Date().toLocaleString()}
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
✅ *BROADCAST COMPLETED*

📊 *Statistics:*
• ✅ Sent: ${sent} users
• ❌ Failed: ${failed} users
• 📈 Success Rate: ${Math.round((sent / (sent + failed)) * 100) || 0}%

🕐 Completed at: ${new Date().toLocaleString()}
        `.trim()
        
        await reply(resultText)
    }
}
