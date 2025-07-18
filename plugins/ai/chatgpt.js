import { chatGPT } from '../../lib/scraper/huggingface.js'

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
            
            const result = await chatGPT(text)
            
            if (result.status === 200 && result.data?.reply) {
                const response = result.data.reply
                
                await sock.sendMessage(msg.key.remoteJid, {
                    text: `${response}`,
                    edit: loadingMsg.key
                })
            } else {
                await sock.sendMessage(msg.key.remoteJid, {
                    text: `❌ Error: ${result.error || 'Tidak ada response dari AI'}`,
                    edit: loadingMsg.key
                })
            }
        } catch (error) {
            console.error('ChatGPT Error:', error)
            await reply('❌ Maaf, terjadi kesalahan saat menghubungi ChatGPT. Silakan coba lagi nanti.')
        }
    }
}
