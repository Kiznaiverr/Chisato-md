import axios from 'axios';
import { video2webp } from '../../lib/sticker.js';
import font from '../../lib/font.js';

export default {
  command: 'bratvid',
  aliases: ['bratgif', 'bratv'],
  category: 'media',
  description: 'Generate animated brat style text sticker',
  usage: '<text> [speed]',
  cooldown: 10,
  async execute({ msg, sock, reply, react, args }) {
    try {
      const text = args.slice(0, -1).join(' ') || args.join(' ');
      let speed = 'medium';
      
      const lastArg = args[args.length - 1]?.toLowerCase();
      if (['slow', 'medium', 'fast'].includes(lastArg)) {
        speed = lastArg;
        if (args.length > 1) {
          const textArgs = args.slice(0, -1);
          if (textArgs.length > 0) {
            text = textArgs.join(' ');
          }
        }
      }
      
      if (!text || text === speed) {
        return reply(`${font.smallCaps('Masukkan text yang ingin dibuat brat video!')}\n\n${font.smallCaps('Contoh: .bratvid haii sayang')}\n${font.smallCaps('Dengan speed: .bratvid haii sayang fast')}\n\n${font.smallCaps('Speed: slow, medium, fast')}`);
      }

      if (text.length > 100) {
        return reply(`${font.smallCaps('Text terlalu panjang! Maksimal 100 karakter')}`);
      }

      await react('🕔');

      const apiUrl = `https://api.nekoyama.my.id/api/brat/generate?text=${encodeURIComponent(text)}&video=true&speed=${speed}`;
      
      let json;
      try {
        const res = await axios.get(apiUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Node.js bot bratvid)',
            'Accept': 'application/json'
          },
          timeout: 60000
        });
        json = res.data;
      } catch (err) {
        throw new Error(`${font.smallCaps('Gagal menghubungi API Brat')}!`);
      }

      if (json.status !== 'success' || !json.data || !json.data.file_url) {
        throw new Error(`${font.smallCaps('Gagal generate brat video')}!`);
      }

      // Download the generated GIF
      let gifBuffer;
      try {
        const gifRes = await axios.get(json.data.file_url, {
          responseType: 'arraybuffer',
          timeout: 60000
        });
        gifBuffer = Buffer.from(gifRes.data);
      } catch (err) {
        throw new Error(`${font.smallCaps('Gagal download GIF brat')}!`);
      }

      // Convert GIF to animated WebP sticker
      let stickerBuffer;
      try {
        const fps = speed === 'fast' ? 20 : speed === 'slow' ? 10 : 15;
        stickerBuffer = await video2webp(gifBuffer, fps);
      } catch (err) {
        throw new Error(`${font.smallCaps('Gagal convert ke animated sticker')}!`);
      }

      await react('✅');
      await sock.sendMessage(msg.key.remoteJid, {
        sticker: stickerBuffer
      }, { quoted: msg });

    } catch (e) {
      console.error('BratVid error:', e);
      await react('❌');
      reply(`${font.smallCaps('Gagal generate brat video sticker')}! ${e.message || font.smallCaps('Silakan coba lagi')}`);
    }
  }
};
