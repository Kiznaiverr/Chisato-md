import { createReadStream, promises, ReadStream } from 'fs'
import { join } from 'path'
import { spawn } from 'child_process'
import { Readable } from 'stream'
import Helper from './helper.js'

const __dirname = Helper.__dirname(import.meta.url)

/**
 * @param {Buffer | Readable} buffer 
 * @param {string[]} args 
 * @param {string} ext 
 * @param {string} ext2 
 * @returns {Promise<{
 *  data: ReadStream; 
 *  filename: string; 
 *  toBuffer: () => Promise<Buffer>;
 *  clear: () => Promise<void>;
 * }>}
 */
function ffmpeg(buffer, args = [], ext = '', ext2 = '') {
    return new Promise(async (resolve, reject) => {
        try {
            const tmpDir = join(__dirname, '../tmp')
            await Helper.ensureDir(tmpDir)
            
            const tmp = join(tmpDir, `${Date.now()}.${ext}`)
            const out = `${tmp}.${ext2}`

            const isStream = Helper.isReadableStream(buffer)
            if (isStream) {
                await Helper.saveStreamToFile(buffer, tmp)
            } else {
                await promises.writeFile(tmp, buffer)
            }

            const ffmpegProcess = spawn('ffmpeg', [
                '-y',
                '-i', tmp,
                ...args,
                out
            ])

            ffmpegProcess.on('error', (error) => {
                Helper.cleanup([tmp, out])
                reject(error)
            })

            ffmpegProcess.on('close', async (code) => {
                try {
                    await promises.unlink(tmp)
                    if (code !== 0) {
                        await Helper.cleanup([out])
                        return reject(new Error(`FFmpeg process exited with code ${code}`))
                    }
                    
                    const data = createReadStream(out)
                    resolve({
                        data,
                        filename: out,
                        async toBuffer() {
                            const buffers = []
                            for await (const chunk of data) {
                                buffers.push(chunk)
                            }
                            return Buffer.concat(buffers)
                        },
                        async clear() {
                            data.destroy()
                            await promises.unlink(out)
                        }
                    })
                } catch (e) {
                    reject(e)
                }
            })
        } catch (e) {
            reject(e)
        }
    })
}

/**
 * Convert Audio to Playable WhatsApp Audio
 * @param {Buffer} buffer Audio Buffer
 * @param {String} ext File Extension 
 * @returns {Promise<{data: Buffer, filename: String, delete: Function}>}
 */
function toPTT(buffer, ext) {
    return ffmpeg(buffer, [
        '-vn',
        '-c:a', 'libopus',
        '-b:a', '128k',
        '-vbr', 'on',
    ], ext, 'ogg')
}

/**
 * Convert Audio to Playable WhatsApp Audio
 * @param {Buffer} buffer Audio Buffer
 * @param {String} ext File Extension 
 * @returns {ReturnType<typeof ffmpeg>}
 */
function toAudio(buffer, ext) {
    return ffmpeg(buffer, [
        '-vn',
        '-c:a', 'libmp3lame',
        '-b:a', '128k'
    ], ext, 'mp3')
}

/**
 * Convert Audio to Playable WhatsApp Video
 * @param {Buffer} buffer Video Buffer
 * @param {String} ext File Extension 
 * @returns {ReturnType<typeof ffmpeg>}
 */
function toVideo(buffer, ext) {
    return ffmpeg(buffer, [
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-ab', '128k',
        '-ar', '44100',
        '-crf', '32',
        '-preset', 'slow'
    ], ext, 'mp4')
}

export {
    toPTT,
    toAudio,
    toVideo,
    ffmpeg,
}
