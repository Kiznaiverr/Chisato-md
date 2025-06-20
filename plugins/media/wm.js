import { getContentType, downloadMediaMessage } from '@whiskeysockets/baileys'
import { sticker } from '../../lib/sticker.js'
import { fileTypeFromBuffer } from 'file-type'
import font from '../../lib/font.js'

export default {
    command: 'wm',
    aliases: ['watermark', 'setwm'],
    description: 'Add watermark',
    category: 'media',
    usage: '<packname> | <author>',
    limit: 1,
    cooldown: 5,
    
    async execute(context) {
        const { reply, msg, sock, react, args } = context
        try {
            await react('🕔')
            
            const text = args.join(' ').trim()
            let [packname, author] = text.split('|').map(s => s && s.trim())
            
            if (!packname) {
                await react('❌')
                return await reply(`❌ ${font.smallCaps('Please provide packname')}!\n\n💡 ${font.smallCaps('Usage')}:\n.wm ${font.smallCaps('PackName')} | ${font.smallCaps('AuthorName')}`)
            }
            
            if (!author) author = ''
            
            const quotedMessage = msg.message.extendedTextMessage?.contextInfo?.quotedMessage
            
            if (!quotedMessage) {
                await react('❌')
                return await reply(`❌ ${font.smallCaps('Please reply to an image or video')}!\n\n💡 ${font.smallCaps('Usage')}:\n1. ${font.smallCaps('Reply to an image/video')}\n2. ${font.smallCaps('Type .wm PackName | AuthorName')}`)
            }
            
            const quotedType = getContentType(quotedMessage)
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
                return await reply(`❌ ${font.smallCaps('Please reply to an image, video, or sticker')}!`)
            }
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
                return await reply(`❌ ${font.smallCaps('Failed to download media! Please try again')}.`)
            }
            const fileType = await fileTypeFromBuffer(buffer)
            const isVideo = fileType && fileType.mime.startsWith('video/')
            if (isVideo) {
                await react('❌')
                return await reply(`❌ ${font.smallCaps('Watermark for videos is not supported yet')}!\n💡 ${font.smallCaps('Use .sticker for video stickers without custom watermark')}.`)
            }
            const stickerBuffer = await sticker(buffer, null, packname, author, ['🎨'], {
                'android-app-store-link': 'https://github.com/kiznaiverr/chisato-md',
                'ios-app-store-link': 'https://github.com/kiznaiverr/chisato-md',
                'custom-watermark': true
            })
            if (!stickerBuffer || stickerBuffer.length === 0) {
                await react('❌')
                return await reply(`❌ ${font.smallCaps('Failed to create watermarked sticker! Please try again')}.`)
            }
            await sock.sendMessage(msg.key.remoteJid, {
                sticker: stickerBuffer
            })
            
            await react('✅')
            
        } catch (error) {
            console.error('Watermark error:', error)
            await react('❌')
            
            let errorMessage = `❌ ${font.smallCaps('Failed to create watermarked sticker')}!`
            
            if (error.message.includes('download')) {
                errorMessage += `\n💡 ${font.smallCaps('The media might be too old or corrupted')}.`
            } else if (error.message.includes('format') || error.message.includes('type')) {
                errorMessage += `\n💡 ${font.smallCaps('Please use a valid image format (JPG, PNG, etc.)')}.`
            } else if (error.message.includes('size')) {
                errorMessage += `\n💡 ${font.smallCaps('The file is too large. Try with a smaller image')}.`
            } else if (error.message.includes('wa-sticker-formatter')) {
                errorMessage += `\n💡 ${font.smallCaps('Watermark library error. Please try again')}.`
            } else {
                errorMessage += `\n💡 ${font.smallCaps('Please try again with a different image')}.`
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
