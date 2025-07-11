import crypto from 'crypto';
import font from '../../lib/font.js';

export default {
    command: 'hash',
    description: 'Generate hash from text (MD5, SHA1, SHA256)',
    category: 'tools',
    usage: '<text> [type: md5/sha1/sha256]',
    cooldown: 2,
    async execute(context) {
        const { args, reply } = context;
        
        if (!args[0]) {
            return reply(`${font.smallCaps('Masukkan text yang ingin di-hash')}\n\n${font.bold('Contoh')}: .hash Hello World md5`);
        }
        
        const text = args.slice(0, -1).join(' ') || args.join(' ');
        const hashType = args[args.length - 1]?.toLowerCase();
        
        let validTypes = ['md5', 'sha1', 'sha256'];
        let type = validTypes.includes(hashType) ? hashType : 'md5';
        
        // If last arg is not a hash type, include it in text
        if (!validTypes.includes(hashType)) {
            const fullText = args.join(' ');
            try {
                const md5 = crypto.createHash('md5').update(fullText).digest('hex');
                const sha1 = crypto.createHash('sha1').update(fullText).digest('hex');
                const sha256 = crypto.createHash('sha256').update(fullText).digest('hex');
                
                const result = `🔐 ${font.bold(font.smallCaps('Hash Generator'))}\n\n` +
                              `📝 ${font.smallCaps('Text')}: ${fullText}\n\n` +
                              `🔹 ${font.bold('MD5')}: \`${md5}\`\n\n` +
                              `🔸 ${font.bold('SHA1')}: \`${sha1}\`\n\n` +
                              `🔷 ${font.bold('SHA256')}: \`${sha256}\``;
                
                return reply(result);
            } catch (e) {
                return reply(`${font.smallCaps('Gagal membuat hash, coba lagi')}.`);
            }
        }
        
        try {
            const hash = crypto.createHash(type).update(text).digest('hex');
            
            const result = `🔐 ${font.bold(font.smallCaps('Hash Generator'))}\n\n` +
                          `📝 ${font.smallCaps('Text')}: ${text}\n` +
                          `🔧 ${font.smallCaps('Type')}: ${type.toUpperCase()}\n` +
                          `🔑 ${font.bold('Hash')}: \`${hash}\``;
            
            await reply(result);
        } catch (e) {
            await reply(`${font.smallCaps('Gagal membuat hash, coba lagi')}.`);
        }
    }
};
