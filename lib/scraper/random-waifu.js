import axios from 'axios';

const WAIFU_API_URL = 'https://api.waifu.pics/sfw/waifu';

/**
 * Fetch random waifu image
 * @returns {Object} Response object with status code and data
 */
async function randomWaifu() {
    try {
        const response = await axios.get(WAIFU_API_URL, { 
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        if (!response.data || !response.data.url) {
            return {
                status: 500,
                error: 'Failed to fetch waifu image'
            };
        }

        return {
            status: 200,
            data: {
                url: response.data.url,
                source: 'waifu.pics',
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
            error: error.message || 'Failed to fetch waifu image'
        };
    }
}

export { randomWaifu };
