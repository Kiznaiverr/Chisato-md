import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Validate Instagram URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid Instagram URL
 */
function isValidInstagramUrl(url) {
    const instagramRegex = /^https?:\/\/(www\.)?(instagram\.com)\/(p|reel|tv)\/[a-zA-Z0-9_-]+/;
    return instagramRegex.test(url);
}

/**
 * Decode HTML entities
 * @param {string} text - Text to decode
 * @returns {string} Decoded text
 */
function decodeHtmlEntities(text) {
    const entities = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
        '&#x27;': "'",
        '&#x2F;': '/',
        '&#x60;': '`',
        '&#x3D;': '='
    };
    
    return text.replace(/&[#\w]+;/g, (entity) => {
        return entities[entity] || entity;
    });
}

/**
 * Scrape download links from Instagram media
 * @param {string} instagramUrl - Instagram media URL
 * @returns {Object} Download links data
 */
async function scrapeDownloadLinks(instagramUrl) {
    try {
        const headers = {
            'referer': 'https://insta-save.net/id',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
            'accept-language': 'id,en;q=0.9,ja;q=0.8,ms;q=0.7',
            'dnt': '1',
        };

        const encodedUrl = encodeURIComponent(instagramUrl);
        const endpoint = `https://insta-save.net/content.php?url=${encodedUrl}`;

        const response = await axios.get(endpoint, {
            headers: headers,
            timeout: 30000
        });

        const data = response.data;
        
        if (!data || data.status !== "ok" || !data.html) {
            throw new Error('No download links found or invalid response format');
        }

        const html = decodeHtmlEntities(data.html);
        const $ = cheerio.load(html);

        const videoUrl = $('a.btn.bg-gradient-success.mb-0').attr('href') || null;
        
        const imageUrls = [];
        $('img').each((i, elem) => {
            const src = $(elem).attr('src');
            if (src && src.includes('instagram') && !src.includes('profile')) {
                imageUrls.push(src);
            }
        });
        
        const thumbnail = $('video').attr('poster') || null;
        
        const title = $('p.text-sm').first().text().trim() || 'Instagram Media';
        
        const username = data.username || 'Unknown';

        return {
            title: title,
            username: username,
            thumbnail: thumbnail,
            videoUrl: videoUrl,
            imageUrl: imageUrls.length > 0 ? imageUrls[0] : null
        };
    } catch (error) {
        console.error('Instagram scraping error:', error.response ? error.response.data : error.message);
        throw new Error('Failed to scrape download links');
    }
}

/**
 * Download Instagram media
 * @param {string} url - Instagram media URL
 * @returns {Object} Response object with status code and data
 */
async function instagramDownload(url) {
    try {
        if (!url || typeof url !== 'string' || url.trim().length === 0) {
            return {
                status: 500,
                error: 'Instagram URL is required and must be a non-empty string'
            };
        }

        if (!isValidInstagramUrl(url)) {
            return {
                status: 500,
                error: 'Invalid Instagram URL'
            };
        }

        const downloadData = await scrapeDownloadLinks(url);
        
        if (!downloadData.videoUrl && !downloadData.imageUrl) {
            return {
                status: 500,
                error: 'No downloadable content found for this Instagram URL'
            };
        }

        return {
            status: 200,
            data: {
                url: url,
                title: downloadData.title || 'Instagram Media',
                username: downloadData.username,
                thumbnail: downloadData.thumbnail,
                download_links: {
                    video: downloadData.videoUrl || null,
                    image: downloadData.imageUrl || null
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
            error: error.message || 'Failed to download Instagram media'
        };
    }
}

export { instagramDownload, isValidInstagramUrl };
