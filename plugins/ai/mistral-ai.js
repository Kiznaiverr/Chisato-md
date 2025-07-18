import { mistralAI } from '../../lib/scraper/huggingface.js'

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
            
            const result = await mistralAI(text)
            
            if (result.status === 200 && result.data?.response) {
                const response = result.data.response
                const model = result.data.model || 'Mistral-7B'
                
                await sock.sendMessage(msg.key.remoteJid, {
                    text: `${response}\n\n_Model: ${model}`,
                    edit: loadingMsg.key
                })
            } else {
                await sock.sendMessage(msg.key.remoteJid, {
                    text: `❌ Error: ${result.error || 'Tidak ada response dari AI'}`,
                    edit: loadingMsg.key
                })
            }
        } catch (error) {
            console.error('Mistral AI Error:', error)
            await reply('❌ Maaf, terjadi kesalahan saat menghubungi Mistral AI. Silakan coba lagi nanti.')
        }
    }
}
    
