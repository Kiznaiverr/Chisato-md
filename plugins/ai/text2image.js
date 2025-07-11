import axios from 'axios'

export default {
    command: 'text2image',
    aliases: ['txt2img', 'generateimage', 'aiimage'],
    category: 'ai',
    description: 'Generate image from text prompt using AI',
    usage: '<prompt>',
    cooldown: 10,
    async execute({ reply, args, sock, m }) {
        const prompt = args.join(' ')
        if (!prompt) throw 'Masukkan prompt untuk generate gambar!\n\nContoh: .text2image A beautiful sunset over mountains with a lake'
        
        try {
            // React dengan jam saja
            await sock.sendMessage(m.chat, {
                react: { text: '🕔', key: m.key }
            })
            
            // Menggunakan API Nekoyama Text-to-Image
            const response = await axios.get(`https://api.nekoyama.my.id/api/ai/text-to-image?prompt=${encodeURIComponent(prompt)}`)
            
            if (response.data?.status === 'success' && response.data?.data?.download_url) {
                const result = response.data.data
                const imageUrl = result.download_url
                const model = result.model || 'AI Image Generator'
                
                // Langsung kirim gambar ke user
                await sock.sendMessage(m.chat, {
                    image: { url: imageUrl },
                    caption: `*AI Generated Image*\n\n📝 *Prompt:* ${result.prompt}\n🤖 *Model:* ${model}`
                }, { quoted: m })
                
            } else {
                await reply('❌ Gagal membuat gambar, tidak ada response dari AI')
            }
        } catch (error) {
            console.error('Text2Image Error:', error)
            await reply('❌ Maaf, terjadi kesalahan saat membuat gambar. Silakan coba lagi nanti.')
        }
    }
}
