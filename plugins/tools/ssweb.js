import { takeScreenshot } from '../../lib/scraper/screenshot.js';
import font from '../../lib/font.js';

export default {
    command: 'ssweb',
    aliases: ['screenshot', 'ss', 'webshot'],
    category: 'tools',
    description: 'Screenshot website dari URL',
    usage: '<url>',
    limit: 1,
    cooldown: 10,

    async execute({ args, reply, sock, msg, react }) {
        if (!args[0]) {
            return reply(`${font.smallCaps('Masukkan URL website yang valid')}!\n${font.smallCaps('Contoh')}: .ssweb https://www.google.com`);
        }

        await react('📸');
        const url = args[0];

        try {
            const result = await takeScreenshot(url);

            if (result.status !== 200 || !result.data || !result.data.screenshot_url) {
                await react('❌');
                return reply(`${font.smallCaps('Gagal mengambil screenshot: ')} ${result.error || 'Unknown error'}`);
            }

            const { screenshot_url, original_url, parameters, timestamp } = result.data;

            await react('✅');
            await sock.sendMessage(msg.key.remoteJid, {
                image: { url: screenshot_url },
                caption: `📸 ${font.bold(font.smallCaps('WEBSITE SCREENSHOT'))}\n• ${font.smallCaps('URL')}: ${original_url}\n• ${font.smallCaps('Resolusi')}: ${parameters.width}x${parameters.height}\n• ${font.smallCaps('Format')}: ${parameters.format.toUpperCase()}\n• ${font.smallCaps('Waktu')}: ${timestamp}\n\n${font.smallCaps('Powered by Local Scraper')}`
            }, { quoted: msg });

        } catch (e) {
            console.error('Screenshot error:', e);
            await react('❌');
            return reply(`${font.smallCaps('Terjadi kesalahan saat mengambil screenshot website')}.`);
        }
    }
};
