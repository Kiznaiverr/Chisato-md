import { youtubeSearch, youtubeAudio } from '../../lib/scraper/youtube.js';
import font from '../../lib/font.js';

export default {
  command: 'play',
  aliases: ['ytplay', 'playmp3'],
  category: 'downloader',
  description: 'Play audio YouTube dari query pencarian',
  usage: '<query>',
  limit: 1,
  cooldown: 10,

  async execute({ args, reply, sock, msg, react }) {
    const query = args.join(' ');
    if (!query) {
      return reply(`${font.smallCaps('Masukkan judul atau kata kunci YouTube')}!\n\n` +
                  `${font.smallCaps('Contoh')}: .play viva la vida`);
    }

    await react('🕔');
    
    try {
      await react('🔍');
      
      // Search for the video
      const searchResult = await youtubeSearch(query);
      
      await react('📊');
      
      // Send thumbnail with metadata
      const caption = `${font.smallCaps('🎵 Audio ditemukan!')}\n\n` +
                     `${font.smallCaps('📝 Judul')}: ${searchResult.title}\n` +
                     `${font.smallCaps('👤 Channel')}: ${searchResult.author}\n` +
                     `${font.smallCaps('⏱️ Durasi')}: ${searchResult.duration}\n` +
                     `${font.smallCaps('👁️ Views')}: ${searchResult.views}\n\n` +
                     `${font.smallCaps('⏳ Sedang mendownload...')}`;

      await sock.sendMessage(msg.key.remoteJid, {
        image: { url: searchResult.thumbnail },
        caption
      }, { quoted: msg });

      await react('⬇️');
      
      // Download audio
      const audioData = await youtubeAudio(searchResult.url, 'highest');
      
      if (!audioData.success || !audioData.buffer) {
        await react('❌');
        return reply(font.smallCaps('Gagal mendownload audio. Silakan coba lagi.'));
      }
      
      // Check file size (max 100MB for WhatsApp)
      const sizeInMB = audioData.buffer.length / 1024 / 1024;
      if (sizeInMB > 100) {
        await react('⚠️');
        return reply(`${font.smallCaps('File terlalu besar')} (${audioData.size})!\n\n` +
                    `${font.smallCaps('Coba dengan kata kunci yang lebih spesifik atau video yang lebih pendek')}.`);
      }

      await react('✅');
      
      // Send audio
      const audioCaption = `${font.smallCaps('✅ Audio berhasil didownload!')}\n\n` +
                          `${font.smallCaps('📝 Judul')}: ${audioData.title}\n` +
                          `${font.smallCaps('👤 Channel')}: ${audioData.author}\n` +
                          `${font.smallCaps('🎵 Bitrate')}: ${audioData.bitrate}\n` +
                          `${font.smallCaps('📦 Ukuran')}: ${audioData.size}\n` +
                          `${font.smallCaps('🗂️ Format')}: ${audioData.container}`;

      await sock.sendMessage(msg.key.remoteJid, {
        audio: audioData.buffer,
        caption: audioCaption,
        mimetype: 'audio/mp4',
        fileName: `${audioData.title.substring(0, 50)}.${audioData.container}`
      }, { quoted: msg });

    } catch (error) {
      await react('❌');
      console.error('Play Error:', error);
      
      reply(font.smallCaps('Gagal mencari atau mendownload audio!'));
    }
  }
};
