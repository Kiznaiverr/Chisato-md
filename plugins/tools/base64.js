import font from '../../lib/font.js';

export default {
    command: 'base64',
    description: 'Encode or decode base64',
    category: 'tools',
    usage: '<encode/decode> <text>',
    cooldown: 2,
    async execute(context) {
        const { args, reply } = context;
        
        if (!args[0] || !args[1]) {
            return reply(`${font.smallCaps('Masukkan mode dan text')}\n\n${font.bold('Contoh')}:\n.base64 encode Hello World\n.base64 decode SGVsbG8gV29ybGQ=`);
        }
        
        const mode = args[0].toLowerCase();
        const text = args.slice(1).join(' ');
        
        if (mode !== 'encode' && mode !== 'decode') {
            return reply(`${font.smallCaps('Mode harus encode atau decode')}\n\n${font.bold('Contoh')}:\n.base64 encode Hello World\n.base64 decode SGVsbG8gV29ybGQ=`);
        }
        
        try {
            let result;
            let resultText;
            
            if (mode === 'encode') {
                result = Buffer.from(text, 'utf8').toString('base64');
                resultText = `🔐 ${font.bold(font.smallCaps('Base64 Encoder'))}\n\n` +
                            `📝 ${font.smallCaps('Original')}: ${text}\n` +
                            `🔑 ${font.bold('Encoded')}: \`${result}\``;
            } else {
                result = Buffer.from(text, 'base64').toString('utf8');
                resultText = `🔓 ${font.bold(font.smallCaps('Base64 Decoder'))}\n\n` +
                            `🔐 ${font.smallCaps('Encoded')}: ${text}\n` +
                            `📝 ${font.bold('Decoded')}: \`${result}\``;
            }
            
            await reply(resultText);
        } catch (e) {
            await reply(`${font.smallCaps('Gagal')} ${mode} ${font.smallCaps('text. Pastikan format base64 benar untuk decode')}.`);
        }
    }
};
