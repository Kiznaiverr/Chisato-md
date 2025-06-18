import { dirname } from 'path'
import { fileURLToPath } from 'url'
import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import { ffmpeg } from './converter.js'
import { spawn } from 'child_process'
import { fileTypeFromBuffer } from 'file-type'
import { tmpdir } from 'os'
import Helper from './helper.js'

const __dirname = Helper.__dirname(import.meta.url)
const tmp = path.join(__dirname, '../tmp')

// Global support configuration
const support = {
    ffmpeg: true,
    ffprobe: true,
    ffmpegWebp: true,
    convert: true,
    magick: false,
    gm: false,
    find: false
}

/**
 * Image to Sticker (Method 1 - Using spawn with ffmpeg + convert)
 * @param {Buffer} img Image Buffer
 * @param {String} url Image URL
 */
function sticker1(img, url) {
    return new Promise(async (resolve, reject) => {
        try {
            if (url) {
                let res = await fetch(url)
                if (res.status !== 200) throw new Error(await res.text())
                img = Buffer.from(await res.arrayBuffer())
            }
            
            await Helper.ensureDir(tmp)
            let inp = path.join(tmp, Helper.generateFilename('jpeg'))
            await fs.promises.writeFile(inp, img)
            
            let ff = spawn('ffmpeg', [
                '-y',
                '-i', inp,
                '-vf', 'scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1',
                '-f', 'png',
                '-'
            ])
            
            ff.on('error', reject)
            ff.on('close', async () => {
                await Helper.cleanup([inp])
            })
            
            let bufs = []
            const [_spawnprocess, ..._spawnargs] = [...(support.gm ? ['gm'] : support.magick ? ['magick'] : []), 'convert', 'png:-', 'webp:-']
            let im = spawn(_spawnprocess, _spawnargs)
            
            im.on('error', reject)
            im.stdout.on('data', chunk => bufs.push(chunk))
            ff.stdout.pipe(im.stdin)
            im.on('exit', () => {
                resolve(Buffer.concat(bufs))
            })
        } catch (e) {
            reject(e)
        }
    })
}

/**
 * Image to Sticker (Method 2 - Using ffmpeg function)
 * @param {Buffer} img Image/Video Buffer
 * @param {String} url Image/Video URL
 */
async function sticker2(img, url) {
    if (url) {
        let res = await fetch(url)
        if (res.status !== 200) throw new Error(await res.text())
        img = Buffer.from(await res.arrayBuffer())
    }
    
    const result = await ffmpeg(img, [
        '-vf', 'scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1'
    ], 'jpeg', 'webp')
    
    const buffer = await result.toBuffer()
    await result.clear()
    return buffer
}

/**
 * Image to Sticker (Method 3 - Using wa-sticker-formatter)
 * @param {Buffer} img Image/Video Buffer
 * @param {String} url Image/Video URL
 * @param {String} packname Sticker pack name
 * @param {String} author Sticker author
 * @param {Array} categories Sticker categories
 * @param {Object} extra Extra metadata
 */
async function sticker3(img, url, packname, author, categories = [], extra = {}) {
    try {
        const { Sticker, StickerTypes } = await import('wa-sticker-formatter')
        const stickerMetadata = {
            type: StickerTypes.FULL,
            pack: packname,
            author,
            categories,
            quality: 100,
            ...extra
        }
        return await (new Sticker(img ? img : url, stickerMetadata)).toBuffer()
    } catch (error) {
        throw new Error(`wa-sticker-formatter error: ${error.message}`)
    }
}

/**
 * Convert using fluent-ffmpeg (Method 4)
 * @param {Buffer} img Image/Video Buffer
 * @param {string} url Image/Video URL
 */
function sticker4(img, url) {
    return new Promise(async (resolve, reject) => {
        try {
            if (url) {
                let res = await fetch(url)
                if (res.status !== 200) throw new Error(await res.text())
                img = Buffer.from(await res.arrayBuffer())
            }
            
            const type = await fileTypeFromBuffer(img) || {
                mime: 'application/octet-stream',
                ext: 'bin'
            }
            
            if (type.ext === 'bin') {
                return reject(new Error('Invalid file type'))
            }
            
            await Helper.ensureDir(tmp)
            const inputFile = path.join(tmp, Helper.generateFilename(type.ext))
            const outputFile = inputFile + '.webp'
            
            await fs.promises.writeFile(inputFile, img)
            
            // Use spawn instead of fluent-ffmpeg for better control
            const args = [
                '-y',
                '-i', inputFile,
                '-vcodec', 'libwebp',
                '-vf', `scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0`,
                outputFile
            ]
            
            const ffmpegProcess = spawn('ffmpeg', args)
            
            ffmpegProcess.on('error', (err) => {
                Helper.cleanup([inputFile, outputFile])
                reject(err)
            })
            
            ffmpegProcess.on('close', async (code) => {
                try {
                    await Helper.cleanup([inputFile])
                    if (code !== 0) {
                        await Helper.cleanup([outputFile])
                        return reject(new Error(`FFmpeg process exited with code ${code}`))
                    }
                    
                    const result = await fs.promises.readFile(outputFile)
                    await Helper.cleanup([outputFile])
                    resolve(result)
                } catch (error) {
                    reject(error)
                }
            })
        } catch (error) {
            reject(error)
        }
    })
}

