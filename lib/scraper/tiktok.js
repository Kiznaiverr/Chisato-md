import axios from 'axios';
import * as qs from 'qs';

/**
 * Validate TikTok URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid TikTok URL
 */
function isValidTikTokUrl(url) {
    try {
        const urlObj = new URL(url);
        const validHosts = ['tiktok.com', 'www.tiktok.com', 'vm.tiktok.com', 'm.tiktok.com'];
        return validHosts.some(host => urlObj.hostname === host || urlObj.hostname.endsWith('.' + host));
    } catch {
        return false;
    }
}

/**
 * Scrape download links from TikTok video
 * @param {string} tiktokUrl - TikTok video URL
 * @returns {Object} Download links data
 */
async function scrapeDownloadLinks(tiktokUrl) {
    try {
        const endpoint = 'https://www.tikwm.com/api/';
        const headers = {
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
            'accept': 'application/json, text/javascript, */*; q=0.01',
            'referer': 'https://www.tikwm.com/',
            'origin': 'https://www.tikwm.com',
            'cookie': 'current_language=en; _ga_5370HT04Z3=GS2.1.s1749487245$o1$g0$t1749487245$j60$l0$h0; _ga=GA1.1.196118595.1749487246; _gcl_au=1.1.550796947.1749487246',
            'x-requested-with': 'XMLHttpRequest'
        };

        const payload = qs.stringify({
            url: tiktokUrl
        });

        const response = await axios.post(endpoint, payload, { 
            headers: headers,
            timeout: 30000
        });

        if (response.data && response.data.code === 0) {
            const data = response.data.data;
            return {
                title: data.title,
                thumbnail: data.cover,
                videoUrl: data.play,
                audioUrl: data.music
            };
        }

        throw new Error('Failed to scrape download links');
    } catch (error) {
        console.error('TikTok scraping error:', error.response ? error.response.data : error.message);
        throw new Error('Failed to scrape download links');
    }
}

/**
 * Download TikTok video
 * @param {string} url - TikTok video URL
 * @returns {Object} Response object with status code and data
 */
async function tiktokDownload(url) {
    try {
        if (!url || typeof url !== 'string' || url.trim().length === 0) {
            return {
                status: 500,
                error: 'TikTok URL is required and must be a non-empty string'
            };
        }

        if (!isValidTikTokUrl(url)) {
            return {
                status: 500,
                error: 'Invalid TikTok URL'
            };
        }

        const downloadData = await scrapeDownloadLinks(url);
        
        if (!downloadData.videoUrl && !downloadData.audioUrl) {
            return {
                status: 500,
                error: 'No downloadable content found for this TikTok URL'
            };
        }

        return {
            status: 200,
            data: {
                url: url,
                title: downloadData.title || 'TikTok Video',
                thumbnail: downloadData.thumbnail,
                download_links: {
                    video: downloadData.videoUrl || null,
                    audio: downloadData.audioUrl || null
                },
                timestamp: new Date().toLocaleString('id-ID', {
                    timeZone: 'Asia/Jakarta',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })
            }
        };

    } catch (error) {
        return {
            status: 500,
            error: error.message || 'Failed to download TikTok video'
        };
    }
}

export { tiktokDownload, isValidTikTokUrl };