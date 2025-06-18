export default {
    command: 'eval',
    aliases: ['exec', 'run'],
    description: 'Execute JavaScript code (Owner only)',
    category: 'owner',
    usage: '.eval <code>',
    ownerOnly: true,
    cooldown: 0,
    async execute(context) {
        const { reply, text, sock, db, msg, sender } = context
        
        if (!text) {
            return await reply('❌ Please provide code to execute!\nExample: .eval console.log("Hello World")')
        }
        
        try {
            // Create execution context
            const util = await import('util')
            const fs = await import('fs')
            const path = await import('path')
            
            let result = await eval(`(async () => { ${text} })()`)
            
            if (typeof result !== 'string') {
                result = util.inspect(result, { depth: 2 })
            }
            
            const output = `
📝 *CODE EXECUTION*

💻 *Input:*
\`\`\`javascript
${text}
\`\`\`

📤 *Output:*
\`\`\`
${result}
\`\`\`

⏱️ *Executed at:* ${new Date().toLocaleString()}
            `.trim()
            
            await reply(output)
            
        } catch (error) {
            const errorOutput = `
❌ *EXECUTION ERROR*

💻 *Input:*
\`\`\`javascript
${text}
\`\`\`

💥 *Error:*
\`\`\`
${error.message}
\`\`\`

📍 *Stack:*
\`\`\`
${error.stack}
\`\`\`
            `.trim()
            
            await reply(errorOutput)
        }
    }
}
