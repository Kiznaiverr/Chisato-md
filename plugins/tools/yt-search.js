import fetch from 'node-fetch';

export default {
  command: 'ytsearch',
  aliases: ['yt-search', 'yts'],
  tags: ['tools'],
  help: ['ytsearch <query>'],
  limit: 1,
  premium: false,
  groupOnly: false,
  privateOnly: false,
  desc: 'Cari video YouTube dan kirim thumbnail + info',
  async execute(ctx) {
    const query = ctx.args.join(' ');
    if (!query) return ctx.reply('Masukkan kata kunci pencarian YouTube!');
    try {
      const url = `https://api.nekoyama.my.id/api/tools/yt-search?query=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Gagal fetch API');
      const json = await res.json();
      if (json.status !== 'success' || !json.data) return ctx.reply('Tidak ada hasil ditemukan!');
      const d = json.data;
      const caption = `*YouTube Search Result*

*Judul:* ${d.title}
*Durasi:* ${d.duration}
*Video ID:* ${d.video_id}
*URL:* ${d.url}

Powered by: ${json.powered_by}`;
      await ctx.sock.sendMessage(ctx.msg.key.remoteJid, {
        image: { url: d.thumbnail },
        caption,
        jpegThumbnail: undefined
      }, { quoted: ctx.msg });
    } catch (e) {
      ctx.reply('Gagal mengambil data YouTube!');
    }
  }
};
