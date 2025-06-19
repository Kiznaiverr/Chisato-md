import fetch from 'node-fetch';

export default {
  command: 'play',
  aliases: ['ytplay', 'playmp3'],
  tags: ['downloader', 'music'],
  help: ['play <query>'],
  limit: false,
  premium: false,
  groupOnly: false,
  privateOnly: false,
  desc: 'play youtube audio',
  async execute(ctx) {
    const query = ctx.args.join(' ');
    if (!query) return ctx.reply('Masukkan judul atau kata kunci YouTube!');
    await ctx.react('🕔');
    try {
      const url = `https://api.nekoyama.my.id/api/downloader/yt-play?query=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Gagal fetch API');
      const json = await res.json();
      if (json.status !== 'success' || !json.data) {
        await ctx.react('❌');
        return ctx.reply('Tidak ada hasil ditemukan!');
      }
      const d = json.data;
      const caption = `*YouTube Play Result*

*Judul:* ${d.title}
*Durasi:* ${d.duration}
*Video ID:* ${d.video_id}
*URL:* ${d.url}

Powered by: ${json.powered_by}`;
      // Kirim thumbnail + caption
      await ctx.sock.sendMessage(ctx.msg.key.remoteJid, {
        image: { url: d.thumbnail },
        caption,
        jpegThumbnail: undefined
      }, { quoted: ctx.msg });
      // Kirim audio
      await ctx.sock.sendMessage(ctx.msg.key.remoteJid, {
        audio: { url: d.url },
        mimetype: 'audio/mp4',
        fileName: d.title + '.mp3',
        ptt: false
      }, { quoted: ctx.msg });
      await ctx.react('✅');
    } catch (e) {
      await ctx.react('❌');
      ctx.reply('Gagal mengambil audio YouTube!');
    }
  }
};
