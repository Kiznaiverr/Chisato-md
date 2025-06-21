import axios from 'axios';
import { uploadToChisatoCDN } from '../../lib/chisato-CDN.js';
import { downloadMediaMessage, getContentType } from '@whiskeysockets/baileys';
import font from '../../lib/font.js';

export default {
  command: 'hitamkan',
  aliases: ['blacken'],
  category: 'media',
  description: 'Hitamkan foto (Blacken Image)',
  usage: '',
  cooldown: 10,
  async execute({ msg, sock, reply, react }) {
    try {
      await react('🕔');
      let mediaMessage = null;
      let downloadMessage = null;
      const messageType = getContentType(msg.message);
      if (messageType === 'imageMessage') {
        mediaMessage = msg.message[messageType];
        downloadMessage = msg;
      } else if (messageType === 'documentMessage' && msg.message.documentMessage.mimetype?.startsWith('image/')) {
        mediaMessage = msg.message.documentMessage;
        downloadMessage = msg;
      } else {
        const quotedMessage = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quotedMessage) {
          return reply(`${font.smallCaps('Kirim atau balas gambar dengan perintah .hitamkan')}`);
        }
        const quotedType = getContentType(quotedMessage);
        if (quotedType === 'imageMessage') {
          mediaMessage = quotedMessage[quotedType];
          downloadMessage = {
            key: {
              remoteJid: msg.key.remoteJid,
              id: msg.message.extendedTextMessage.contextInfo.stanzaId,
              participant: msg.message.extendedTextMessage.contextInfo.participant
            },
            message: quotedMessage
          };
        } else if (quotedType === 'documentMessage' && quotedMessage.documentMessage.mimetype?.startsWith('image/')) {
          mediaMessage = quotedMessage.documentMessage;
          downloadMessage = {
            key: {
              remoteJid: msg.key.remoteJid,
              id: msg.message.extendedTextMessage.contextInfo.stanzaId,
              participant: msg.message.extendedTextMessage.contextInfo.participant
            },
            message: quotedMessage
          };
        } else {
          return reply(`${font.smallCaps('File yang dibalas bukan gambar. Kirim atau balas gambar dengan perintah .hitamkan')}`);
        }
      }
      if (!mediaMessage) {
        return reply(`${font.smallCaps('Kirim atau balas gambar dengan perintah .hitamkan')}`);
      }
      let buffer = await downloadMediaMessage(downloadMessage, sock);
      if (buffer && typeof buffer.read === 'function') {
        buffer = await streamToBuffer(buffer);
      }
      if (!buffer || buffer.length === 0) {
        throw new Error(`${font.smallCaps('Gagal mengunduh gambar dari WhatsApp')}!`);
      }
      let uploadRes;
      try {
        uploadRes = await uploadToChisatoCDN(buffer, 'photo.jpg');
      } catch (err) {
        throw new Error(`${font.smallCaps('Gagal upload ke CDN')}!`);
      }
      const cdnUrl = uploadRes?.data?.url || uploadRes?.url;
      if (!cdnUrl) throw new Error(`${font.smallCaps('Gagal upload ke CDN')}!`);
      const apiUrl = `https://api.nekoyama.my.id/api/images/hitamkan?url=${encodeURIComponent(cdnUrl)}`;
      let json;
      try {
        const res = await axios.get(apiUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Node.js bot hitamkan)',
            'Accept': 'application/json'
          },
          timeout: 60000
        });
        json = res.data;
      } catch (err) {
        throw new Error(`${font.smallCaps('Gagal menghubungi API Hitamkan')}!`);
      }
      if (json.status !== 'success' || !json.data || !json.data.download_url) throw new Error(`${font.smallCaps('Gagal hitamkan gambar')}!`);
      await react('✅');
      await sock.sendMessage(msg.key.remoteJid, {
        image: { url: json.data.download_url },
        caption: `🖤 ${font.smallCaps('Foto kamu sudah dihitamkan!')}\n\n${font.smallCaps('Powered by Chisato API')}`
      }, { quoted: msg });
    } catch (e) {
      console.error('Hitamkan error:', e);
      await react('❌');
      reply(`${font.smallCaps('Gagal hitamkan gambar. Pastikan file yang dikirim adalah gambar dan coba lagi')}!`);
    }
  }
};

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}