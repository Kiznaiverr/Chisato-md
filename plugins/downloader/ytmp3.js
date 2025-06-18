import fetch from 'node-fetch';

export default {
    command: 'ytmp3',
    aliases: ['yta', 'ytaudio', 'ytvmp3'],
    category: 'downloader',
    description: 'Download audio YouTube (MP3)',
    usage: 'ytmp3 <url>',
    cooldown: 5,

    async execute({ args, reply, sock, msg }) {
        if (!args[0]) return reply('Masukkan link YouTube yang valid!\nContoh: .ytmp3 https://www.youtube.com/watch?v=xxxx');
        const url = args[0];
        const api = `https://api.nekoyama.my.id/api/youtube/download?url=${encodeURIComponent(url)}&format=mp3`;
        try {
            const res = await fetch(api);
            if (!res.ok) throw new Error('Gagal menghubungi API YouTube!');
            const json = await res.json();
            if (json.status !== 'success' || !json.data) {
                return reply('Gagal mendapatkan data. Pastikan link YouTube valid dan publik.');
            }
            const { title, download_links, url: yturl } = json.data;
            if (download_links.audio) {
                const audioRes = await fetch(download_links.audio);
                if (!audioRes.ok) throw new Error('Gagal download audio YouTube!');
                const buffer = Buffer.from(await audioRes.arrayBuffer());
                await sock.sendMessage(msg.key.remoteJid, {
                    audio: buffer,
                    mimetype: 'audio/mp4',
                    ptt: false,
                    caption: `*YOUTUBE AUDIO*\n• Judul: ${title || '-'}\n• Link: ${yturl}\n• Format: MP3\n\nPowered by Chisato API`
                }, { quoted: msg });
            } else {
                return reply('Tidak ada audio yang bisa diunduh dari link tersebut.');
            }
        } catch (e) {
            return reply('Terjadi kesalahan saat memproses permintaan YouTube.');
        }
    }
};
