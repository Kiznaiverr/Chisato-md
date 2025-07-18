import { youtubeVideo, youtubeInfo } from '../../lib/scraper/youtube.js'
import font from '../../lib/font.js'

export default {
    command: 'ytv',
    aliases: ['ytmp4', 'ytvideo', 'youtubevideo'],
    category: 'downloader',
    description: 'Download video YouTube (default 720p mp4)',
    usage: '<url> [quality]',
    limit: 1,
    cooldown: 10,

    async execute({ args, reply, sock, msg, command, react }) {
        if (!args[0]) {
            return reply(`${font.smallCaps('Masukkan link YouTube yang valid')}!\n\n` +
                        `${font.smallCaps('Contoh')}:\n` +
                        `• .ytv https://youtu.be/xxxxx\n` +
                        `• .ytv https://youtu.be/xxxxx 1080\n` +
                        `• .ytv https://youtu.be/xxxxx highest\n\n` +
                        `${font.smallCaps('Kualitas yang tersedia')}: 720 (default), 1080, 480, 360, 144, highest, lowest`)
        }

        await react('🕔')
        
        const url = args[0]
        const quality = args[1] || '720' // Default 720
        
        try {
            // Validate YouTube URL
            if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
                await react('❌')
                return reply(font.smallCaps('Link bukan dari YouTube! Gunakan link YouTube yang valid.'))
            }

            await react('📊')
            
            // Get video info first
            const info = await youtubeInfo(url)
            
            await react('⬇️')
            
            // Download video
            const result = await youtubeVideo(url, quality)
            
            if (!result.success || !result.buffer) {
                await react('❌')
                return reply(font.smallCaps('Gagal mendownload video. Silakan coba lagi.'))
            }
            
            // Check file size (max 100MB for WhatsApp)
            const sizeInMB = result.buffer.length / 1024 / 1024
            if (sizeInMB > 100) {
                await react('⚠️')
                return reply(`${font.smallCaps('File terlalu besar')} (${result.size})!\n\n` +
                           `${font.smallCaps('💡 Solusi')}:\n` +
                           `• Gunakan kualitas lebih rendah: .ytv ${url} 480p\n` +
                           `• Atau gunakan: .ytv ${url} lowest`)
            }

            await react('✅')
            
            // Send video
            const caption = `${font.smallCaps('✅ Video berhasil didownload!')}\n\n` +
                          `${font.smallCaps('📝 Judul')}: ${result.title}\n` +
                          `${font.smallCaps('👤 Channel')}: ${result.author}\n` +
                          `${font.smallCaps('🎬 Kualitas')}: ${result.quality}\n` +
                          `${font.smallCaps('📦 Ukuran')}: ${result.size}\n` +
                          `${font.smallCaps('🗂️ Format')}: ${result.container}`

            await sock.sendMessage(msg.key.remoteJid, {
                video: result.buffer,
                caption,
                mimetype: 'video/mp4',
                fileName: `${result.title.substring(0, 50)}.${result.container}`
            }, { quoted: msg })

        } catch (error) {
            await react('❌')
            console.error('YTV Error:', error)
            
            reply(font.smallCaps('Gagal mendownload video!'))
        }
    }
}
