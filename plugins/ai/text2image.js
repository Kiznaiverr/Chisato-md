import { textToImage } from '../../lib/scraper/huggingface.js'
import fs from 'fs'

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
            
            const result = await textToImage(prompt)
            
            if (result.status === 200 && result.data?.filepath) {
                const imageBuffer = fs.readFileSync(result.data.filepath)
                
                await sock.sendMessage(msg.key.remoteJid, {
                    image: imageBuffer,
                    caption: `*AI Generated Image*\n\n📝 *Prompt:* ${result.data.prompt}\n🤖 *Model:* ${result.data.model}\n🕒 *Generated:* ${result.data.timestamp}`
                }, { quoted: msg })
                
                try {
                    fs.unlinkSync(result.data.filepath)
                } catch (cleanupErr) {
                    console.log('Cleanup warning:', cleanupErr.message)
                }
                
            } else {
                await reply(`❌ Error: ${result.error || 'Gagal membuat gambar, tidak ada response dari AI'}`)
            }
        } catch (error) {
            console.error('Text2Image Error:', error)
            await reply('❌ Maaf, terjadi kesalahan saat membuat gambar. Silakan coba lagi nanti.')
        }
    }
}
