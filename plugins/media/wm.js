import { getContentType } from '@whiskeysockets/baileys'
import { sticker } from '../../lib/sticker.js'
import { fileTypeFromBuffer } from 'file-type'

export default {
    command: 'wm',
    aliases: ['watermark', 'setwm'],
    description: 'Add watermark to sticker',
    category: 'media',
    usage: '.wm <packname> <author> (reply to image/video)',
    limit: 2,
    cooldown: 5,
    
    async execute(context) {
        const { reply, msg, sock, react, args } = context
        
        try {
            await react('⏳')
            
            // Check arguments
            if (args.length < 2) {
                await react('❌')
                return await reply('❌ Please provide both packname and author!\n\n💡 Usage:\n.wm "Pack Name" "Author Name"\n\nExample:\n.wm "My Stickers" "John Doe"')
            }
            
            // Parse packname and author from arguments
            const text = args.join(' ')
            const matches = text.match(/"([^"]+)"\s+"([^"]+)"/) || text.match(/(\S+)\s+(.+)/)
            
            if (!matches) {
                await react('❌')
                return await reply('❌ Invalid format!\n\n💡 Usage:\n.wm "Pack Name" "Author Name"\n\nOr:\n.wm PackName AuthorName')
            }
            
            const packname = matches[1].trim()
            const author = matches[2].trim()
            
            if (!packname || !author) {
                await react('❌')
                return await reply('❌ Both packname and author are required!')
            }
            
            // Check if replying to media
            const quotedMessage = msg.message.extendedTextMessage?.contextInfo?.quotedMessage
            
            if (!quotedMessage) {
                await react('❌')
                return await reply('❌ Please reply to an image or video!\n\n💡 Usage:\n1. Reply to an image/video\n2. Type .wm "Pack Name" "Author Name"')
            }
            
            const quotedType = getContentType(quotedMessage)
            if (quotedType !== 'imageMessage' && quotedType !== 'videoMessage') {
                await react('❌')
                return await reply('❌ Please reply to an image or video only!')
            }
            
            const mediaMessage = quotedMessage[quotedType]
            const downloadMessage = {
                key: {
                    remoteJid: msg.key.remoteJid,
                    id: msg.message.extendedTextMessage.contextInfo.stanzaId,
                    participant: msg.message.extendedTextMessage.contextInfo.participant
                },
                message: quotedMessage
            }
            
            // Check file size
            const fileSize = mediaMessage.fileLength || 0
            if (fileSize > 15 * 1024 * 1024) {
                await react('❌')
                return await reply('❌ File too large! Maximum size is 15MB.')
            }
            
            await reply(`🔄 Creating sticker with watermark...\n📦 Pack: ${packname}\n👤 Author: ${author}`)
            
            // Download media
            const buffer = await sock.downloadMediaMessage(downloadMessage)
            
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
            
            // Create sticker with custom watermark
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
