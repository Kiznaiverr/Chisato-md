import axios from 'axios'

export default {
    command: 'chatgpt',
    aliases: ['gpt', 'ai', 'openai'],
    category: 'ai',
    description: 'Chat with ChatGPT AI',
    usage: '<text>',
    cooldown: 3,
    
    async execute({ reply, args }) {
        const text = args.join(' ')
        if (!text) throw 'Masukkan pertanyaan untuk ChatGPT!\n\nContoh: .chatgpt Siapa presiden Indonesia?'
          try {
            await reply('ChatGPT sedang berpikir...')
            
            // Menggunakan API Nekoyama ChatGPT-4.1-mini
            const response = await axios.get(`https://api.nekoyama.my.id/api/ai/gpt-4.1-mini?message=${encodeURIComponent(text)}`)
            
            if (response.data?.status === 'success' && response.data?.data?.response) {
                const result = response.data.data.response
                const model = response.data.data.model || 'ChatGPT-4.1-mini'
                await reply(`🤖 *${model} Response:*\n\n${result}`)
            } else {
                throw new Error('Tidak ada response dari AI')
            }
        } catch (error) {
            console.error('ChatGPT Error:', error)
            await reply('❌ Maaf, terjadi kesalahan saat menghubungi ChatGPT. Silakan coba lagi nanti.')
        }
    }
}
