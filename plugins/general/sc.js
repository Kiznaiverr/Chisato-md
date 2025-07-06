import font from '../../lib/font.js'

export default {
    command: 'sc',
    aliases: ['sourcecode', 'source', 'github', 'repo'],
    description: 'Show bot source code information',
    category: 'general',
    usage: '',
    cooldown: 5,
    async execute(context) {
        const { reply, config } = context
        
        const botInfo = config.get('botSettings')
        const ownerInfo = config.get('ownerSettings')
        
        const sourceText = `
🤖 ${font.bold(font.smallCaps('CHISATO-MD'))}

📂 ${font.bold(font.smallCaps('Source Code'))}:
https://github.com/kiznaiverr/chisato-md

💻 ${font.bold(font.smallCaps('Language'))}: ${font.smallCaps('JavaScript (Node.js)')}
⚡ ${font.bold(font.smallCaps('Version'))}: ${botInfo.version || '1.0.0'}
👨‍💻 ${font.bold(font.smallCaps('Developer'))}: ${font.smallCaps(ownerInfo.ownerName || 'Kiznavierr')}

⭐ ${font.smallCaps('Give a star if you like this bot')}!
        `.trim()
        
        await reply(sourceText)
    }
}
