import font from '../../lib/font.js'

export default {
    command: 'eval',
    aliases: ['exec', 'run'],
    description: 'Execute JavaScript code',
    category: 'owner',
    usage: '<code>',
    ownerOnly: true,
    cooldown: 0,
    async execute(context) {
        const { reply, text, sock, db, msg, sender } = context
        
        if (!text) {
            return await reply(`❌ ${font.smallCaps('Please provide code to execute')}!\n${font.smallCaps('Example')}: .eval console.log("Hello World")`)
        }
        
        try {
            const util = await import('util')
            const fs = await import('fs')
            const path = await import('path')
            
            let result = await eval(`(async () => { ${text} })()`)
            
            if (typeof result !== 'string') {
                result = util.inspect(result, { depth: 2 })
            }
            
            const output = `
📝 ${font.bold(font.smallCaps('CODE EXECUTION'))}

💻 ${font.bold(font.smallCaps('Input'))}:
\`\`\`javascript
${text}
\`\`\`

📤 ${font.bold(font.smallCaps('Output'))}:
\`\`\`
${result}
\`\`\`

⏱️ ${font.bold(font.smallCaps('Executed at'))}: ${new Date().toLocaleString()}
            `.trim()
            
            await reply(output)
            
        } catch (error) {
            const errorOutput = `
❌ ${font.bold(font.smallCaps('EXECUTION ERROR'))}

💻 ${font.bold(font.smallCaps('Input'))}:
\`\`\`javascript
${text}
\`\`\`

💥 ${font.bold(font.smallCaps('Error'))}:
\`\`\`
${error.message}
\`\`\`

📍 ${font.bold(font.smallCaps('Stack'))}:
\`\`\`
${error.stack}
\`\`\`
            `.trim()
            
            await reply(errorOutput)
        }
    }
}
