import { youtubeAudio, youtubeInfo } from '../../lib/scraper/youtube.js'
import font from '../../lib/font.js'

export default {
    command: 'yta',
    aliases: ['ytmp3', 'ytaudio', 'youtubeaudio'],
    category: 'downloader',
    description: 'Download audio YouTube (highest quality)',
    usage: '<url> [quality]',
    limit: 1,
    cooldown: 10,

    async execute({ args, reply, sock, msg, command, react }) {
        if (!args[0]) {
            return reply(`${font.smallCaps('Masukkan link YouTube yang valid')}!\n\n` +
                        `${font.smallCaps('Contoh')}:\n` +
                        `• .yta https://youtu.be/xxxxx\n` +
                        `• .yta https://youtu.be/xxxxx 320\n\n` +
                        `${font.smallCaps('Kualitas yang tersedia')}: 256 (default), 320, 128, highest, lowest`)
        }

        await react('🕔')
        
        const url = args[0]
        const quality = args[1] || '256' // Default 256kbps quality
        
        try {
            // Validate YouTube URL
            if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
                await react('❌')
                return reply(font.smallCaps('Link bukan dari YouTube! Gunakan link YouTube yang valid.'))
            }

            await react('📊')
            
            // Get video info first
            const info = await youtubeInfo(url)
            
            // Send thumbnail with info as caption
            const infoCaption = `${font.smallCaps('🎵 Audio ditemukan!')}\n\n` +
                           `${font.smallCaps('📝 Judul')}: ${info.title}\n` +
                           `${font.smallCaps('👤 Channel')}: ${info.author}\n` +
                           `${font.smallCaps('⏱️ Durasi')}: ${info.duration}\n` +
                           `${font.smallCaps('👁️ Views')}: ${info.views?.toLocaleString() || 'Unknown'}\n` +
                           `${font.smallCaps('🎵 Kualitas')}: ${quality}\n` +
                           `${font.smallCaps('🎵 Tersedia')}: ${info.availableQuality?.join(', ') || 'Unknown'}\n\n` +
                           `${font.smallCaps('⏳ Sedang mendownload...')}`

            // Send thumbnail with caption
            await sock.sendMessage(msg.key.remoteJid, {
                image: { url: info.thumbnail },
                caption: infoCaption
            }, { quoted: msg })

            await react('⬇️')
            
            // Download audio
            const result = await youtubeAudio(url, quality)
            
            if (!result.success || !result.buffer) {
                await react('❌')
                return reply(font.smallCaps('Gagal mendownload audio. Silakan coba lagi.'))
            }
            
            // Check file size (max 100MB for WhatsApp)
            const sizeInMB = result.buffer.length / 1024 / 1024
            if (sizeInMB > 100) {
                await react('⚠️')
                return reply(`${font.smallCaps('File terlalu besar')} (${result.size})!\n\n` +
                           `${font.smallCaps('💡 Solusi')}:\n` +
                           `• Gunakan kualitas lebih rendah: .yta ${url} lowest`)
            }

            await react('✅')
            
            // Send audio
            const caption = `${font.smallCaps('✅ Audio berhasil didownload!')}\n\n` +
                          `${font.smallCaps('📝 Judul')}: ${result.title}\n` +
                          `${font.smallCaps('👤 Channel')}: ${result.author}\n` +
                          `${font.smallCaps('🎵 Bitrate')}: ${result.bitrate}\n` +
                          `${font.smallCaps('📦 Ukuran')}: ${result.size}\n` +
                          `${font.smallCaps('🗂️ Format')}: ${result.container}`

            await sock.sendMessage(msg.key.remoteJid, {
                audio: result.buffer,
                caption,
                mimetype: 'audio/mp4',
                fileName: `${result.title.substring(0, 50)}.${result.container}`
            }, { quoted: msg })

        } catch (error) {
            await react('❌')
            console.error('YTA Error:', error)
            
            reply(font.smallCaps('Gagal mendownload audio!'))
        }
    }
}
