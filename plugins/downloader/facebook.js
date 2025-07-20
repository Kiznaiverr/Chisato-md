import { facebookDownload } from '../../lib/scraper/facebook.js';
import font from '../../lib/font.js';

export default {
    command: 'facebook',
    aliases: ['fb', 'fbvid', 'fbdown'],
    category: 'downloader',
    description: 'Download video Facebook via link',
    usage: '<url>',
    limit: 1,
    cooldown: 5,

    async execute({ args, reply, sock, msg, react }) {
        if (!args[0]) {
            return reply(`${font.smallCaps('Masukkan link Facebook yang valid')}!\n${font.smallCaps('Contoh')}: .facebook https://www.facebook.com/share/v/1AcEg1sL7A/`);
        }

        await react('🕔');
        const url = args[0];
        
        try {
            console.log('Facebook: Starting download process for:', url);
            
            const result = await facebookDownload(url);
            
            if (result.status !== 200 || !result.data) {
                console.error('Facebook: Failed to get data:', result);
                await react('❌');
                return reply(`${font.smallCaps('Gagal mendapatkan data: ')} ${result.error || 'Unknown error'}`);
            }
            
            const { title, download_links, url: fburl } = result.data;
            
            const availableLinks = [
                { url: download_links.hd, label: 'HD' },
                { url: download_links.sd, label: 'SD' },
                { url: download_links.audio, label: 'Audio' }
            ].filter(link => link.url); 
            
            if (availableLinks.length === 0) {
                console.error('Facebook: No download links available');
                await react('❌');
                return reply(`${font.smallCaps('Tidak ada link video yang bisa diunduh')}.`);
            }
            
            let downloadSuccessful = false;
            let buffer = null;
            let usedLabel = '';
            
            for (const linkData of availableLinks) {
                try {
                    console.log(`Facebook: Trying ${linkData.label} quality:`, linkData.url);
                    
                    const videoRes = await fetch(linkData.url, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                            'Referer': 'https://getmyfb.com/',
                            'Accept': 'video/mp4,video/*,*/*'
                        },
                        timeout: 60000 // 60 detik timeout
                    });
                    
                    if (!videoRes.ok) {
                        console.error(`Facebook: ${linkData.label} download failed with status:`, videoRes.status);
                        continue; 
                    }
                    
                    const contentType = videoRes.headers.get('content-type');
                    console.log(`Facebook: ${linkData.label} Content-Type:`, contentType);
                    
                    if (!contentType || (!contentType.includes('video') && !contentType.includes('octet-stream') && !contentType.includes('audio'))) {
                        console.error(`Facebook: ${linkData.label} invalid content type:`, contentType);
                        continue; 
                    }
                    
                    const contentLength = videoRes.headers.get('content-length');
                    if (contentLength) {
                        const sizeInBytes = parseInt(contentLength);
                        if (sizeInBytes === 0) {
                            console.error(`Facebook: ${linkData.label} returned empty content`);
                            continue; 
                        }
                        if (sizeInBytes > 100 * 1024 * 1024) { // 100MB limit
                            console.log(`Facebook: ${linkData.label} too large (${sizeInBytes} bytes), trying next quality`);
                            continue; 
                        }
                        console.log(`Facebook: ${linkData.label} Content-Length:`, sizeInBytes, 'bytes');
                    }
                    
                    console.log(`Facebook: Converting ${linkData.label} to buffer...`);
                    buffer = Buffer.from(await videoRes.arrayBuffer());
                    
                    if (buffer.length === 0) {
                        console.error(`Facebook: ${linkData.label} downloaded file is empty`);
                        continue; 
                    }
                    
                    if (buffer.length < 1024) {
                        console.error(`Facebook: ${linkData.label} file too small (${buffer.length} bytes)`);
                        continue; 
                    }
                    
                    console.log(`Facebook: ${linkData.label} download successful, size:`, (buffer.length / 1024 / 1024).toFixed(2), 'MB');
                    downloadSuccessful = true;
                    usedLabel = linkData.label;
                    break; 
                    
                } catch (error) {
                    console.error(`Facebook: Error downloading ${linkData.label}:`, error.message);
                    continue; 
                }
            }
            
            if (!downloadSuccessful || !buffer) {
                console.error('Facebook: All download attempts failed');
                await react('❌');
                return reply(`${font.smallCaps('Gagal mengunduh video dari semua kualitas yang tersedia. Link mungkin sudah tidak valid.')}`);
            }
            
            await sock.sendMessage(msg.key.remoteJid, {
                video: buffer,
                caption: `${font.bold(font.smallCaps('FACEBOOK DOWNLOADER'))}\n• ${font.smallCaps('Judul')}: ${title || '-'}\n• ${font.smallCaps('Link')}: ${fburl}\n• ${font.smallCaps('Kualitas')}: ${usedLabel}\n\n${font.smallCaps('Powered by Local Scraper')}`,
                mimetype: 'video/mp4'
            }, { quoted: msg });
            
            console.log('Facebook: Video sent successfully');
            await react('✅');
            
        } catch (e) {
            console.error('Facebook error:', e);
            await react('❌');
            
            let errorMsg = `${font.smallCaps('Terjadi kesalahan saat memproses permintaan Facebook')}.`;
            
            if (e.message.includes('timeout')) {
                errorMsg = `${font.smallCaps('Timeout saat mengunduh video. Coba lagi atau gunakan link yang berbeda.')}.`;
            } else if (e.message.includes('Failed to download')) {
                errorMsg = `${font.smallCaps('Gagal mengunduh video. Link mungkin sudah tidak valid.')}.`;
            } else if (e.message.includes('Network')) {
                errorMsg = `${font.smallCaps('Masalah koneksi internet. Coba lagi nanti.')}.`;
            }
            
            return reply(errorMsg);
        }
    }
};
