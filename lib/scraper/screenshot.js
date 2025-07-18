import axios from 'axios';

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
function isValidUrl(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
        return false;
    }
}

/**
 * Take screenshot of a website
 * @param {string} url - Website URL to screenshot
 * @returns {Object} Response object with status code and data
 */
async function takeScreenshot(url) {
    try {
        if (!url || typeof url !== 'string' || url.trim().length === 0) {
            return {
                status: 500,
                error: 'URL is required and must be a non-empty string'
            };
        }

        if (!isValidUrl(url)) {
            return {
                status: 500,
                error: 'Invalid URL provided'
            };
        }

        const apiUrl = "https://api.pikwy.com/";
        const headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
            "accept": "*/*",
            "accept-language": "id,en;q=0.9,ja;q=0.8,ms;q=0.7",
            "origin": "https://pikwy.com",
            "referer": "https://pikwy.com/"
        };

        // Default parameters (no customization)
        const params = {
            tkn: "125",
            d: 3000,
            u: encodeURIComponent(url),
            fs: 1,
            w: 1280,
            h: 1200,
            s: 100,
            z: 100,
            f: "jpg",
            rt: "jweb"
        };

        // Request to Pikwy API
        const response = await axios.get(apiUrl, { 
            params, 
            headers: headers,
            timeout: 30000
        });

        if (!response.data || !response.data.iurl) {
            return {
                status: 500,
                error: 'Failed to generate screenshot URL'
            };
        }

        return {
            status: 200,
            data: {
                screenshot_url: response.data.iurl,
                original_url: url,
                parameters: {
                    width: params.w,
                    height: params.h,
                    format: params.f,
                    scale: params.s,
                    zoom: params.z,
                    delay: params.d,
                    full_screen: params.fs
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
        console.error('Screenshot error:', error.message);
        return {
            status: 500,
            error: error.response?.data?.message || error.message || 'Failed to take screenshot'
        };
    }
}

export { takeScreenshot, isValidUrl };
