import fetch from 'node-fetch';

// Helper to fetch with timeout
async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 30000 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(resource, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (err) {
        clearTimeout(id);
        throw err;
    }
}

const downloadYoutube = async (url, format = '720p') => {
    const api = `https://api.nekoyama.my.id/api/youtube/download?url=${encodeURIComponent(url)}&format=${format}`;
    const res = await fetchWithTimeout(api, { timeout: 30000 });
    if (!res.ok) throw new Error('Gagal menghubungi API YouTube!');
    const json = await res.json();
    if (json.status !== 'success' || !json.data) {
        throw new Error('Gagal mendapatkan data. Pastikan link YouTube valid dan publik.');
    }
    return json;
};

export default {
    command: 'ytmp',
    aliases: ['ytv', 'ytmp4', 'ytvideo', 'ytmp3', 'yta', 'ytaudio', 'ytvmp3'],
    category: 'downloader',
    description: 'Download video/audio YouTube (720p/mp3)',
    usage: 'ytmp <url> | ytmp3 <url>',
    limit: 1,
    cooldown: 5,

    async execute({ args, reply, sock, msg, command }) {
        if (!args[0]) return reply('Masukkan link YouTube yang valid!\nContoh: .ytmp https://www.youtube.com/watch?v=xxxx');
        const url = args[0];
        const isAudio = ['yta', 'ytmp3', 'ytaudio', 'ytvmp3'].includes(command);
        const format = isAudio ? 'mp3' : '720p';
        try {
            // React with clock emoji to indicate processing
            await sock.sendMessage(msg.key.remoteJid, { react: { text: '🕔', key: msg.key } });
            // Fetch API and log response for debugging
            const apiResponse = await downloadYoutube(url, format);
            if (!apiResponse || !apiResponse.data) throw new Error('API response kosong atau tidak valid.');
            const data = apiResponse.data;
            // Compose info
            const info = `🎵 *Title*: ${data.title || '-'}\n👤 *Uploader*: ${data.uploader || '-'}\n⏱️ *Duration*: ${data.duration || '-'}\n🔗 *Link*: https://youtu.be/${data.video_id || '-'}\n`;
            // Determine media URL
            let fileUrl = data.download_url;
            if (!fileUrl) throw new Error('Tidak ada URL media yang bisa diunduh dari API.');
            // Download media with timeout
            let fileRes;
            try {
                fileRes = await fetchWithTimeout(fileUrl, { timeout: 30000 });
            } catch (err) {
                throw new Error('Gagal mengunduh file media (timeout atau error jaringan).');
            }
            if (!fileRes.ok) throw new Error('Gagal download file YouTube!');
            const buffer = Buffer.from(await fileRes.arrayBuffer());
            // Send media
            if (isAudio) {
                await sock.sendMessage(msg.key.remoteJid, {
                    audio: buffer,
                    mimetype: 'audio/mp4',
                    ptt: false,
                    caption: `🎧 *Here's your audio file!*\n\n${info}\nPowered by Chisato API`
                }, { quoted: msg });
            } else {
                await sock.sendMessage(msg.key.remoteJid, {
                    video: buffer,
                    mimetype: 'video/mp4',
                    caption: `🎬 *Here's your video file!*\n\n${info}\nPowered by Chisato API`
                }, { quoted: msg });
            }
        } catch (error) {
            // Log error for debugging
            console.error('YT Plugin Error:', error);
            await sock.sendMessage(msg.key.remoteJid, { react: { text: '❌', key: msg.key } });
            reply('⚠️ *Terjadi kesalahan saat memproses permintaan YouTube.*\n\n' + (error.message || error));
        }
    }
};
