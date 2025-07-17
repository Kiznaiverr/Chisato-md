import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { createReadStream, ReadStream, createWriteStream, promises as fs } from 'fs'
import { Readable } from 'stream'

class Helper {
    /**
     * Get __dirname equivalent for ES modules
     * @param {string} metaUrl import.meta.url
     * @returns {string} directory path
     */
    static __dirname(metaUrl) {
        return dirname(fileURLToPath(metaUrl))
    }

    /**
     * Check if stream is readable
     * @param {any} stream 
     * @returns {boolean}
     */
    static isReadableStream(stream) {
        return stream instanceof Readable || stream instanceof ReadStream
    }

    /**
     * Save stream to file
     * @param {Readable} stream 
     * @param {string} filePath 
     * @returns {Promise<void>}
     */
    static saveStreamToFile(stream, filePath) {
        return new Promise((resolve, reject) => {
            const writeStream = createWriteStream(filePath)
            
            stream.pipe(writeStream)
            
            writeStream.on('finish', resolve)
            writeStream.on('error', reject)
            stream.on('error', reject)
        })
    }

    /**
     * Generate random filename
     * @param {string} ext File extension
     * @returns {string}
     */
    static generateFilename(ext = '') {
        const timestamp = Date.now()
        const random = Math.random().toString(36).substring(2, 15)
        return `${timestamp}_${random}${ext ? '.' + ext : ''}`
    }

    /**
     * Ensure directory exists
     * @param {string} dirPath 
     */
    static async ensureDir(dirPath) {
        try {
            await fs.access(dirPath)
        } catch {
            await fs.mkdir(dirPath, { recursive: true })
        }
    }

    /**
     * Clean up temporary files
     * @param {string[]} files Array of file paths
     */
    static async cleanup(files) {
        const cleanupPromises = files.map(async (file) => {
            try {
                await fs.unlink(file)
            } catch (error) {
                // Ignore cleanup errors
            }
        })
        await Promise.all(cleanupPromises)
    }
}

export default Helper
