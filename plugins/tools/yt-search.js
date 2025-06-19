import fetch from 'node-fetch';
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
      const url = `https://api.nekoyama.my.id/api/tools/yt-search?query=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${font.smallCaps('Gagal fetch API')}`);
      const json = await res.json();
      if (json.status !== 'success' || !json.data) return ctx.reply(`${font.smallCaps('Tidak ada hasil ditemukan')}!`);
      const d = json.data;
      const caption = `${font.bold(font.smallCaps('YouTube Search Result'))}

${font.bold(font.smallCaps('Judul'))}: ${d.title}
${font.bold(font.smallCaps('Durasi'))}: ${d.duration}
${font.bold(font.smallCaps('Video ID'))}: ${d.video_id}
${font.bold(font.smallCaps('URL'))}: ${d.url}

${font.smallCaps('Powered by')}: ${json.powered_by}`;
      await ctx.sock.sendMessage(ctx.msg.key.remoteJid, {
        image: { url: d.thumbnail },
        caption,
        jpegThumbnail: undefined
      }, { quoted: ctx.msg });
    } catch (e) {
      ctx.reply(`${font.smallCaps('Gagal mengambil data YouTube')}!`);
    }
  }
};
