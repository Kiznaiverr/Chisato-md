import axios from 'axios';
import { getContentType, downloadMediaMessage } from '@whiskeysockets/baileys';
import font from '../../lib/font.js';
import FormData from 'form-data';

export default {
  command: 'tourl',
  aliases: ['tourl', 'urlmaker', 'up2url'],
  tags: ['tools'],
  help: ['(reply/kirim media dengan caption .tourl)'],
  limit: false,
  premium: false,
  groupOnly: false,
  privateOnly: false,
  desc: 'Upload media jadi link url',
  async execute(ctx) {
    const { msg, reply, react, sock } = ctx;
    let mediaMsg = null;
    let mediaType = null;
    let downloadMsg = null;

    // Cek jika reply ke media
    if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
      const quoted = msg.message.extendedTextMessage.contextInfo.quotedMessage;
      const quotedType = getContentType(quoted);
      if (/image|video|audio|document/i.test(quotedType)) {
        mediaMsg = quoted[quotedType];
        mediaType = quotedType;
        downloadMsg = {
          key: {
            remoteJid: msg.key.remoteJid,
            id: msg.message.extendedTextMessage.contextInfo.stanzaId,
            participant: msg.message.extendedTextMessage.contextInfo.participant
          },
          message: quoted
        };
      }
    }

    // Jika tidak reply, cek apakah pesan utama adalah media dengan caption mengandung .tourl
    if (!mediaMsg) {
      const mainType = getContentType(msg.message);
      if (/image|video|audio|document/i.test(mainType) && (msg.text?.toLowerCase().includes('tourl') || msg.message[mainType]?.caption?.toLowerCase().includes('tourl'))) {
        mediaMsg = msg.message[mainType];
        mediaType = mainType;
        downloadMsg = msg;
      }
    }

    if (!mediaMsg || !/image|video|audio|document/i.test(mediaType)) {
      return reply(`${font.smallCaps('Reply atau kirim media dengan caption .tourl')}.`);
    }

    await react('🕔');
    try {
      let buffer = await downloadMediaMessage(downloadMsg, sock);
      if (buffer && typeof buffer.read === 'function') {
        // stream to buffer
        const chunks = [];
        for await (const chunk of buffer) chunks.push(chunk);
        buffer = Buffer.concat(chunks);
      }
      if (!buffer || buffer.length === 0) throw new Error('Download buffer kosong');

      // Tentukan ekstensi file
      let ext = 'bin';
      if (mediaType === 'imageMessage') ext = 'jpg';
      else if (mediaType === 'videoMessage') ext = 'mp4';
      else if (mediaType === 'audioMessage') ext = 'mp3';
      else if (mediaType === 'documentMessage') ext = 'bin';

      // Gunakan FormData dari form-data (seperti chisatoCDN)
      const form = new FormData();
      form.append('files[]', buffer, `upload.${ext}`);

      const res = await axios.post('https://pomf2.lain.la/upload.php', form, {
        headers: {
          ...form.getHeaders(),
          'dnt': '1',
          'referer': 'https://pomf2.lain.la/',
          'user-agent': 'Mozilla/5.0 (compatible; ChisatoBot/1.0)'
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      const json = res.data;
      if (!json.success || !json.files?.[0]?.url) {
        await react('❌');
        return reply(`${font.smallCaps('Gagal upload media ke url')}.`);
      }
      await react('✅');
      reply(`${font.bold(font.smallCaps('UPLOAD SUCCESS'))}\n${json.files[0].url}`);
    } catch (e) {
      await react('❌');
      console.error('TOURL ERROR:', e);
      reply(`${font.smallCaps('Gagal upload media ke url')}.`);
    }
  }
};