/**
 * Add WhatsApp JSON Exif Metadata
 * @param {Buffer} webpSticker 
 * @param {String} packname 
 * @param {String} author 
 * @param {Array} categories 
 * @param {Object} extra 
 * @returns {Promise<Buffer>}
 */
async function addExif(webpSticker, packname, author, categories = [], extra = {}) {
    try {
        const webp = await import('node-webpmux')
        const img = new webp.Image()
        const stickerPackId = crypto.randomBytes(32).toString('hex')
        
        const json = {
            'sticker-pack-id': stickerPackId,
            'sticker-pack-name': packname,
            'sticker-pack-publisher': author,
            'emojis': categories,
            'powered-by': 'Chisato-MD',
            'created-by': 'Kiznavierr',
            ...extra
        }
        
        let exifAttr = Buffer.from([
            0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00
        ])
        
        let jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8')
        let exif = Buffer.concat([exifAttr, jsonBuffer])
        exif.writeUIntLE(jsonBuffer.length, 14, 4)
        
        await img.load(webpSticker)
        img.exif = exif
        return await img.save(null)
    } catch (error) {
        console.warn('Failed to add EXIF data:', error.message)
        return webpSticker
    }
}

/**
 * Main sticker function with fallback methods
 * @param {Buffer} img Image/Video Buffer
 * @param {String} url Image/Video URL
 * @param {String} packname Sticker pack name
 * @param {String} author Sticker author
 * @param {Array} categories Sticker categories
 * @param {Object} extra Extra metadata
 */
async function sticker(img, url, packname = 'Chisato-MD', author = 'Kiznavierr', categories = [], extra = {}) {
    let lastError
    let stickerBuffer
    
    // Try different methods in order of preference
    const methods = [
        support.ffmpeg && sticker4,
        sticker3,
        support.ffmpeg && support.ffmpegWebp && sticker2,
        support.ffmpeg && (support.convert || support.magick || support.gm) && sticker1
    ].filter(Boolean)
    
    for (const method of methods) {
        try {
            if (method === sticker3) {
                stickerBuffer = await method(img, url, packname, author, categories, extra)
            } else {
                stickerBuffer = await method(img, url)
                
                // Add EXIF metadata if method doesn't handle it
                if (stickerBuffer && !stickerBuffer.includes('html')) {
                    try {
                        stickerBuffer = await addExif(stickerBuffer, packname, author, categories, extra)
                    } catch (exifError) {
                        console.warn('EXIF addition failed:', exifError.message)
                        // Continue with sticker without EXIF
                    }
                }
            }
            
            // Validate result
            if (stickerBuffer && stickerBuffer.length > 0 && !stickerBuffer.includes('html')) {
                return stickerBuffer
            }
            
            throw new Error('Invalid sticker buffer generated')
        } catch (error) {
            lastError = error
            console.warn(`Sticker method failed: ${error.message}`)
            continue
        }
    }
    
    throw lastError || new Error('All sticker conversion methods failed')
}

/**
 * Convert video to WebP animated sticker
 * @param {Buffer} media Video buffer
 * @param {number} fps Frames per second
 * @returns {Promise<Buffer>}
 */
async function video2webp(media, fps = 15) {
    const tmpFileOut = path.join(tmpdir(), Helper.generateFilename('webp'))
    const tmpFileIn = path.join(tmpdir(), Helper.generateFilename('mp4'))
    
    try {
        fs.writeFileSync(tmpFileIn, media)
        
        await new Promise((resolve, reject) => {
            const args = [
                '-y',
                '-i', tmpFileIn,
                '-vcodec', 'libwebp',
                '-vf', `scale='min(320,512)':min'(320,512)':force_original_aspect_ratio=decrease,fps=${fps}, pad=320:320:-1:-1:color=white@0.0`,
                '-loop', '0',
                '-ss', '00:00:00',
                '-t', '00:00:05',
                '-preset', 'default',
                '-an',
                '-vsync', '0',
                tmpFileOut
            ]
            
            const ffmpegProcess = spawn('ffmpeg', args)
            
            ffmpegProcess.on('error', reject)
            ffmpegProcess.on('close', (code) => {
                if (code === 0) resolve()
                else reject(new Error(`FFmpeg exited with code ${code}`))
            })
        })
        
        const buff = fs.readFileSync(tmpFileOut)
        return buff
    } finally {
        await Helper.cleanup([tmpFileOut, tmpFileIn])
    }
}

export {
    sticker,
    sticker1,
    sticker2,
    sticker3,
    sticker4,
    video2webp,
    addExif,
    support
}
