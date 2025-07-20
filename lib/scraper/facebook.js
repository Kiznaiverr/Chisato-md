import axios from 'axios';
import qs from 'qs';
import * as cheerio from 'cheerio';

/**
 * Validate Facebook URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid Facebook URL
 */
function isValidFacebookUrl(url) {
    const facebookRegex = /^https?:\/\/(www\.)?(facebook\.com|fb\.watch|m\.facebook\.com)/;
    return facebookRegex.test(url);
}

/**
 * Scrape download links from Facebook video
 * @param {string} fbVideoUrl - Facebook video URL
 * @returns {Object} Download links data
 */
async function scrapeDownloadLinks(fbVideoUrl) {
    try {
        const endpoint = 'https://getmyfb.com/process';
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Accept': '*/*',
            'Accept-Language': 'id,en;q=0.9,ja;q=0.8,ms;q=0.7',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
            'Origin': 'https://getmyfb.com',
            'Referer': 'https://getmyfb.com/id',
            'Cookie': '_ga=GA1.1.985117398.1753016085; __cflb=04dToeZfC9vebXjRcJCMjjSQh5Pprejy5WA1GkAmgX; _ga_96G5RB4BBD=GS2.1.s1753016085$o1$g1$t1753016345$j35$l0$h0',
            'DNT': '1',
            'HX-Current-URL': 'https://getmyfb.com/id',
            'HX-Request': 'true',
            'HX-Target': 'target',
            'HX-Trigger': 'form',
            'Priority': 'u=1, i',
            'Sec-CH-UA': '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
            'Sec-CH-UA-Mobile': '?0',
            'Sec-CH-UA-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin'
        };

        const payload = qs.stringify({
            id: fbVideoUrl,
            locale: 'id'
        });

        const response = await axios.post(endpoint, payload, {
            headers: headers,
            responseType: 'text',
            decompress: true,
            timeout: 30000
        });

        const html = response.data;
        const $ = cheerio.load(html);

        // Extract title
        const title = $('.results-item-text').first().text().trim() || 'Facebook Video';
        
        // Extract thumbnail
        const thumbnail = $('.results-item-image').attr('src') || null;

        // Extract download links
        let hdLink = null;
        let sdLink = null;
        let mp3Link = null;

        $('.results-list-item').each((index, element) => {
            const $item = $(element);
            const $link = $item.find('a[href*="ssscdn.io"]');
            const href = $link.attr('href');
            const itemText = $item.text().trim();

            if (href) {
                if (itemText.includes('720p') || itemText.includes('HD')) {
                    hdLink = href;
                } else if (itemText.includes('360p') || itemText.includes('SD')) {
                    sdLink = href;
                } else if (itemText.includes('Mp3') || itemText.includes('mp3')) {
                    mp3Link = href;
                }
            }
        });

        if (!hdLink && !sdLink && !mp3Link) {
            throw new Error('No download links found');
        }

        return {
            title: title,
            hdLink: hdLink,
            sdLink: sdLink,
            mp3Link: mp3Link,
            thumbnail: thumbnail
        };
    } catch (error) {
        console.error('Facebook scraping error:', error.response ? error.response.data : error.message);
        throw new Error('Failed to scrape download links');
    }
}

/**
 * Download Facebook video
 * @param {string} url - Facebook video URL
 * @returns {Object} Response object with status code and data
 */
async function facebookDownload(url) {
    try {
        if (!url || typeof url !== 'string' || url.trim().length === 0) {
            return {
                status: 500,
                error: 'Facebook URL is required and must be a non-empty string'
            };
        }

        if (!isValidFacebookUrl(url)) {
            return {
                status: 500,
                error: 'Invalid Facebook URL'
            };
        }

        const downloadData = await scrapeDownloadLinks(url);
        
        if (!downloadData.hdLink && !downloadData.sdLink && !downloadData.mp3Link) {
            return {
                status: 500,
                error: 'No downloadable content found for this Facebook URL'
            };
        }

        return {
            status: 200,
            data: {
                url: url,
                title: downloadData.title || 'Facebook Video',
                thumbnail: downloadData.thumbnail,
                download_links: {
                    hd: downloadData.hdLink || null,
                    sd: downloadData.sdLink || null,
                    audio: downloadData.mp3Link || null
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
            error: error.message || 'Failed to download Facebook video'
        };
    }
}

export { facebookDownload, isValidFacebookUrl };