import fetch from 'node-fetch';
import { uploadToChisatoCDN } from '../../lib/chisato-CDN.js';

export default {
  command: 'remini',
  aliases: ['hd'],
  category: 'tools',
  description: 'Enhance photo',
  usage: '.remini (kirim atau reply gambar)',
  cooldown: 10,
  async execute({ msg, sock, reply, react }) {
    try {
      // Deteksi gambar dari reply atau pesan utama
      let imageMsg, imageContext;
      if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
        imageMsg = msg.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage;
        imageContext = {
          key: {
            ...msg.key,
            id: msg.message.extendedTextMessage.contextInfo.stanzaId,
            remoteJid: msg.key.remoteJid,
            fromMe: false
          },
          message: msg.message.extendedTextMessage.contextInfo.quotedMessage
        };
      } else if (msg.message?.imageMessage) {
        imageMsg = msg.message.imageMessage;
        imageContext = msg;
      }
      if (!imageMsg) return reply('Kirim atau balas gambar dengan perintah .remini');
      await react('🕔');
      // Download gambar
      const stream = await sock.downloadMediaMessage(imageContext, 'buffer');
      // Upload ke CDN
      const uploadRes = await uploadToChisatoCDN(stream, 'photo.jpg');
      if (!uploadRes || !uploadRes.url) throw new Error('Gagal upload ke CDN!');
      // Proses ke API Remini
      const apiUrl = `https://api.nekoyama.my.id/api/images/remini?url=${encodeURIComponent(uploadRes.url)}`;
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error('Gagal menghubungi API Remini!');
      const json = await res.json();
      if (json.status !== 'success' || !json.data || !json.data.enhanced_image_url) throw new Error('Gagal enhance gambar!');
      // Kirim hasil ke user
      await sock.sendMessage(msg.key.remoteJid, {
        image: { url: json.data.enhanced_image_url },
        caption: '✨ Foto kamu sudah diperjelas! Semoga makin cakep ya~\n\nPowered by Chisato API'
      }, { quoted: msg });
      await react('✅');
    } catch (e) {
      await react('❌');
      reply('Gagal enhance gambar. Kirim atau balas gambar lalu coba lagi!');
    }
  }
};
