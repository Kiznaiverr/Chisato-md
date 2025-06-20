import axios from 'axios';
import { sticker } from '../../lib/sticker.js';
import font from '../../lib/font.js';

export default {
  command: 'brat',
  aliases: ['bratgen'],
  category: 'media',
  description: 'Generate brat style text sticker',
  usage: '<text>',
  cooldown: 5,
  async execute({ msg, sock, reply, react, args }) {
    try {
      const text = args.join(' ');
      
      if (!text) {
        return reply(`${font.smallCaps('Masukkan text yang ingin dibuat brat!')}\n\n${font.smallCaps('Contoh: .brat haii sayang')}`);
      }

      if (text.length > 50) {
        return reply(`${font.smallCaps('Text terlalu panjang! Maksimal 50 karakter')}`);
      }

      await react('🕔');

      const apiUrl = `https://api.nekoyama.my.id/api/brat/generate?text=${encodeURIComponent(text)}&video=false`;
      
      let json;
      try {
        const res = await axios.get(apiUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Node.js bot brat)',
            'Accept': 'application/json'
          },
          timeout: 30000
        });
        json = res.data;
      } catch (err) {
        throw new Error(`${font.smallCaps('Gagal menghubungi API Brat')}!`);
      }

      if (json.status !== 'success' || !json.data || !json.data.file_url) {
        throw new Error(`${font.smallCaps('Gagal generate brat image')}!`);
      }

      // Download the generated image
      let imageBuffer;
      try {
        const imageRes = await axios.get(json.data.file_url, {
          responseType: 'arraybuffer',
          timeout: 30000
        });
        imageBuffer = Buffer.from(imageRes.data);
      } catch (err) {
        throw new Error(`${font.smallCaps('Gagal download gambar brat')}!`);
      }

      // Convert to sticker
      let stickerBuffer;
      try {
        stickerBuffer = await sticker(imageBuffer, null, 'Chisato-MD', 'Kiznavierr', ['💚'], {
          'brat-text': text
        });
      } catch (err) {
        throw new Error(`${font.smallCaps('Gagal convert ke sticker')}!`);
      }

      await react('✅');
      await sock.sendMessage(msg.key.remoteJid, {
        sticker: stickerBuffer
      }, { quoted: msg });

    } catch (e) {
      console.error('Brat error:', e);
      await react('❌');
      reply(`${font.smallCaps('Gagal generate brat sticker')}! ${e.message || font.smallCaps('Silakan coba lagi')}`);
    }
  }
};
