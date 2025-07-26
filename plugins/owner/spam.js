import { convertToSmallCaps } from '../../lib/font.js';
import fs from 'fs';
import path from 'path';

export default {
    command: 'spam',
    aliases: ['spamstiker', 'stickerflood'],
    category: 'owner',
    description: 'Kirim semua stiker dari direktori lib/spam',
    usage: '<target> <jumlah> atau ketik "all" untuk semua stiker',
    ownerOnly: true,
    cooldown: 10,
    
    async execute(context) {
        const { reply, args, sock } = context;
        
        try {
            const spamDir = path.join(process.cwd(), 'lib', 'spam');
            
            if (!fs.existsSync(spamDir)) {
                return await reply(convertToSmallCaps('❌ Direktori lib/spam tidak ditemukan!'));
            }
            
            const files = fs.readdirSync(spamDir).filter(file => 
                file.toLowerCase().endsWith('.webp')
            );
            
            if (files.length === 0) {
                return await reply(convertToSmallCaps('❌ Tidak ada file stiker (.webp) ditemukan di lib/spam!'));
            }
            
            if (!args[0]) {
                return await reply(convertToSmallCaps('❌ Silakan masukkan nomor target!\nContoh: .spam 6287863806293 10'));
            }
            
            let target = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            let count;
            
            if (args[1] === 'all' || args[1] === 'semua') {
                count = files.length;
            } else if (args[1] && !isNaN(args[1])) {
                count = parseInt(args[1]);
            } else {
                count = 5;
            }
            
            await reply(convertToSmallCaps(`🚀 Mengirim ${count} stiker dari ${files.length} stiker yang tersedia ke ${target.split('@')[0]}...`));
            
            for (let i = 0; i < count; i++) {
                const filePath = path.join(spamDir, files[i]);
                
                try {
                    const stickerBuffer = fs.readFileSync(filePath);
                    
                    await sock.sendMessage(target, {
                        sticker: stickerBuffer
                    });
                    
                    if (i < count - 1) {
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }
                } catch (error) {
                    console.error(`Error mengirim stiker ${files[i]}:`, error);
                }
            }
            
            await reply(convertToSmallCaps(`✅ Berhasil mengirim ${count} stiker ke ${target.split('@')[0]}!`));
            
        } catch (error) {
            console.error('Error dalam plugin spam:', error);
            await reply(convertToSmallCaps('❌ Terjadi kesalahan saat mengirim stiker spam!'));
        }
    }
};
