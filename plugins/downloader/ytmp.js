import fetch from 'node-fetch';

export default {
    command: 'ytmp',
    aliases: ['ytv', 'ytmp4', 'ytvideo'],
    category: 'downloader',
    description: 'Download video YouTube (720p)',
    usage: 'ytmp <url>',
    cooldown: 5,

    async execute({ args, reply, sock, msg }) {
        if (!args[0]) return reply('Masukkan link YouTube yang valid!\nContoh: .ytmp https://www.youtube.com/watch?v=xxxx');
        const url = args[0];
        const api = `https://api.nekoyama.my.id/api/youtube/download?url=${encodeURIComponent(url)}&format=720p`;
        try {
            const res = await fetch(api);
            if (!res.ok) throw new Error('Gagal menghubungi API YouTube!');
            const json = await res.json();
            if (json.status !== 'success' || !json.data) {
                return reply('Gagal mendapatkan data. Pastikan link YouTube valid dan publik.');
            }
            const { title, download_links, url: yturl } = json.data;
            if (download_links.video) {
                const videoRes = await fetch(download_links.video);
                if (!videoRes.ok) throw new Error('Gagal download video YouTube!');
                const buffer = Buffer.from(await videoRes.arrayBuffer());
                await sock.sendMessage(msg.key.remoteJid, {
                    video: buffer,
                    caption: `*YOUTUBE DOWNLOADER*\n• Judul: ${title || '-'}\n• Link: ${yturl}\n• Resolusi: 720p\n\nPowered by Chisato API`
                }, { quoted: msg });
            } else {
                return reply('Tidak ada video yang bisa diunduh dari link tersebut.');
            }
        } catch (e) {
            return reply('Terjadi kesalahan saat memproses permintaan YouTube.');
        }
    }
};
