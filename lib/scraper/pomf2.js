import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

/**
 * Upload file to Pomf2
 * @param {string|Buffer} file - Local file path or Buffer
 * @param {string} [filename] - Filename (if using Buffer)
 * @returns {Promise<object>} API response result
 */
export async function uploadToPomf2(file, filename = '') {
    try {
        const form = new FormData();
        let fileStream;
        
        if (Buffer.isBuffer(file)) {
            if (!filename) throw new Error('Filename must be provided when file is a Buffer');
            form.append('files[]', file, filename);
        } else if (typeof file === 'string') {
            if (!fs.existsSync(file)) throw new Error('File not found: ' + file);
            fileStream = fs.createReadStream(file);
            form.append('files[]', fileStream, path.basename(file));
        } else {
            throw new Error('file must be a string path or Buffer');
        }

        const response = await axios.post('https://pomf2.lain.la/upload.php', form, {
            headers: {
                ...form.getHeaders(),
                'dnt': '1',
                'referer': 'https://pomf2.lain.la/',
                'user-agent': 'Mozilla/5.0 (compatible; ChisatoBot/1.0)'
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: 60000
        });

        const json = response.data;
        
        if (!json.success || !json.files?.[0]?.url) {
            throw new Error('Upload failed: No URL returned from server');
        }

        // Return in the same format as chisatoCDN for compatibility
        return {
            status: 'success',
            data: {
                url: json.files[0].url,
                filename: json.files[0].name || filename,
                size: json.files[0].size || 0
            },
            url: json.files[0].url // For backward compatibility
        };

    } catch (error) {
        console.error('Pomf2 upload error:', error.message);
        
        if (error.response) {
            throw new Error(`Upload failed: ${error.response.status} ${error.response.statusText}`);
        }
        
        throw new Error(`Upload failed: ${error.message}`);
    }
}

export { uploadToPomf2 as uploadToChisatoCDN }; // Alias for easy replacement
