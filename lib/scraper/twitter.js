import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Validate Twitter/X URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid Twitter/X URL
 */
function isValidTwitterUrl(url) {
    try {
        const urlObj = new URL(url);
        const validHosts = ['twitter.com', 'www.twitter.com', 'x.com', 'www.x.com', 'm.twitter.com', 'mobile.twitter.com'];
        const isValidHost = validHosts.some(host => urlObj.hostname === host || urlObj.hostname.endsWith('.' + host));
        
        const hasStatusPath = urlObj.pathname.includes('/status/');
        
        return isValidHost && hasStatusPath;
    } catch {
        return false;
    }
}

/**
 * Convert relative URL to absolute URL
 * @param {string} url - URL to convert
 * @returns {string|null} Absolute URL
 */
function makeAbsoluteUrl(url) {
    if (!url) return null;
    
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    
    if (url.startsWith('//')) {
        return `https:${url}`;
    }
    
    if (url.startsWith('/')) {
        return `https://www.xsaver.io${url}`;
    }
    
    return `https://www.xsaver.io/${url}`;
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
function truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

/**
 * Scrape download links from Twitter media
 * @param {string} twitterUrl - Twitter media URL
 * @returns {Object} Download links data
 */
async function scrapeDownloadLinks(twitterUrl) {
    try {
        const endpoint = 'https://www.xsaver.io/download.php';
        const headers = {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'accept-language': 'id,en;q=0.9,ja;q=0.8,ms;q=0.7',
            'referer': 'https://www.xsaver.io/id/',
            'cache-control': 'no-cache',
            'pragma': 'no-cache'
        };

        const apiUrl = `${endpoint}?url=${encodeURIComponent(twitterUrl)}`;

        const response = await axios.get(apiUrl, { 
            headers: headers,
            timeout: 30000,
            maxRedirects: 5,
            validateStatus: function (status) {
                return status >= 200 && status < 400;
            }
        });

        const $ = cheerio.load(response.data);

        let videoLink = null;
        let imageLink = null;

        const videoSelectors = [
            'a.download-bttn:contains("Unduh (MP4)")',
            'a.download-bttn:contains("Download MP4")',
            'a[href*=".mp4"]',
            '.download-link[href*=".mp4"]'
        ];

        const imageSelectors = [
            'a.download-bttn:contains("Unduh (Gambar)")',
            'a.download-bttn:contains("Download Image")',
            'a[href*=".jpg"]',
            'a[href*=".png"]',
            '.download-link[href*=".jpg"]'
        ];

        for (const selector of videoSelectors) {
            const element = $(selector).first();
            if (element.length && element.attr('href')) {
                videoLink = element.attr('href');
                break;
            }
        }

        for (const selector of imageSelectors) {
            const element = $(selector).first();
            if (element.length && element.attr('href')) {
                imageLink = element.attr('href');
                break;
            }
        }

        const fullVideoLink = videoLink ? makeAbsoluteUrl(videoLink) : null;
        const fullImageLink = imageLink ? makeAbsoluteUrl(imageLink) : null;

        const tweetText = $('.video-title').text().trim() || 
                         $('h2').first().text().trim() ||
                         $('h1').first().text().trim() ||
                         $('title').text().trim() ||
                         'Twitter/X Post';

        if (!fullVideoLink && !fullImageLink) {
            console.log('No media found. Response HTML preview:', response.data.substring(0, 500));
            throw new Error('No downloadable media found in this tweet. The tweet may be private, deleted, or contain only text.');
        }

        return {
            title: truncateText(tweetText, 100),
            tweetText: truncateText(tweetText, 500),
            videoUrl: fullVideoLink,
            imageUrl: fullImageLink
        };
    } catch (error) {
        console.error('Twitter scraping error:', error.message);
        
        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            throw new Error('Unable to connect to download service. Please try again later.');
        } else if (error.response) {
            if (error.response.status === 404) {
                throw new Error('Tweet not found. The tweet may be private, deleted, or the URL is invalid.');
            } else if (error.response.status === 429) {
                throw new Error('Download service is busy. Please try again in a few minutes.');
            } else if (error.response.status >= 500) {
                throw new Error('Download service is temporarily unavailable. Please try again later.');
            }
        }
        
        throw new Error(error.message || 'Failed to extract download links from tweet. Please check if the tweet is public and contains media.');
    }
}

/**
 * Download Twitter media
 * @param {string} url - Twitter media URL
 * @returns {Object} Response object with status code and data
 */
async function twitterDownload(url) {
    try {
        if (!url || typeof url !== 'string' || url.trim().length === 0) {
            return {
                status: 500,
                error: 'Twitter/X URL is required and must be a non-empty string'
            };
        }

        if (!isValidTwitterUrl(url)) {
            return {
                status: 500,
                error: 'Invalid Twitter/X URL'
            };
        }

        const downloadData = await scrapeDownloadLinks(url);
        
        if (!downloadData.videoUrl && !downloadData.imageUrl) {
            return {
                status: 500,
                error: 'No downloadable content found for this Twitter/X URL'
            };
        }

        return {
            status: 200,
            data: {
                url: url,
                title: downloadData.title || 'Twitter/X Post',
                tweet_text: downloadData.tweetText,
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
            error: error.message || 'Failed to download Twitter/X media'
        };
    }
}

export { twitterDownload, isValidTwitterUrl };
