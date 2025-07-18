import { youtubeSearch } from '../../lib/scraper/youtube.js';
import font from '../../lib/font.js';

export default {
  command: 'ytsearch',
  aliases: ['yt-search', 'yts'],
  tags: ['tools'],
  help: ['<query>'],
  limit: 1,
  premium: false,
  groupOnly: false,
  privateOnly: false,
  desc: 'Cari video YouTube dan kirim thumbnail + info',
  async execute(ctx) {
    const query = ctx.args.join(' ');
    if (!query) return ctx.reply(`${font.smallCaps('Masukkan kata kunci pencarian YouTube')}!`);
    try {
      const data = await youtubeSearch(query);
      
      const videoId = data.url.split('v=')[1]?.split('&')[0] || 'N/A';
      const caption = `${font.bold(font.smallCaps('YouTube Search Result'))}

${font.bold(font.smallCaps('Judul'))}: ${data.title}
${font.bold(font.smallCaps('Durasi'))}: ${data.duration}
${font.bold(font.smallCaps('Video ID'))}: ${videoId}
${font.bold(font.smallCaps('Views'))}: ${data.views}
${font.bold(font.smallCaps('Author'))}: ${data.author}
${font.bold(font.smallCaps('Upload'))}: ${data.ago}
${font.bold(font.smallCaps('URL'))}: ${data.url}`;

      await ctx.sock.sendMessage(ctx.msg.key.remoteJid, {
        image: { url: data.thumbnail },
        caption,
        jpegThumbnail: undefined
      }, { quoted: ctx.msg });
    } catch (e) {
      console.error('YT Search error:', e);
      ctx.reply(`${font.smallCaps('Gagal mengambil data YouTube')}: ${e.message}`);
    }
  }
};
