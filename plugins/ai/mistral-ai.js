import axios from 'axios'

export default {
    command: 'mistral',
    aliases: ['mistralai', 'mistral-ai'],
    category: 'ai',
    description: 'Chat with Mistral AI',
    usage: '<text>',
    cooldown: 3,
    async execute({ reply, args, sock, m }) {
        const text = args.join(' ')
        if (!text) throw 'Masukkan pertanyaan untuk Mistral AI!\n\nContoh: .mistral Siapa presiden Indonesia?'
        
        try {
            // Kirim pesan loading dan simpan key untuk edit nanti
            const loadingMsg = await sock.sendMessage(m.chat, { 
                text: 'Mistral AI sedang berpikir...' 
            }, { quoted: m })
            
            // Menggunakan API Nekoyama Mistral AI
            const response = await axios.get(`https://api.nekoyama.my.id/api/ai/mistral-ai?message=${encodeURIComponent(text)}`)
            
            if (response.data?.status === 'success' && response.data?.data?.response) {
                const result = response.data.data.response
                const model = response.data.data.model || 'Mistral AI'
                
                // Edit pesan loading dengan response
                await sock.sendMessage(m.chat, {
                    text: `*${model} Response:*\n\n${result}`,
                    edit: loadingMsg.key
                })
            } else {
                // Edit pesan loading dengan error
                await sock.sendMessage(m.chat, {
                    text: 'Tidak ada response dari AI',
                    edit: loadingMsg.key
                })
            }
        } catch (error) {
            console.error('Mistral AI Error:', error)
            // Jika ada error, kirim pesan error baru
            await reply(' Maaf, terjadi kesalahan saat menghubungi Mistral AI. Silakan coba lagi nanti.')
        }
    }
}
