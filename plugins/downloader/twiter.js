import fetch from 'node-fetch';

export default {
    command: 'twitter',
    aliases: ['tw', 'twitterdl', 'xdl'],
    category: 'downloader',
    description: 'Download media (video/gambar) dari Twitter/X',
    usage: 'twitter <url>',
    cooldown: 5,

    async execute({ args, reply, sock, msg }) {
        if (!args[0]) return reply('Masukkan link Twitter/X yang valid!\nContoh: .twitter https://x.com/username/status/1234567890');
        const url = args[0];
        const api = `https://api.nekoyama.my.id/api/twitter/download?url=${encodeURIComponent(url)}`;
        try {
            const res = await fetch(api);
            if (!res.ok) throw new Error('Gagal menghubungi API Twitter!');
            const json = await res.json();
            if (json.status !== 'success' || !json.data) {
                return reply('Gagal mendapatkan data. Pastikan link Twitter/X valid dan publik.');
            }
            const { title, tweet_text, download_links, url: twurl } = json.data;
            // Prioritaskan video, jika tidak ada kirim gambar
            if (download_links.video) {
                const videoRes = await fetch(download_links.video);
                if (!videoRes.ok) throw new Error('Gagal download video Twitter!');
                const buffer = Buffer.from(await videoRes.arrayBuffer());
                await sock.sendMessage(msg.key.remoteJid, {
                    video: buffer,
                    caption: `*TWITTER/X DOWNLOADER*\n• Judul: ${title || '-'}\n• Tweet: ${tweet_text || '-'}\n• Link: ${twurl}\n\nPowered by Chisato API`
                }, { quoted: msg });
            } else if (download_links.image) {
                const imgRes = await fetch(download_links.image);
                if (!imgRes.ok) throw new Error('Gagal download gambar Twitter!');
                const buffer = Buffer.from(await imgRes.arrayBuffer());
                await sock.sendMessage(msg.key.remoteJid, {
                    image: buffer,
                    caption: `*TWITTER/X DOWNLOADER*\n• Judul: ${title || '-'}\n• Tweet: ${tweet_text || '-'}\n• Link: ${twurl}\n\nPowered by Chisato API`
                }, { quoted: msg });
            } else {
                return reply('Tidak ada media yang bisa diunduh dari link tersebut.');
            }
        } catch (e) {
            return reply('Terjadi kesalahan saat memproses permintaan Twitter/X.');
        }
    }
};
