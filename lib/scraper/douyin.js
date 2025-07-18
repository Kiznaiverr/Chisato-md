import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Validate Douyin text or URL
 * @param {string} text - Text or URL to validate
 * @returns {boolean} True if valid Douyin text/URL
 */
function isValidDouyinText(text) {
    if (!text || typeof text !== 'string') {
        return false;
    }
    
    // Check for Douyin patterns
    const douyinPatterns = [
        /douyin\.com/i,
        /v\.douyin\.com/i,
        /复制此链接/i,
        /打开Dou音/i,
        /#.*#/,  // Hashtag pattern
        /[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}\s+[a-zA-Z0-9\/]+/  // Generic pattern for shared text
    ];
    
    return douyinPatterns.some(pattern => pattern.test(text));
}

/**
 * Scrape download links from Douyin video
 * @param {string} douyinText - Douyin text or URL
 * @returns {Object} Download links data
 */
async function scrapeDownloadLinks(douyinText) {
    try {
        const endpoint = 'https://savetik.co/api/ajaxSearch';
        const headers = {
            'accept': '*/*',
            'accept-encoding': 'gzip, deflate, br, zstd',
            'accept-language': 'id,en;q=0.9,ja;q=0.8,ms;q=0.7',
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'origin': 'https://savetik.co',
            'referer': 'https://savetik.co/en/douyin-downloader',
            'sec-ch-ua': '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
            'x-requested-with': 'XMLHttpRequest',
            'cookie': '_gid=GA1.2.1187690757.1749647118; _gat_gtag_UA_88358110_1=1; _ga_4ZEZMTBFLJ=GS2.1.s1749647118$o1$g0$t1749647118$j60$l0$h0; _ga=GA1.1.62376559.1749647118'
        };

        const payload = new URLSearchParams({
            q: douyinText,
            lang: 'en',
            cftoken: ''
        });

        const response = await axios.post(endpoint, payload, { 
            headers: headers,
            timeout: 30000
        });

        if (!response.data || response.data.status !== 'ok' || !response.data.data) {
            throw new Error('Failed to get data from savetik.co');
        }

        const $ = cheerio.load(response.data.data);

        let videoLinks = [];
        $('a.tik-button-dl.button.dl-success').each((i, el) => {
            const href = $(el).attr('href');
            const text = $(el).text();
            if (href && /mp4/i.test(text)) {
                videoLinks.push({ 
                    url: href, 
                    label: text.trim() 
                });
            }
        });

        const thumbnail = $('.thumbnail img').attr('src') || null;

        const title = $('.video-title').text().trim() || 
                     $('h3').first().text().trim() || 
                     'Douyin Video';

        return {
            videoLinks,
            thumbnail,
            title
        };
    } catch (error) {
        console.error('Douyin scraping error:', error.response ? error.response.data : error.message);
        throw new Error('Failed to scrape Douyin download links');
    }
}

/**
 * Download Douyin video
 * @param {string} douyinText - Douyin text or URL
 * @returns {Object} Response object with status code and data
 */
async function douyinDownload(douyinText) {
    try {
        if (!douyinText || typeof douyinText !== 'string' || douyinText.trim().length === 0) {
            return {
                status: 500,
                error: 'Douyin text or URL is required and must be a non-empty string'
            };
        }

        if (!isValidDouyinText(douyinText)) {
            return {
                status: 500,
                error: 'Invalid Douyin text or URL'
            };
        }

        const downloadData = await scrapeDownloadLinks(douyinText);
        
        if (!downloadData.videoLinks || downloadData.videoLinks.length === 0) {
            return {
                status: 500,
                error: 'No video download links found'
            };
        }

        const downloadLinks = {};
        for (let i = 0; i < downloadData.videoLinks.length; i++) {
            const video = downloadData.videoLinks[i];
            
            const qualityKey = video.label.toLowerCase().includes('hd') ? 'hd' : 
                              video.label.toLowerCase().includes('normal') ? 'normal' : 
                              `quality_${i + 1}`;
            
            downloadLinks[qualityKey] = {
                url: video.url,
                label: video.label
            };
        }

        return {
            status: 200,
            data: {
                original_text: douyinText,
                title: downloadData.title,
                thumbnail: downloadData.thumbnail,
                download_links: downloadLinks,
                total_qualities: downloadData.videoLinks.length,
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
            error: error.message || 'Failed to download Douyin video'
        };
    }
}

export { douyinDownload, isValidDouyinText };
