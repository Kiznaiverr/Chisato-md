import axios from 'axios'

export default {
    command: 'mistral',
    aliases: ['mistralai', 'mistral-ai'],
    category: 'ai',
    description: 'Chat with Mistral AI',
    usage: '<text>',
    cooldown: 3,
    async execute({ reply, args, sock, msg }) {
        const text = args.join(' ')
        if (!text) throw 'Masukkan pertanyaan untuk Mistral AI!\n\nContoh: .mistral Siapa presiden Indonesia?'
        
        try {
            const loadingMsg = await sock.sendMessage(msg.key.remoteJid, { 
                text: 'Mistral AI sedang berpikir...' 
            }, { quoted: msg })
            
            const response = await axios.get(`https://api.nekoyama.my.id/api/ai/mistral-ai?message=${encodeURIComponent(text)}`)
            
            if (response.data?.status === 'success' && response.data?.data?.response) {
                const result = response.data.data.response
                
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
            console.error('Mistral AI Error:', error)
            await reply('❌ Maaf, terjadi kesalahan saat menghubungi Mistral AI. Silakan coba lagi nanti.')
        }
    }
}
    
