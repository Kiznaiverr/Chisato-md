import fetch from 'node-fetch';

export default {
    command: 'tiktok',
    aliases: ['tt', 'ttdl', 'tiktokdl'],
    category: 'downloader',
    description: 'Download video dan audio dari TikTok',
    usage: 'tiktok <url>',
    limit: 1,
    cooldown: 5,

    async execute({ args, reply, sock, msg, react }) {
        if (!args[0]) return reply('Masukkan link TikTok yang valid!\nContoh: .tiktok https://www.tiktok.com/@user/video/1234567890');
        await react('🕔');
        const url = args[0];
        const api = `https://api.nekoyama.my.id/api/tiktok/download?url=${encodeURIComponent(url)}`;
        try {
            const res = await fetch(api);
            if (!res.ok) throw new Error('Gagal menghubungi API TikTok!');
            const json = await res.json();
            if (json.status !== 'success' || !json.data) {
                await react('❌');
                return reply('Gagal mendapatkan data. Pastikan link TikTok valid dan publik.');
            }
            const { title, thumbnail, download_links, url: tiktokUrl } = json.data;
            // Download video
            if (download_links.video) {
                const videoRes = await fetch(download_links.video);
                if (!videoRes.ok) throw new Error('Gagal download video TikTok!');
                const buffer = Buffer.from(await videoRes.arrayBuffer());
                await sock.sendMessage(msg.key.remoteJid, {
                    video: buffer,
                    caption: `*TIKTOK DOWNLOADER*\n• Judul: ${title || '-'}\n• Link: ${tiktokUrl}\n\nPowered by Chisato API`
                }, { quoted: msg });
                await react('✅');
            }
            // Download audio
            if (download_links.audio) {
                const audioRes = await fetch(download_links.audio);
                if (!audioRes.ok) throw new Error('Gagal download audio TikTok!');
                const buffer = Buffer.from(await audioRes.arrayBuffer());
                await sock.sendMessage(msg.key.remoteJid, {
                    audio: buffer,
                    mimetype: 'audio/mp4',
                    ptt: false,
                    caption: `*TIKTOK AUDIO*\n• Judul: ${title || '-'}\n• Link: ${tiktokUrl}\n\nPowered by Chisato API`
                }, { quoted: msg });
                await react('✅');
            }
            if (!download_links.video && !download_links.audio) {
                await react('❌');
                return reply('Tidak ada media yang bisa diunduh dari link tersebut.');
            }
        } catch (e) {
            await react('❌');
            return reply('Terjadi kesalahan saat memproses permintaan TikTok.');
        }
    }
};
