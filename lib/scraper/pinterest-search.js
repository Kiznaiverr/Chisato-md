import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Default headers for Pinterest requests
 */
const DEFAULT_HEADERS = {
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'accept-encoding': 'gzip, deflate, br, zstd',
    'accept-language': 'id,en;q=0.9,ja;q=0.8,ms;q=0.7',
    'cache-control': 'max-age=0',
    'dnt': '1',
    'priority': 'u=0, i',
    'referer': 'https://id.pinterest.com/',
    'sec-ch-ua': '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
    'sec-ch-ua-full-version-list': '"Google Chrome";v="137.0.7151.69", "Chromium";v="137.0.7151.69", "Not/A)Brand";v="24.0.0.0"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-model': '""',
    'sec-ch-ua-platform': '"Windows"',
    'sec-ch-ua-platform-version': '"19.0.0"',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'same-origin',
    'sec-fetch-user': '?1',
    'upgrade-insecure-requests': '1',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
    'cookie': [
        'csrftoken=e349b49ad6daf26157fb64652291e793',
        '_b="AYjUaBgyLp1IRp+rbZfSWZ31wfKUwODFOXCEhm+eUsP3sTK04gTC0gVFbwEQh0gAbHI="',
        'ar_debug=1',
        '_routing_id="d814477f-b5eb-47e9-a90a-103ee1fbde1c"',
        'sessionFunnelEventLogged=1',
        '_auth=1',
        '_pinterest_sess=TWc9PSZ6Q0I4YWYyd0gwWDE3THFBOWdJTkdjR0grdmNaK1ZmK2pMQTFqYzdUUEJaR28zSUt4VVlTdVFoV2pQQ3N3YVVhUzF1UisvTEkyRThtQ1Q4WTlScVNWZ3NLZjVmOGNnalN1MVBJNEF3OGs0VGliamxKOGQ5RjdBa0VXQzh3eFlJemZKV2FDa3lVTjFOOFQzOTBaRU95OHQwSEY1T3lzREF4a3RkbDNOQXkzR3Q0VUd1TTFDOSs3b1ROaVNzZlFvQW92NXhrWDBNSjIvNEV0WUlLWXpraDRQSHJOSHhsQWFFMXJvVjUxQkFhOWd1aHZmanVkTXg0czFYQUhnelRmTU1tbUdtby91Y2poUW90MlhPZXoxNXp5eUxIbEJzQmgxVFc5NGRWSm1PdllsWXZtbEZpUVcvQlRDd3pEaWNUMmRvazFPQXhFTmUyUFZjN0NqcXRPajgydGxRK0xPclpESjh4Yk55bndzcmdkaTBvU0RwdWM1cU1hVFlZcXpnSlVPWSszL1c4UCs2cmRzNEtxaDVJQUo2SWMrQ2s1UkhZYkRmNEtiKzVlYm9qVlVJPSZ4L1I2R0diYjZ0WHNBeEVHMmRvbjdDUG16MTA9',
        '__Secure-s_a=VCtWR0QvdzQvMlgzeXpJVGt2bTJtai9BRHVuWVFmcnRkUjJ3UkU3STd0MXFObm9ocDM0aVNHaTZMcE8rWkhGN3IvcWFHTnIzMGZsaXdTODl3U2U1MlNtZTNlVFVxOVg2SWRhTjM0K25kdEhOSXRtY0xpK1dMblJIZGpvWVVWZnZtRmpOdktaRzREc29BUktOWTRLbGVhSm1mTmtRRkJBSkEyZnIvSmd2VVF2NzhlZ1Q3azgvbjl2RjBGaUF0ajF4TkgwMEhNeUVXZndxNnJycGZta0orUlF3UUJ2NDV1RFhYN09TbEpaSHJtYXhnZU1FTDZwWlk0K1B6SFlQOXJyY0tHeW5qWXlrMENsRkpmV01NT3hXU0dmVEZqWW95STRETlJ3QUJTdTJhL1U9JnpEMDV6ZGIvY21IUzdQV0pqeXgraDlZejZBbz0='
    ].join('; ')
};

/**
 * Search Pinterest for images
 * @param {string} query - Search query
 * @returns {Object} Response object with status code and data
 */
async function pinterestSearch(query) {
    try {
        if (!query || typeof query !== 'string' || query.trim().length === 0) {
            return {
                status: 500,
                error: 'Search query is required and must be a non-empty string'
            };
        }

        const url = `https://id.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`;
        
        const response = await axios.get(url, {
            headers: DEFAULT_HEADERS,
            timeout: 30000
        });

        const $ = cheerio.load(response.data);
        
        const results = [];
        $('img').each(function () {
            const src = $(this).attr('src');
            if (src && !src.includes('75x75')) { // Filter out 75x75 images
                results.push(src);
            }
        });

        const shuffled = results.sort(() => 0.5 - Math.random());
        const selectedUrls = shuffled.slice(0, 5);

        return {
            status: 200,
            data: {
                query: query,
                total_found: results.length,
                images: selectedUrls,
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
            error: error.message || 'Failed to search Pinterest images'
        };
    }
}

export { pinterestSearch };
