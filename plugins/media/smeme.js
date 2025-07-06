import { getContentType, downloadMediaMessage } from '@whiskeysockets/baileys'
import { sticker } from '../../lib/sticker.js'
import { uploadToChisatoCDN } from '../../lib/chisato-CDN.js'
import font from '../../lib/font.js'
import axios from 'axios'

export default {
    command: 'smeme',
    aliases: ['stickermeme', 'meme'],
    category: 'media',
    description: 'Create meme sticker with top and bottom text',
    usage: '<top text>|<bottom text>',
    limit: 1,
    cooldown: 5,
    
    async execute({ msg, sock, reply, react, args, config }) {
        try {
            await react('🕔')
            
            const text = args.join(' ').trim()
            if (!text) {
                await react('❌')
                return reply(`❌ ${font.smallCaps('Please provide text for the meme')}!\n\n💡 ${font.smallCaps('Usage')}:\n• ${font.smallCaps('Reply to image: .smeme top text|bottom text')}\n• ${font.smallCaps('Example: .smeme When you code|But it works')}\n\n${font.smallCaps('Note: Use | to separate top and bottom text')}`)
            }
            
            let [topText, bottomText] = text.split('|').map(s => s ? s.trim() : '')
            if (!topText) topText = '-'
            if (!bottomText) bottomText = '-'
            
            // Get media from current message or quoted message
            let mediaMessage = null
            let downloadMessage = null
            
            // Check if current message contains image
            const messageType = getContentType(msg.message)
            if (messageType === 'imageMessage') {
                mediaMessage = msg.message[messageType]
                downloadMessage = msg
            } else if (messageType === 'stickerMessage') {
                mediaMessage = msg.message[messageType]
                downloadMessage = msg
            } else if (messageType === 'documentMessage' && msg.message.documentMessage.mimetype?.startsWith('image/')) {
                mediaMessage = msg.message.documentMessage
                downloadMessage = msg
            } else {
                // Try to get from quoted message
                const quotedMessage = msg.message.extendedTextMessage?.contextInfo?.quotedMessage
                if (quotedMessage) {
                    const quotedType = getContentType(quotedMessage)
                    if (quotedType === 'imageMessage') {
                        mediaMessage = quotedMessage[quotedType]
                        downloadMessage = {
                            key: {
                                remoteJid: msg.key.remoteJid,
                                id: msg.message.extendedTextMessage.contextInfo.stanzaId,
                                participant: msg.message.extendedTextMessage.contextInfo.participant
                            },
                            message: quotedMessage
                        }
                    } else if (quotedType === 'stickerMessage') {
                        mediaMessage = quotedMessage[quotedType]
                        downloadMessage = {
                            key: {
                                remoteJid: msg.key.remoteJid,
                                id: msg.message.extendedTextMessage.contextInfo.stanzaId,
                                participant: msg.message.extendedTextMessage.contextInfo.participant
                            },
                            message: quotedMessage
                        }
                    } else if (quotedType === 'documentMessage' && quotedMessage.documentMessage.mimetype?.startsWith('image/')) {
                        mediaMessage = quotedMessage.documentMessage
                        downloadMessage = {
                            key: {
                                remoteJid: msg.key.remoteJid,
                                id: msg.message.extendedTextMessage.contextInfo.stanzaId,
                                participant: msg.message.extendedTextMessage.contextInfo.participant
                            },
                            message: quotedMessage
                        }
                    }
                }
                
                if (!mediaMessage) {
                    await react('❌')
                    return reply(`❌ ${font.smallCaps('Please send an image with caption or reply to an image')}!\n\n💡 ${font.smallCaps('Usage')}:\n• ${font.smallCaps('Send image with caption: .smeme top|bottom')}\n• ${font.smallCaps('Reply to image: .smeme top|bottom')}`)
                }
            }
            
            if (!mediaMessage) {
                await react('❌')
                return reply(`❌ ${font.smallCaps('No valid media found')}!`)
            }
            
            const fileSize = mediaMessage.fileLength || 0
            if (fileSize > 10 * 1024 * 1024) {
                await react('❌')
                return reply(`❌ ${font.smallCaps('File too large! Maximum size is 10MB for meme generation')}.`)
            }
            
            // Download media
            let buffer = await downloadMediaMessage(downloadMessage, sock)
            if (buffer && typeof buffer.read === 'function') {
                buffer = await streamToBuffer(buffer)
            }
            
            if (!buffer || buffer.length === 0) {
                await react('❌')
                return reply(`❌ ${font.smallCaps('Failed to download media! Please try again')}.`)
            }
            
            // Upload to CDN first
            let uploadRes
            try {
                uploadRes = await uploadToChisatoCDN(buffer, 'meme_source.jpg')
            } catch (err) {
                throw new Error(`${font.smallCaps('Failed to upload image')}`)
            }
            
            const imageUrl = uploadRes?.data?.url || uploadRes?.url
            if (!imageUrl) {
                throw new Error(`${font.smallCaps('Failed to get image URL')}`)
            }
            
            // Generate meme using memegen API
            const memeUrl = `https://api.memegen.link/images/custom/${encodeURIComponent(topText)}/${encodeURIComponent(bottomText)}.png?background=${encodeURIComponent(imageUrl)}`
            
            let memeBuffer
            try {
                const response = await axios.get(memeUrl, {
                    responseType: 'arraybuffer',
                    timeout: 30000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Chisato-MD Bot)'
                    }
                })
                memeBuffer = Buffer.from(response.data)
            } catch (err) {
                throw new Error(`${font.smallCaps('Failed to generate meme')}`)
            }
            
            if (!memeBuffer || memeBuffer.length === 0) {
                throw new Error(`${font.smallCaps('Generated meme is empty')}`)
            }
            
            // Convert to sticker
            const botSettings = config.get('botSettings')
            const ownerSettings = config.get('ownerSettings')
            
            const packname = botSettings.botName || 'Chisato-MD'
            const author = ownerSettings.ownerName || 'Kiznavierr'
            
            const stickerBuffer = await sticker(memeBuffer, null, packname, author, ['😂', '🎭'], {
                'android-app-store-link': 'https://github.com/kiznaiverr/chisato-md',
                'ios-app-store-link': 'https://github.com/kiznaiverr/chisato-md',
                'meme-text-top': topText,
                'meme-text-bottom': bottomText
            })
            
            if (!stickerBuffer || stickerBuffer.length === 0) {
                throw new Error(`${font.smallCaps('Failed to create meme sticker')}`)
            }
            
            await sock.sendMessage(msg.key.remoteJid, {
                sticker: stickerBuffer
            }, { quoted: msg })
            
            await react('✅')
            
        } catch (error) {
            console.error('SMeme error:', error)
            await react('❌')
            
            let errorMessage = `❌ ${font.smallCaps('Failed to create meme sticker')}!`
            
            if (error.message.includes('upload')) {
                errorMessage += `\n💡 ${font.smallCaps('Failed to upload image. Please try again')}.`
            } else if (error.message.includes('download')) {
                errorMessage += `\n💡 ${font.smallCaps('The media might be too old or corrupted')}.`
            } else if (error.message.includes('generate')) {
                errorMessage += `\n💡 ${font.smallCaps('Meme generation failed. Try with different text or image')}.`
            } else if (error.message.includes('size')) {
                errorMessage += `\n💡 ${font.smallCaps('The file is too large. Try with a smaller image')}.`
            } else if (error.message.includes('timeout')) {
                errorMessage += `\n💡 ${font.smallCaps('Request timeout. Please try again')}.`
            } else {
                errorMessage += `\n💡 ${font.smallCaps('Please try again with a different image or text')}.`
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
