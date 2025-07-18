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
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
            'referer': 'https://getmyfb.com/id',
            'origin': 'https://getmyfb.com',
            'cookie': '_ga=GA1.1.1841487626.1749533993; __cflb=04dToeZfC9vebXjRcJCMjjSQh5PprejvroEKNLYQHR; _ga_96G5RB4BBD=GS2.1.s1749533993$o1$g1$t1749534083$j55$l0$h0',
            'accept-language': 'id,en;q=0.9,ja;q=0.8,ms;q=0.7',
            'dnt': '1',
            'hx-current-url': 'https://getmyfb.com/id',
            'hx-request': 'true',
            'hx-target': 'target',
            'hx-trigger': 'form',
        };

        const payload = qs.stringify({
            id: fbVideoUrl,
            locale: ''
        });

        const response = await axios.post(endpoint, payload, {
            headers: headers,
            responseType: 'text',
            decompress: true,
            timeout: 30000
        });

        const html = response.data;
        const $ = cheerio.load(html);

        const hdLink = $('a.hd-button').attr('href');
        const sdLink = $('a.sd-button').attr('href');
        const mp3Link = $('a.mp3').attr('href');

        const title = $('.results-item-text').text().trim() || 'Facebook Video';

        if (!hdLink && !sdLink && !mp3Link) {
            throw new Error('No download links found');
        }

        return {
            title: title,
            hdLink: hdLink,
            sdLink: sdLink,
            mp3Link: mp3Link,
            thumbnail: null
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