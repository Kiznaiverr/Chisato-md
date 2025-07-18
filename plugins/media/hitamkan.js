import { imageEditor } from '../../lib/scraper/huggingface.js';
import { uploadToPomf2 } from '../../lib/scraper/pomf2.js';
import { downloadMediaMessage, getContentType } from '@whiskeysockets/baileys';
import font from '../../lib/font.js';
import fs from 'fs';

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
        uploadRes = await uploadToPomf2(buffer, 'photo.jpg');
      } catch (err) {
        throw new Error(`${font.smallCaps('Gagal upload ke CDN')}!`);
      }
      const cdnUrl = uploadRes?.data?.url || uploadRes?.url;
      if (!cdnUrl) throw new Error(`${font.smallCaps('Gagal upload ke CDN')}!`);

      const blackenPrompt = "make this image darker, increase black color, darken the image, apply black filter, make it look gothic and dark";
      const result = await imageEditor(cdnUrl, blackenPrompt);
      
      if (result.status !== 200 || !result.data || !result.data.filepath) {
        throw new Error(`${font.smallCaps('Gagal hitamkan gambar: ')} ${result.error || 'Unknown error'}`);
      }

      const blackenedImageBuffer = fs.readFileSync(result.data.filepath);

      await react('✅');
      await sock.sendMessage(msg.key.remoteJid, {
        image: blackenedImageBuffer,
        caption: `${font.smallCaps('Foto kamu sudah dihitamkan!')}\n${font.smallCaps('Model:')} ${result.data.model}\n\n${font.smallCaps('Powered by HuggingFace AI')}`
      }, { quoted: msg });

      try {
        fs.unlinkSync(result.data.filepath);
      } catch (cleanupErr) {
        console.log('Cleanup warning:', cleanupErr.message);
      }
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