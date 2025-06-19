import fetch from 'node-fetch';

export default {
    command: 'facebook',
    aliases: ['fb', 'fbvid', 'fbdown'],
    category: 'downloader',
    description: 'Download video Facebook via link',
    usage: 'facebook <url>',
    limit:1,
    cooldown: 5,

    async execute({ args, reply, sock, msg, react }) {
        if (!args[0]) return reply('Masukkan link Facebook yang valid!\nContoh: .facebook https://www.facebook.com/share/v/1AcEg1sL7A/');
        await react('🕔');
        const url = args[0];
        const api = `https://api.nekoyama.my.id/api/facebook/download?url=${encodeURIComponent(url)}`;
        try {
            const res = await fetch(api);
            if (!res.ok) throw new Error('Gagal menghubungi API Facebook!');
            const json = await res.json();
            if (json.status !== 'success' || !json.data) {
                await react('❌');
                return reply('Gagal mendapatkan data. Pastikan link Facebook valid dan publik.');
            }
            const { title, download_links, url: fburl } = json.data;
            // Pilih kualitas terbaik (HD > SD > Audio)
            let videoUrl = null, label = '';
            if (download_links.hd) {
                videoUrl = download_links.hd;
                label = 'HD';
            } else if (download_links.sd) {
                videoUrl = download_links.sd;
                label = 'SD';
            } else if (download_links.audio) {
                videoUrl = download_links.audio;
                label = 'Audio';
            }
            if (!videoUrl) {
                await react('❌');
                return reply('Tidak ada link video yang bisa diunduh.');
            }
            // Download video
            const videoRes = await fetch(videoUrl);
            if (!videoRes.ok) throw new Error('Gagal download video Facebook!');
            const buffer = Buffer.from(await videoRes.arrayBuffer());
            // Kirim video ke user
            await sock.sendMessage(msg.key.remoteJid, {
                video: buffer,
                caption: `*FACEBOOK DOWNLOADER*\n• Judul: ${title || '-'}\n• Link: ${fburl}\n• Kualitas: ${label}\n\nPowered by Chisato API`
            }, { quoted: msg });
            await react('✅');
        } catch (e) {
            await react('❌');
            return reply('Terjadi kesalahan saat memproses permintaan Facebook.');
        }
    }
};
