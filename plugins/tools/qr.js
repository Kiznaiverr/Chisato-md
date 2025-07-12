import fetch from 'node-fetch';
import font from '../../lib/font.js';

export default {
    command: 'qr',
    description: 'Generate QR Code from text',
    category: 'tools',
    usage: '<text>',
    cooldown: 3,
    async execute(context) {
        const { args, reply, sock, msg } = context;
        
        if (!args[0]) {
            return reply(`${font.smallCaps('Masukkan text yang ingin dijadikan QR Code')}\n\n${font.bold('Contoh')}: .qr Hello World`);
        }
        
        const text = args.join(' ');
        
        try {
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(text)}`;
            
            const response = await fetch(qrUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const arrayBuffer = await response.arrayBuffer();
            const imageBuffer = Buffer.from(arrayBuffer);
            
            await sock.sendMessage(msg.key.remoteJid, {
                image: imageBuffer,
                caption: `✅ ${font.bold(font.smallCaps('QR Code Generated'))}\n\n📝 ${font.smallCaps('Text')}: ${text}\n\n💡 ${font.smallCaps('Scan QR code diatas untuk melihat hasilnya')}`
            }, { quoted: msg });
            
        } catch (e) {
            console.error('QR Code error:', e);
            await reply(`${font.smallCaps('Gagal membuat QR Code, coba lagi nanti')}.`);
        }
    }
};
