export default {
    command: 'ping',
    description: 'Check bot response time',
    category: 'general',
    usage: '.ping',
    cooldown: 3,
    async execute(context) {
        const { reply } = context
        const start = Date.now()
        
        const message = await reply('Pinging...')
        const end = Date.now()
        const responseTime = end - start
        
        await context.sock.sendMessage(context.msg.key.remoteJid, {
            text: `🏓 Pong!\nResponse time: ${responseTime}ms`,
            edit: message.key
        })
    }
}
