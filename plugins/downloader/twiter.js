import { twitterDownload } from '../../lib/scraper/twitter.js';
import font from '../../lib/font.js';

export default {
    command: 'twitter',
    aliases: ['tw', 'twitterdl', 'xdl'],
    category: 'downloader',
    description: 'Download media (video/gambar) dari Twitter/X',
    usage: '<url>',
    limit: 1,
    cooldown: 5,

    async execute({ args, reply, sock, msg, react }) {
        if (!args[0]) return reply(`${font.smallCaps('Masukkan link Twitter/X yang valid')}!\n${font.smallCaps('Contoh')}: .twitter https://x.com/username/status/1234567890`);
        await react('🕔');
        const url = args[0];
        
        try {
            const result = await twitterDownload(url);
            
            if (result.status !== 200 || !result.data) {
                await react('❌');
                return reply(`${font.smallCaps('Gagal mendapatkan data: ')} ${result.error || 'Unknown error'}`);
            }
            
            const { title, tweet_text, download_links, url: twurl } = result.data;
            const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
            
            if (download_links.video) {
                const videoRes = await fetch(download_links.video);
                if (!videoRes.ok) throw new Error(`${font.smallCaps('Gagal download video Twitter')}!`);
                const buffer = Buffer.from(await videoRes.arrayBuffer());
                await sock.sendMessage(msg.key.remoteJid, {
                    video: buffer,
                    caption: `${font.bold(font.smallCaps('TWITTER/X DOWNLOADER'))}\n• ${font.smallCaps('Judul')}: ${title || '-'}\n• ${font.smallCaps('Tweet')}: ${tweet_text || '-'}\n• ${font.smallCaps('Link')}: ${twurl}\n\n${font.smallCaps('Powered by Local Scraper')}`
                }, { quoted: msg });
                await react('✅');
            } else if (download_links.image) {
                const imgRes = await fetch(download_links.image);
                if (!imgRes.ok) throw new Error(`${font.smallCaps('Gagal download gambar Twitter')}!`);
                const buffer = Buffer.from(await imgRes.arrayBuffer());
                await sock.sendMessage(msg.key.remoteJid, {
                    image: buffer,
                    caption: `${font.bold(font.smallCaps('TWITTER/X DOWNLOADER'))}\n• ${font.smallCaps('Judul')}: ${title || '-'}\n• ${font.smallCaps('Tweet')}: ${tweet_text || '-'}\n• ${font.smallCaps('Link')}: ${twurl}\n\n${font.smallCaps('Powered by Local Scraper')}`
                }, { quoted: msg });
                await react('✅');
            } else {
                await react('❌');
                return reply(`${font.smallCaps('Tidak ada media yang bisa diunduh dari link tersebut')}.`);
            }
        } catch (e) {
            console.error('Twitter error:', e);
            await react('❌');
            return reply(`${font.smallCaps('Terjadi kesalahan saat memproses permintaan Twitter/X')}.`);
        }
    }
};
