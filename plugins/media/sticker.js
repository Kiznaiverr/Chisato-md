import { getContentType, downloadMediaMessage } from '@whiskeysockets/baileys'
import { sticker, video2webp } from '../../lib/sticker.js'
import { fileTypeFromBuffer } from 'file-type'
import { Buffer } from 'buffer'

export default {
    command: 'sticker',
    aliases: ['s', 'stiker'],
    description: 'Convert image/video to sticker with optional watermark',
    category: 'media',
    usage: '.sticker [packname] [author] (reply to image/video) or send image/video with caption .s',
    limit: 2,
    cooldown: 5,
    
    async execute(context) {
        const { reply, msg, sock, react, args, config } = context
        
        try {
            await react('🕔')
            
            let mediaMessage = null
            let downloadMessage = null
            
            // Check if command sent with media (caption mode)
            const messageType = getContentType(msg.message)
            if (messageType === 'imageMessage' || messageType === 'videoMessage') {
                // Media sent with caption .s
                mediaMessage = msg.message[messageType]
                downloadMessage = msg
            } else {
                // Check if replying to media
                const quotedMessage = msg.message.extendedTextMessage?.contextInfo?.quotedMessage
                
                if (!quotedMessage) {
                    await react('❌')
                    return await reply('❌ Please reply to an image/video or send media with caption .s\n\n💡 Usage:\n• Reply to image/video and type .sticker\n• Send image/video with caption .s\n• Use .sticker "pack name" "author" for custom watermark')
                }
                
                const quotedType = getContentType(quotedMessage)
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
                } else {
                    await react('❌')
                    return await reply('❌ Please reply to an image or video only!')
                }
            }
            
            if (!mediaMessage) {
                await react('❌')
                return await reply('❌ No valid media found!')
            }
            
            // Validate media type and size
            const fileSize = mediaMessage.fileLength || 0
            
            // Check file size (max 15MB for stickers)
            if (fileSize > 15 * 1024 * 1024) {
                await react('❌')
                return await reply('❌ File too large! Maximum size is 15MB for stickers.')
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
            
            // Parse watermark parameters
            const botSettings = config.get('botSettings')
            const ownerSettings = config.get('ownerSettings')
            
            let packname = args[0] || botSettings.botName || 'Chisato-MD'
            let author = args[1] || ownerSettings.ownerName || 'Kiznavierr'
            
            // Remove quotes if present
            packname = packname.replace(/['"]/g, '')
            author = author.replace(/['"]/g, '')
            
            let stickerBuffer
            
            if (isVideo) {
                // Convert video to animated sticker
                await reply('🎬 Converting video to animated sticker...')
                stickerBuffer = await video2webp(buffer, 15)
            } else {
                // Convert image to sticker with watermark
                stickerBuffer = await sticker(buffer, null, packname, author, ['🤖'], {
                    'android-app-store-link': 'https://github.com/kiznavierr/chisato-md',
                    'ios-app-store-link': 'https://github.com/kiznavierr/chisato-md'
                })
            }
            
            if (!stickerBuffer || stickerBuffer.length === 0) {
                await react('❌')
                return await reply('❌ Failed to create sticker! Please try with a different image/video.')
            }
            
            // Send as sticker
            await sock.sendMessage(msg.key.remoteJid, {
                sticker: stickerBuffer
            })
            
            await react('✅')
            
        } catch (error) {
            console.error('Sticker error:', error)
            await react('❌')
            
            let errorMessage = '❌ Failed to create sticker!'
            
            if (error.message.includes('download')) {
                errorMessage += '\n💡 The media might be too old or corrupted.'
            } else if (error.message.includes('format') || error.message.includes('type')) {
                errorMessage += '\n💡 Please use a valid image or video format (JPG, PNG, MP4, etc.).'
            } else if (error.message.includes('size')) {
                errorMessage += '\n💡 The file is too large. Try with a smaller image/video.'
            } else if (error.message.includes('ffmpeg')) {
                errorMessage += '\n💡 Media conversion failed. Try with a different file.'
            } else {
                errorMessage += '\n💡 Please try again with a different image/video.'
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
