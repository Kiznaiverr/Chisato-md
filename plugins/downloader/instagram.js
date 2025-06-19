import fetch from 'node-fetch';

export default {
    command: 'instagram',
    aliases: ['ig', 'igdl', 'instadl'],
    category: 'downloader',
    description: 'Download video atau gambar dari Instagram (Reel/Post)',
    usage: 'instagram <url>',
    limit: 1,
    cooldown: 5,

    async execute({ args, reply, sock, msg }) {
        if (!args[0]) return reply('Masukkan link Instagram yang valid!\nContoh: .instagram https://www.instagram.com/reel/DJGKCPHSi3N/');
        const url = args[0];
        const api = `https://api.nekoyama.my.id/api/instagram/download?url=${encodeURIComponent(url)}`;
        try {
            const res = await fetch(api);
            if (!res.ok) throw new Error('Gagal menghubungi API Instagram!');
            const json = await res.json();
            if (json.status !== 'success' || !json.data) {
                return reply('Gagal mendapatkan data. Pastikan link Instagram valid dan publik.');
            }
            const { title, username, download_links, url: igurl } = json.data;
            // Prioritaskan video, jika tidak ada kirim gambar
            if (download_links.video) {
                const videoRes = await fetch(download_links.video);
                if (!videoRes.ok) throw new Error('Gagal download video Instagram!');
                const buffer = Buffer.from(await videoRes.arrayBuffer());
                await sock.sendMessage(msg.key.remoteJid, {
                    video: buffer,
                    caption: `*INSTAGRAM DOWNLOADER*\n• Judul: ${title || '-'}\n• User: @${username || '-'}\n• Link: ${igurl}\n\nPowered by Chisato API`
                }, { quoted: msg });
            } else if (download_links.image) {
                const imgRes = await fetch(download_links.image);
                if (!imgRes.ok) throw new Error('Gagal download gambar Instagram!');
                const buffer = Buffer.from(await imgRes.arrayBuffer());
                await sock.sendMessage(msg.key.remoteJid, {
                    image: buffer,
                    caption: `*INSTAGRAM DOWNLOADER*\n• Judul: ${title || '-'}\n• User: @${username || '-'}\n• Link: ${igurl}\n\nPowered by Chisato API`
                }, { quoted: msg });
            } else {
                return reply('Tidak ada media yang bisa diunduh dari link tersebut.');
            }
        } catch (e) {
            return reply('Terjadi kesalahan saat memproses permintaan Instagram.');
        }
    }
};
