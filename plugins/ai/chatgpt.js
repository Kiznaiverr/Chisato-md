import axios from 'axios'

export default {
    command: 'chatgpt',
    aliases: ['gpt', 'ai', 'openai'],
    category: 'ai',
    description: 'Chat with ChatGPT AI',
    usage: '<text>',
    cooldown: 3,
      async execute({ reply, args, sock, m }) {
        const text = args.join(' ')
        if (!text) throw 'Masukkan pertanyaan untuk ChatGPT!\n\nContoh: .chatgpt Siapa presiden Indonesia?'
        
        try {
            // Kirim pesan loading dan simpan key untuk edit nanti
            const loadingMsg = await sock.sendMessage(m.chat, { 
                text: 'ChatGPT sedang berpikir...' 
            }, { quoted: m })
            
            // Menggunakan API Nekoyama ChatGPT-4.1-mini
            const response = await axios.get(`https://api.nekoyama.my.id/api/ai/gpt-4.1-mini?message=${encodeURIComponent(text)}`)
            
            if (response.data?.status === 'success' && response.data?.data?.response) {
                const result = response.data.data.response
                const model = response.data.data.model || 'ChatGPT-4.1-mini'
                
                // Edit pesan loading dengan response
                await sock.sendMessage(m.chat, {
                    text: `*${model} Response:*\n\n${result}`,
                    edit: loadingMsg.key
                })
            } else {
                // Edit pesan loading dengan error
                await sock.sendMessage(m.chat, {
                    text: '❌ Tidak ada response dari AI',
                    edit: loadingMsg.key
                })
            }
        } catch (error) {
            console.error('ChatGPT Error:', error)
            // Jika ada error, kirim pesan error baru
            await reply('❌ Maaf, terjadi kesalahan saat menghubungi ChatGPT. Silakan coba lagi nanti.')
        }
    }
}
