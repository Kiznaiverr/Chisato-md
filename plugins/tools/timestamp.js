import font from '../../lib/font.js';

export default {
    command: 'timestamp',
    description: 'Convert timestamp or get current timestamp',
    category: 'tools',
    usage: '[timestamp]',
    cooldown: 2,
    async execute(context) {
        const { args, reply } = context;
        
        if (!args[0]) {
            // Get current timestamp
            const now = Date.now();
            const nowSeconds = Math.floor(now / 1000);
            const date = new Date(now);
            
            const result = `⏰ ${font.bold(font.smallCaps('Current Timestamp'))}\n\n` +
                          `📅 ${font.smallCaps('Date')}: ${date.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}\n` +
                          `🕐 ${font.smallCaps('Milliseconds')}: \`${now}\`\n` +
                          `⏱️ ${font.smallCaps('Seconds')}: \`${nowSeconds}\`\n` +
                          `🌏 ${font.smallCaps('Timezone')}: Asia/Jakarta (WIB)`;
            
            return reply(result);
        }
        
        const timestamp = args[0];
        
        try {
            let date;
            let inputType;
            
            // Check if timestamp is in seconds or milliseconds
            if (timestamp.length === 10) {
                // Seconds
                date = new Date(parseInt(timestamp) * 1000);
                inputType = 'seconds';
            } else if (timestamp.length === 13) {
                // Milliseconds
                date = new Date(parseInt(timestamp));
                inputType = 'milliseconds';
            } else {
                return reply(`${font.smallCaps('Format timestamp tidak valid. Gunakan timestamp 10 digit (seconds) atau 13 digit (milliseconds)')}`);
            }
            
            if (isNaN(date.getTime())) {
                return reply(`${font.smallCaps('Timestamp tidak valid')}`);
            }
            
            const result = `⏰ ${font.bold(font.smallCaps('Timestamp Converter'))}\n\n` +
                          `🔢 ${font.smallCaps('Input')}: ${timestamp} (${inputType})\n` +
                          `📅 ${font.smallCaps('Date')}: ${date.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}\n` +
                          `🌍 ${font.smallCaps('UTC')}: ${date.toUTCString()}\n` +
                          `📊 ${font.smallCaps('ISO')}: ${date.toISOString()}`;
            
            await reply(result);
        } catch (e) {
            await reply(`${font.smallCaps('Gagal mengkonversi timestamp. Pastikan format benar')}.`);
        }
    }
};
