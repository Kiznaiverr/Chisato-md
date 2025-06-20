import fetch from 'node-fetch';
import font from '../../lib/font.js';

export default {
  command: 'play',
  aliases: ['ytplay', 'playmp3'],
  tags: ['downloader', 'music'],
  help: ['<query>'],
  limit: false,
  premium: false,
  groupOnly: false,
  privateOnly: false,
  desc: 'play youtube audio',
  async execute(ctx) {
    const query = ctx.args.join(' ');
    if (!query) return ctx.reply(`${font.smallCaps('Masukkan judul atau kata kunci YouTube')}!`);
    await ctx.react('🕔');
    try {
      const url = `https://api.nekoyama.my.id/api/downloader/yt-play?query=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${font.smallCaps('Gagal fetch API')}`);
      const json = await res.json();
      if (json.status !== 'success' || !json.data) {
        await ctx.react('❌');
        return ctx.reply(`${font.smallCaps('Tidak ada hasil ditemukan')}!`);
      }
      const d = json.data;
      const caption = `${font.bold(font.smallCaps('YouTube Play Result'))}

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
      await ctx.sock.sendMessage(ctx.msg.key.remoteJid, {
        audio: { url: d.url },
        mimetype: 'audio/mp4',
        fileName: d.title + '.mp3',
        ptt: false
      }, { quoted: ctx.msg });
      await ctx.react('✅');
    } catch (e) {
      await ctx.react('❌');
      ctx.reply(`${font.smallCaps('Gagal mengambil audio YouTube')}!`);
    }
  }
};
