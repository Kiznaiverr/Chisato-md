import axios from 'axios'

export default {
    command: 'chatgpt',
    aliases: ['gpt', 'ai', 'openai'],
    category: 'ai',
    description: 'Chat with ChatGPT AI',
    usage: '<text>',
    cooldown: 3,
    async execute({ reply, args, sock, msg }) {
        const text = args.join(' ')
        if (!text) throw 'Masukkan pertanyaan untuk ChatGPT!\n\nContoh: .chatgpt Siapa presiden Indonesia?'
        
        try {
            const loadingMsg = await sock.sendMessage(msg.key.remoteJid, { 
                text: 'ChatGPT sedang berpikir...' 
            }, { quoted: msg })
            
            const response = await axios.get(`https://api.nekoyama.my.id/api/ai/gpt-4.1-mini?message=${encodeURIComponent(text)}`)
            
            if (response.data?.status === 'success' && response.data?.data?.response) {
                const result = response.data.data.response
                const model = response.data.data.model || 'ChatGPT-4.1-mini'
                
                await sock.sendMessage(msg.key.remoteJid, {
                    text: `${result}`,
                    edit: loadingMsg.key
                })
            } else {
                await sock.sendMessage(msg.key.remoteJid, {
                    text: '❌ Tidak ada response dari AI',
                    edit: loadingMsg.key
                })
            }
        } catch (error) {
            console.error('ChatGPT Error:', error)
            await reply('❌ Maaf, terjadi kesalahan saat menghubungi ChatGPT. Silakan coba lagi nanti.')
        }
    }
}
