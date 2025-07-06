import { sticker } from '../../lib/sticker.js'
import axios from 'axios'
import font from '../../lib/font.js'

export default {
    command: 'qc',
    aliases: ['quote', 'quotly'],
    category: 'media',
    description: 'Create quote sticker from text',
    usage: '<text>',
    limit: 1,
    cooldown: 5,
    
    async execute({ msg, sock, reply, react, args, config }) {
        try {
            await react('🕔')
            
            let text
            if (args.length >= 1) {
                text = args.join(' ')
            } else if (msg.message.extendedTextMessage?.contextInfo?.quotedMessage?.conversation) {
                text = msg.message.extendedTextMessage.contextInfo.quotedMessage.conversation
            } else if (msg.message.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text) {
                text = msg.message.extendedTextMessage.contextInfo.quotedMessage.extendedTextMessage.text
            } else {
                await react('❌')
                return reply(`❌ ${font.smallCaps('Please provide text for the quote')}!\n\n💡 ${font.smallCaps('Usage')}:\n• ${font.smallCaps('Type: .qc Your text here')}\n• ${font.smallCaps('Reply to message: .qc')}\n\n${font.smallCaps('Example: .qc Hello world!')}`)
            }
            
            if (!text || text.trim() === '') {
                await react('❌')
                return reply(`❌ ${font.smallCaps('Text cannot be empty')}!`)
            }
            
            if (text.length > 10000) {
                await react('❌')
                return reply(`❌ ${font.smallCaps('Text too long! Maximum 10000 characters')}.`)
            }
            
            // Get user profile picture
            let profilePicture
            try {
                profilePicture = await sock.profilePictureUrl(msg.key.participant || msg.key.remoteJid, 'image')
            } catch (error) {
                profilePicture = 'https://i.ibb.co/3Fh9V6p/avatar-contact.png'
            }
            
            // Get user name from push name or phone number
            const userName = msg.pushName || msg.key.participant?.split('@')[0] || msg.key.remoteJid?.split('@')[0] || 'User'
            
            // Create quote object for API
            const quoteObj = {
                type: 'quote',
                format: 'png',
                backgroundColor: '#0A1019',
                width: 512,
                height: 768,
                scale: 2,
                messages: [
                    {
                        entities: [],
                        avatar: true,
                        from: {
                            id: 1,
                            name: userName,
                            photo: {
                                url: profilePicture
                            }
                        },
                        text: text,
                        replyMessage: {}
                    }
                ]
            }
            
            // Generate quote image
            let quoteResponse
            try {
                quoteResponse = await axios.post('https://quotly.netorare.codes/generate', quoteObj, {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000
                })
            } catch (apiError) {
                // Try alternative API if the first one fails
                try {
                    quoteResponse = await axios.post('https://bot.lyo.su/quote/generate', quoteObj, {
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        timeout: 30000
                    })
                } catch (secondApiError) {
                    throw new Error(`${font.smallCaps('Quote generation failed')}`)
                }
            }
            
            if (!quoteResponse.data || !quoteResponse.data.result || !quoteResponse.data.result.image) {
                throw new Error(`${font.smallCaps('Invalid response from quote API')}`)
            }
            
            // Convert base64 to buffer
            const imageBuffer = Buffer.from(quoteResponse.data.result.image, 'base64')
            
            if (!imageBuffer || imageBuffer.length === 0) {
                throw new Error(`${font.smallCaps('Failed to generate quote image')}`)
            }
            
            // Get bot settings for sticker metadata
            const botSettings = config.get('botSettings')
            const ownerSettings = config.get('ownerSettings')
            
            const packname = botSettings.botName || 'Chisato-MD'
            const author = ownerSettings.ownerName || 'Kiznavierr'
            
            // Convert to sticker
            const stickerBuffer = await sticker(imageBuffer, null, packname, author, ['💬', '📝'], {
                'android-app-store-link': 'https://github.com/kiznaiverr/chisato-md',
                'ios-app-store-link': 'https://github.com/kiznaiverr/chisato-md',
                'quote-text': text.substring(0, 100),
                'quote-author': userName
            })
            
            if (!stickerBuffer || stickerBuffer.length === 0) {
                throw new Error(`${font.smallCaps('Failed to create quote sticker')}`)
            }
            
            // Send sticker
            await sock.sendMessage(msg.key.remoteJid, {
                sticker: stickerBuffer
            }, { quoted: msg })
            
            await react('✅')
            
        } catch (error) {
            console.error('QC error:', error)
            await react('❌')
            
            let errorMessage = `❌ ${font.smallCaps('Failed to create quote sticker')}!`
            
            if (error.message.includes('timeout')) {
                errorMessage += `\n💡 ${font.smallCaps('Request timeout. Please try again')}.`
            } else if (error.message.includes('generation')) {
                errorMessage += `\n💡 ${font.smallCaps('Quote generation failed. Try with different text')}.`
            } else if (error.message.includes('Invalid response')) {
                errorMessage += `\n💡 ${font.smallCaps('API returned invalid response. Please try again')}.`
            } else if (error.message.includes('sticker')) {
                errorMessage += `\n💡 ${font.smallCaps('Failed to convert to sticker. Please try again')}.`
            } else if (error.message.includes('network') || error.message.includes('ENOTFOUND')) {
                errorMessage += `\n💡 ${font.smallCaps('Network error. Please check your connection')}.`
            } else {
                errorMessage += `\n💡 ${font.smallCaps('Please try again with different text')}.`
            }
            
            await reply(errorMessage)
        }
    }
}
