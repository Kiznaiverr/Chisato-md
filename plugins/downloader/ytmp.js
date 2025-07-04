import fetch from 'node-fetch';
import font from '../../lib/font.js';

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
    usage: '<url>',
    limit: 1,
    cooldown: 5,

    async execute({ args, reply, sock, msg, command, react }) {
        if (!args[0]) return reply(`${font.smallCaps('Masukkan link YouTube yang valid')}!\n${font.smallCaps('Contoh')}: .ytmp https://www.youtube.com/watch?v=xxxx`);
        await react('🕔');
        const url = args[0];
        const isAudio = ['yta', 'ytmp3', 'ytaudio', 'ytvmp3'].includes(command);
        const format = isAudio ? 'mp3' : '720p';
        try {
            const apiResponse = await downloadYoutube(url, format);
            if (!apiResponse || !apiResponse.data) throw new Error(`${font.smallCaps('API response kosong atau tidak valid')}.`);
            const data = apiResponse.data;
            const info = `🎵 ${font.bold(font.smallCaps('Title'))}: ${data.title || '-'}\n👤 ${font.bold(font.smallCaps('Uploader'))}: ${data.uploader || '-'}\n⏱️ ${font.bold(font.smallCaps('Duration'))}: ${data.duration || '-'}\n🔗 ${font.bold(font.smallCaps('Link'))}: https://youtu.be/${data.video_id || '-'}\n`;
            let fileUrl = data.download_url;
            if (!fileUrl) throw new Error(`${font.smallCaps('Tidak ada URL media yang bisa diunduh dari API')}.`);
            let fileRes;
            try {
                fileRes = await fetchWithTimeout(fileUrl, { timeout: 30000 });
            } catch (err) {
                throw new Error(`${font.smallCaps('Gagal mengunduh file media (timeout atau error jaringan)')}.`);
            }
            if (!fileRes.ok) throw new Error(`${font.smallCaps('Gagal download file YouTube')}!`);
            const buffer = Buffer.from(await fileRes.arrayBuffer());
            if (isAudio) {
                await sock.sendMessage(msg.key.remoteJid, {
                    audio: buffer,
                    mimetype: 'audio/mp4',
                    ptt: false,
                    caption: `🎧 ${font.bold(font.smallCaps('Here\'s your audio file'))}!\n\n${info}${font.smallCaps('Powered by Chisato API')}`
                }, { quoted: msg });
            } else {
                await sock.sendMessage(msg.key.remoteJid, {
                    video: buffer,
                    mimetype: 'video/mp4',
                    caption: `🎬 ${font.bold(font.smallCaps('Here\'s your video file'))}!\n\n${info}${font.smallCaps('Powered by Chisato API')}`
                }, { quoted: msg });
            }
            await react('✅');
        } catch (e) {
            await react('❌');
            return reply(e.message || `${font.smallCaps('Terjadi kesalahan saat memproses permintaan YouTube')}.`);
        }
    }
};
