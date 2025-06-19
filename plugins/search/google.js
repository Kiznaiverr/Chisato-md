import axios from 'axios'
import font from '../../lib/font.js'

export default {
    command: 'google',
    aliases: ['search'],
    description: 'Search on Google',
    category: 'search',
    usage: '<query>',
    limit: 1,
    cooldown: 5,
    async execute(context) {
        const { reply, text } = context
        
        if (!text) {
            return await reply(`❌ ${font.smallCaps('Please provide a search query')}!\n${font.smallCaps('Example')}: .google ${font.smallCaps('JavaScript tutorial')}`)
        }
        
        try {
            await reply(`🔍 ${font.smallCaps('Searching on Google')}...`)
            
            // Simple Google search simulation
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(text)}`
            
            const resultText = `
🔍 ${font.bold(font.smallCaps('GOOGLE SEARCH RESULTS'))}

📝 ${font.bold(font.smallCaps('Query'))}: ${text}
🔗 ${font.bold(font.smallCaps('Link'))}: ${searchUrl}

💡 ${font.bold(font.smallCaps('Tip'))}: ${font.smallCaps('Click the link above to see full search results on Google')}!
            `.trim()
            
            await reply(resultText)
            
        } catch (error) {
            await reply(`❌ ${font.smallCaps('An error occurred while searching. Please try again later')}.`)
        }
    }
}
