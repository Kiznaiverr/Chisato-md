import { getContentType, downloadMediaMessage } from '@whiskeysockets/baileys'
import { sticker, video2webp } from '../../lib/sticker.js'
import { fileTypeFromBuffer } from 'file-type'
import { Buffer } from 'buffer'
import font from '../../lib/font.js'

export default {
    command: 'sticker',
    aliases: ['s', 'stiker'],
    description: 'Convert to sticker',
    category: 'media',
    usage: '',
    limit: 1,
    cooldown: 5,
    
    async execute(context) {
        const { reply, msg, sock, react, args, config } = context
        
        try {
            await react('🕔')
            
            let mediaMessage = null
            let downloadMessage = null
            
            const messageType = getContentType(msg.message)
            if (messageType === 'imageMessage' || messageType === 'videoMessage') {
                mediaMessage = msg.message[messageType]
                downloadMessage = msg
            } else {
                const quotedMessage = msg.message.extendedTextMessage?.contextInfo?.quotedMessage
                
                if (!quotedMessage) {
                    await react('❌')
                    return await reply(`❌ ${font.smallCaps('Please reply to an image/video or send media with caption .s')}\n\n💡 ${font.smallCaps('Usage')}:\n• ${font.smallCaps('Reply to image/video and type .sticker')}\n• ${font.smallCaps('Send image/video with caption .s')}\n• ${font.smallCaps('Use .sticker "pack name" "author" for custom watermark')}`)
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
                    return await reply(`❌ ${font.smallCaps('Please reply to an image or video only')}!`)
                }
            }
            
            if (!mediaMessage) {
                await react('❌')
                return await reply(`❌ ${font.smallCaps('No valid media found')}!`)
            }
            
            const fileSize = mediaMessage.fileLength || 0
            if (fileSize > 15 * 1024 * 1024) {
                await react('❌')
                return await reply(`❌ ${font.smallCaps('File too large! Maximum size is 15MB for stickers')}.`)
            }
            
            let buffer = await downloadMediaMessage(downloadMessage, sock)
            if (buffer && typeof buffer.read === 'function') {
                buffer = await streamToBuffer(buffer)
            }
            
            if (!buffer || buffer.length === 0) {
                await react('❌')
                return await reply(`❌ ${font.smallCaps('Failed to download media! Please try again')}.`)
            }
            
            const fileType = await fileTypeFromBuffer(buffer)
            const isVideo = fileType && fileType.mime.startsWith('video/')
            
            const botSettings = config.get('botSettings')
            const ownerSettings = config.get('ownerSettings')
            
            let packname = args[0] || botSettings.botName || 'Chisato-MD'
            let author = args[1] || ownerSettings.ownerName || 'Kiznavierr'
            
            packname = packname.replace(/['"]/g, '')
            author = author.replace(/['"]/g, '')
            
            let stickerBuffer
            
            if (isVideo) {
                await reply(`🎬 ${font.smallCaps('Converting video to animated sticker')}...`)
                stickerBuffer = await video2webp(buffer, 15)
            } else {
                stickerBuffer = await sticker(buffer, null, packname, author, ['🤖'], {
                    'android-app-store-link': 'https://github.com/kiznaiverr/chisato-md',
                    'ios-app-store-link': 'https://github.com/kiznaiverr/chisato-md'
                })
            }
            
            if (!stickerBuffer || stickerBuffer.length === 0) {
                await react('❌')
                return await reply(`❌ ${font.smallCaps('Failed to create sticker! Please try with a different image/video')}.`)
            }
            
            await sock.sendMessage(msg.key.remoteJid, {
                sticker: stickerBuffer
            })
            
            await react('✅')
            
        } catch (error) {
            console.error('Sticker error:', error)
            await react('❌')
            
            let errorMessage = `❌ ${font.smallCaps('Failed to create sticker')}!`
            
            if (error.message.includes('download')) {
                errorMessage += `\n💡 ${font.smallCaps('The media might be too old or corrupted')}.`
            } else if (error.message.includes('format') || error.message.includes('type')) {
                errorMessage += `\n💡 ${font.smallCaps('Please use a valid image or video format (JPG, PNG, MP4, etc.)')}.`
            } else if (error.message.includes('size')) {
                errorMessage += `\n💡 ${font.smallCaps('The file is too large. Try with a smaller image/video')}.`
            } else if (error.message.includes('ffmpeg')) {
                errorMessage += `\n💡 ${font.smallCaps('Media conversion failed. Try with a different file')}.`
            } else {
                errorMessage += `\n💡 ${font.smallCaps('Please try again with a different image/video')}.`
            }
            
            await reply(errorMessage)
        }
    }
}

async function streamToBuffer(stream) {
    const chunks = []
    for await (const chunk of stream) {
        chunks.push(chunk)
    }
    return Buffer.concat(chunks)
}

