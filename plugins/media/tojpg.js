import { getContentType, downloadMediaMessage } from '@whiskeysockets/baileys'
import { fileTypeFromBuffer } from 'file-type'
import font from '../../lib/font.js'

export default {
    command: 'tojpg',
    aliases: ['topng', 'toimage2'],
    category: 'media',
    description: 'Convert sticker to image (simple version)',
    usage: '',
    limit: 1,
    cooldown: 5,
    
    async execute(context) {
        const { msg, sock, react } = context
        
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
                    return
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
                    return
                }
            }
            
            if (!mediaMessage) {
                await react('❌')
                return
            }
            
            const fileSize = mediaMessage.fileLength || 0
            if (fileSize > 15 * 1024 * 1024) {
                await react('❌')
                return
            }
            
            let buffer = await downloadMediaMessage(downloadMessage, sock)
            if (buffer && typeof buffer.read === 'function') {
                buffer = await streamToBuffer(buffer)
            }
            
            if (!buffer || buffer.length === 0) {
                await react('❌')
                return
            }
            
            // Send WebP sticker as image directly (WhatsApp can handle WebP as image)
            await sock.sendMessage(msg.key.remoteJid, {
                image: buffer
            }, { quoted: msg })
            
            await react('✅')
            
        } catch (error) {
            console.error('ToJpg error:', error)
            await react('❌')
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
