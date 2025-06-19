// Contoh upload file ke /api/tools/chisato-cdn menggunakan axios (Node.js 18+)
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

/**
 * Upload file ke Chisato CDN
 * @param {string|Buffer} file - Path file lokal atau Buffer
 * @param {string} [filename] - Nama file (jika pakai Buffer)
 * @param {string} [endpoint] - Endpoint CDN (default: https://api.nekoyama.my.id/api/tools/chisato-cdn)
 * @returns {Promise<object>} Hasil response API
 */
async function uploadToChisatoCDN(file, filename = '', endpoint = 'https://api.nekoyama.my.id/api/tools/chisato-cdn') {
  const form = new FormData();
  let fileStream;
  if (Buffer.isBuffer(file)) {
    if (!filename) throw new Error('Filename harus diisi jika file berupa Buffer');
    form.append('file', file, filename);
  } else if (typeof file === 'string') {
    if (!fs.existsSync(file)) throw new Error('File tidak ditemukan: ' + file);
    fileStream = fs.createReadStream(file);
    form.append('file', fileStream, path.basename(file));
  } else {
    throw new Error('file harus berupa path string atau Buffer');
  }
  try {
    const res = await axios.post(endpoint, form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
    return res.data;
  } catch (err) {
    if (err.response) throw err.response.data;
    throw err;
  }
}

module.exports = { uploadToChisatoCDN };
