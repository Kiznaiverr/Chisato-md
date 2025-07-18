import axios from 'axios';
import { uploadToPomf2 } from '../../lib/scraper/pomf2.js';
import { imageEnhancerV2 } from '../../lib/scraper/huggingface.js';
import { downloadMediaMessage, getContentType } from '@whiskeysockets/baileys';
import font from '../../lib/font.js';
import fs from 'fs';

export default {
  command: 'remini',
  aliases: ['hd'],
  category: 'media',
  description: 'Enhance photo (Remini AI)',
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
          return reply(`${font.smallCaps('Kirim atau balas gambar dengan perintah .remini')}`);
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
          return reply(`${font.smallCaps('File yang dibalas bukan gambar. Kirim atau balas gambar dengan perintah .remini')}`);
        }
      }

      if (!mediaMessage) {
        return reply(`${font.smallCaps('Kirim atau balas gambar dengan perintah .remini')}`);
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
      
      let enhancedImageUrl = null;
      let apiMethod = 'API';
      
      // Try API first
      try {
        const apiUrl = `https://api.nekoyama.my.id/api/images/remini?url=${encodeURIComponent(cdnUrl)}`;
        const res = await axios.get(apiUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Node.js bot remini)',
            'Accept': 'application/json'
          },
          timeout: 60000
        });
        const json = res.data;
        
        if (json.status === 'success' && json.data && json.data.enhanced_image_url) {
          enhancedImageUrl = json.data.enhanced_image_url;
          apiMethod = 'Chisato API';
        } else {
          throw new Error('API response invalid');
        }
      } catch (apiError) {
        console.log('API failed, trying fallback with imageEnhancerV2:', apiError.message);
        
        // Fallback to imageEnhancerV2
        try {
          const result = await imageEnhancerV2(cdnUrl, {
            upscale_factor: 2,
            denoise_strength: 0.4,
            num_inference_steps: 20
          });
          
          if (result.status === 200 && result.data && result.data.filepath) {
            // Read the enhanced image file
            const enhancedImageBuffer = fs.readFileSync(result.data.filepath);
            
            await react('✅');
            await sock.sendMessage(msg.key.remoteJid, {
              image: enhancedImageBuffer,
              caption: `✨ ${font.smallCaps('Foto kamu sudah diperjelas dengan AI Enhancer V2!')}\n${font.smallCaps('Model:')} ${result.data.model}\n${font.smallCaps('Upscale:')} ${result.data.upscale_factor}x\n\n${font.smallCaps('Powered by HuggingFace AI')}`
            }, { quoted: msg });
            
            // Clean up temporary file
            try {
              fs.unlinkSync(result.data.filepath);
            } catch (cleanupErr) {
              console.log('Cleanup warning:', cleanupErr.message);
            }
            
            return; // Exit early since we successfully processed with fallback
          } else {
            throw new Error(result.error || 'ImageEnhancerV2 failed');
          }
        } catch (fallbackError) {
          console.error('Both API and fallback failed:', fallbackError.message);
          throw new Error(`${font.smallCaps('Gagal enhance gambar dengan kedua metode')}`);
        }
      }
      
      // If API succeeded, send the result
      if (enhancedImageUrl) {
        await react('✅');
        await sock.sendMessage(msg.key.remoteJid, {
          image: { url: enhancedImageUrl },
          caption: `✨ ${font.smallCaps('Foto kamu sudah diperjelas!')}\n\n${font.smallCaps('Powered by')} ${apiMethod}`
        }, { quoted: msg });
      }
    } catch (e) {
      console.error('Remini error:', e);
      await react('❌');
      reply(`${font.smallCaps('Gagal enhance gambar. Pastikan file yang dikirim adalah gambar dan coba lagi')}!`);
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
