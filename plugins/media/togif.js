import { getContentType, downloadMediaMessage } from '@whiskeysockets/baileys'
import { toGif } from '../../lib/converter.js'
import { fileTypeFromBuffer } from 'file-type'
import font from '../../lib/font.js'

export default {
    command: 'togif',
    aliases: ['gif', 'stogif'],
    category: 'media',
    description: 'Convert sticker to GIF',
    usage: '',
    limit: 1,
    cooldown: 5,
    
    async execute(context) {
        const { reply, msg, sock, react } = context
        
        let mediaMessage = null
        let downloadMessage = null
        
        try {
            await react('🕔')
            
            const messageType = getContentType(msg.message)
            if (messageType === 'stickerMessage') {
                mediaMessage = msg.message[messageType]
                downloadMessage = msg
            } else {
                // Check for quoted message
                const quotedMessage = msg.message.extendedTextMessage?.contextInfo?.quotedMessage
                
                if (!quotedMessage) {
                    await react('❌')
                    return await reply(`❌ ${font.smallCaps('Please reply to a sticker or send a sticker with caption .togif')}\n\n💡 ${font.smallCaps('Usage')}:\n• ${font.smallCaps('Reply to sticker and type .togif')}\n• ${font.smallCaps('Send sticker with caption .togif')}`)
                }
                
                const quotedType = getContentType(quotedMessage)
                if (quotedType === 'stickerMessage') {
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
                    return await reply(`❌ ${font.smallCaps('Please reply to a sticker only')}!`)
                }
            }
            
            if (!mediaMessage) {
                await react('❌')
                return await reply(`❌ ${font.smallCaps('No sticker found')}!`)
            }
            
            const fileSize = mediaMessage.fileLength || 0
            if (fileSize > 15 * 1024 * 1024) {
                await react('❌')
                return await reply(`❌ ${font.smallCaps('File too large! Maximum size is 15MB')}.`)
            }
            
            let buffer = await downloadMediaMessage(downloadMessage, sock)
            if (buffer && typeof buffer.read === 'function') {
                buffer = await streamToBuffer(buffer)
            }
            
            if (!buffer || buffer.length === 0) {
                await react('❌')
                return await reply(`❌ ${font.smallCaps('Failed to download sticker! Please try again')}.`)
            }
            
            // Determine file extension from buffer
            const fileType = await fileTypeFromBuffer(buffer)
            const ext = fileType ? fileType.ext : 'webp'
            
            // Convert sticker to GIF without showing progress message
            const result = await toGif(buffer, ext)
            const gifBuffer = await result.toBuffer()
            
            if (!gifBuffer || gifBuffer.length === 0) {
                await react('❌')
                return
            }
            
            // Send the converted GIF as document to preserve animation
            await sock.sendMessage(msg.key.remoteJid, {
                document: gifBuffer,
                fileName: `sticker_${Date.now()}.gif`,
                mimetype: 'image/gif'
            }, { quoted: msg })
            
            // Clean up temporary files
            await result.clear()
            
            await react('✅')
            
        } catch (error) {
            console.error('ToGif error:', error)
            await react('❌')
            
            // Try alternative method if ffmpeg fails
            if (error.message.includes('spawn ffmpeg ENOENT') || error.message.includes('ffmpeg')) {
                try {
                    // Fallback: send webp as document
                    let buffer = await downloadMediaMessage(downloadMessage, sock)
                    if (buffer && typeof buffer.read === 'function') {
                        buffer = await streamToBuffer(buffer)
                    }
                    
                    await sock.sendMessage(msg.key.remoteJid, {
                        document: buffer,
                        fileName: `sticker_${Date.now()}.webp`,
                        mimetype: 'image/webp'
                    }, { quoted: msg })
                    
                    await react('✅')
                } catch (fallbackError) {
                    console.error('Fallback ToGif error:', fallbackError)
                    await react('❌')
                }
            }
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
