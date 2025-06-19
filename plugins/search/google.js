import axios from 'axios'

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
            return await reply('❌ Please provide a search query!\nExample: .google JavaScript tutorial')
        }
        
        try {
            await reply('🔍 Searching on Google...')
            
            // Simple Google search simulation
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(text)}`
            
            const resultText = `
🔍 *GOOGLE SEARCH RESULTS*

📝 *Query:* ${text}
🔗 *Link:* ${searchUrl}

💡 *Tip:* Click the link above to see full search results on Google!
            `.trim()
            
            await reply(resultText)
            
        } catch (error) {
            await reply('❌ An error occurred while searching. Please try again later.')
        }
    }
}
