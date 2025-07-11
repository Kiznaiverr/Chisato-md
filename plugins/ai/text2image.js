import axios from 'axios'

export default {
    command: 'text2image',
    aliases: ['txt2img', 'generateimage', 'aiimage'],
    category: 'ai',
    description: 'Generate image from text prompt using AI',
    usage: '<prompt>',
    cooldown: 10,
    async execute({ reply, args, sock, msg }) {
        const prompt = args.join(' ')
        if (!prompt) throw 'Masukkan prompt untuk generate gambar!\n\nContoh: .text2image A beautiful sunset over mountains with a lake'
        
        try {
            await sock.sendMessage(msg.key.remoteJid, {
                react: { text: '🕔', key: msg.key }
            })
            
            const response = await axios.get(`https://api.nekoyama.my.id/api/ai/text-to-image?prompt=${encodeURIComponent(prompt)}`)
            
            if (response.data?.status === 'success' && response.data?.data?.download_url) {
                const result = response.data.data
                const imageUrl = result.download_url
                const model = result.model || 'AI Image Generator'
                
                await sock.sendMessage(msg.key.remoteJid, {
                    image: { url: imageUrl },
                    caption: `*AI Generated Image*\n\n📝 *Prompt:* ${result.prompt}\n🤖 *Model:* ${model}`
                }, { quoted: msg })
                
            } else {
                await reply('❌ Gagal membuat gambar, tidak ada response dari AI')
            }
        } catch (error) {
            console.error('Text2Image Error:', error)
            await reply('❌ Maaf, terjadi kesalahan saat membuat gambar. Silakan coba lagi nanti.')
        }
    }
}
