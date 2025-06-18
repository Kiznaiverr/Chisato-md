import fetch from 'node-fetch';

const downloadYoutube = async (url, format = '720p') => {
    const api = `https://api.nekoyama.my.id/api/youtube/download?url=${encodeURIComponent(url)}&format=${format}`;
    const res = await fetch(api);
    if (!res.ok) throw new Error('Gagal menghubungi API YouTube!');
    const json = await res.json();
    if (json.status !== 'success' || !json.data) {
        throw new Error('Gagal mendapatkan data. Pastikan link YouTube valid dan publik.');
    }
    const { title, download_links, url: yturl, thumbnail, author, duration } = json.data;
    return {
        title,
        download_links,
        yturl,
        thumbnail,
        author,
        duration
    };
};

export default {
    command: ['ytmp', 'ytv', 'ytmp4', 'ytvideo', 'ytmp3', 'yta', 'ytaudio', 'ytvmp3'],
    aliases: [],
    category: 'downloader',
    description: 'Download video/audio YouTube (720p/mp3)',
    usage: 'ytmp <url> | ytmp3 <url>',
    cooldown: 5,

    async execute({ args, reply, sock, msg, command }) {
        if (!args[0]) return reply('Masukkan link YouTube yang valid!\nContoh: .ytmp https://www.youtube.com/watch?v=xxxx');
        const url = args[0];
        const isAudio = ['yta', 'ytmp3', 'ytaudio', 'ytvmp3'].includes(command);
        const format = isAudio ? 'mp3' : '720p';
        try {
            const result = await downloadYoutube(url, format);
            const { title, download_links, yturl, thumbnail, author, duration } = result;
            let fileUrl = isAudio ? download_links.audio : download_links.video;
            if (!fileUrl) return reply('Tidak ada media yang bisa diunduh dari link tersebut.');
            const fileRes = await fetch(fileUrl);
            if (!fileRes.ok) throw new Error('Gagal download file YouTube!');
            const buffer = Buffer.from(await fileRes.arrayBuffer());
            const info = `🎵 *Title*: ${title || '-'}\n🖼️ *Thumbnail*: ${thumbnail || '-'}\n👤 *Uploader*: ${author || '-'}\n⏱️ *Duration*: ${duration || '-'}\n🔗 *Link*: ${yturl || '-'}\n`;
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
            await sock.sendMessage(msg.key.remoteJid, { react: { text: '❌', key: msg.key } });
            reply('⚠️ *Oops! Something went wrong.*\n\n🚨 Please try lagi nanti atau cek link yang kamu berikan.');
        }
    }
};
