import { getContentType, downloadMediaMessage } from '@whiskeysockets/baileys'
import { sticker } from '../../lib/sticker.js'
import { fileTypeFromBuffer } from 'file-type'

export default {
    command: 'wm',
    aliases: ['watermark', 'setwm'],
    description: 'Add watermark to sticker',
    category: 'media',
    usage: '.wm <packname> | <author> (reply to image/video)',
    limit: 2,
    cooldown: 5,
    
    async execute(context) {
        const { reply, msg, sock, react, args } = context
        try {
            await react('🕔')
            
            // Gabungkan args jadi satu string, lalu split dengan '|'
            const text = args.join(' ').trim()
            let [packname, author] = text.split('|').map(s => s && s.trim())
            
            if (!packname) {
                await react('❌')
                return await reply('❌ Please provide packname!\n\n💡 Usage:\n.wm PackName | AuthorName')
            }
            
            if (!author) author = ''
            
            // Check if replying to media
            const quotedMessage = msg.message.extendedTextMessage?.contextInfo?.quotedMessage
            
            if (!quotedMessage) {
                await react('❌')
                return await reply('❌ Please reply to an image or video!\n\n💡 Usage:\n1. Reply to an image/video\n2. Type .wm PackName | AuthorName')
            }
            
            const quotedType = getContentType(quotedMessage)
            // Cek jika reply ke sticker juga
            let mediaMessage, downloadMessage, fileSize = 0, isSticker = false
            if (quotedType === 'imageMessage' || quotedType === 'videoMessage') {
                mediaMessage = quotedMessage[quotedType]
                downloadMessage = {
                    key: {
                        remoteJid: msg.key.remoteJid,
                        id: msg.message.extendedTextMessage.contextInfo.stanzaId,
                        participant: msg.message.extendedTextMessage.contextInfo.participant
                    },
                    message: quotedMessage
                }
                fileSize = mediaMessage.fileLength || 0
            } else if (quotedType === 'stickerMessage') {
                isSticker = true
                mediaMessage = quotedMessage[quotedType]
                downloadMessage = {
                    key: {
                        remoteJid: msg.key.remoteJid,
                        id: msg.message.extendedTextMessage.contextInfo.stanzaId,
                        participant: msg.message.extendedTextMessage.contextInfo.participant
                    },
                    message: quotedMessage
                }
                fileSize = mediaMessage.fileLength || 0
            } else {
                await react('❌')
                return await reply('❌ Please reply to an image, video, or sticker!')
            }
            if (fileSize > 15 * 1024 * 1024) {
                await react('❌')
                return await reply('❌ File too large! Maximum size is 15MB.')
            }
            // Download media
            let buffer = await downloadMediaMessage(downloadMessage, sock)
            if (buffer && typeof buffer.read === 'function') {
                buffer = await streamToBuffer(buffer)
            }
            if (!buffer || buffer.length === 0) {
                await react('❌')
                return await reply('❌ Failed to download media! Please try again.')
            }
            // Get file type
            const fileType = await fileTypeFromBuffer(buffer)
            const isVideo = fileType && fileType.mime.startsWith('video/')
            if (isVideo) {
                await react('❌')
                return await reply('❌ Watermark for videos is not supported yet!\n💡 Use .sticker for video stickers without custom watermark.')
            }
            // Buat sticker baru dari buffer (baik dari sticker, image, atau video)
            const stickerBuffer = await sticker(buffer, null, packname, author, ['🎨'], {
                'android-app-store-link': 'https://github.com/kiznavierr/chisato-md',
                'ios-app-store-link': 'https://github.com/kiznavierr/chisato-md',
                'custom-watermark': true
            })
            if (!stickerBuffer || stickerBuffer.length === 0) {
                await react('❌')
                return await reply('❌ Failed to create watermarked sticker! Please try again.')
            }
            // Send as sticker
            await sock.sendMessage(msg.key.remoteJid, {
                sticker: stickerBuffer
            })
            
            await react('✅')
            
        } catch (error) {
            console.error('Watermark error:', error)
            await react('❌')
            
            let errorMessage = '❌ Failed to create watermarked sticker!'
            
            if (error.message.includes('download')) {
                errorMessage += '\n💡 The media might be too old or corrupted.'
            } else if (error.message.includes('format') || error.message.includes('type')) {
                errorMessage += '\n💡 Please use a valid image format (JPG, PNG, etc.).'
            } else if (error.message.includes('size')) {
                errorMessage += '\n💡 The file is too large. Try with a smaller image.'
            } else if (error.message.includes('wa-sticker-formatter')) {
                errorMessage += '\n💡 Watermark library error. Please try again.'
            } else {
                errorMessage += '\n💡 Please try again with a different image.'
            }
            
            await reply(errorMessage)
        }
    }
}

// Helper function to convert Readable stream to Buffer
async function streamToBuffer(stream) {
    const chunks = []
    for await (const chunk of stream) {
        chunks.push(chunk)
    }
    return Buffer.concat(chunks)
}
