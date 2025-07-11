import { getContentType } from '@whiskeysockets/baileys'
import config from './config.js'
import font from './font.js'
import logger from './logger.js'

export class Handler {
    constructor(sock, db, plugins) {
        this.sock = sock
        this.db = db
        this.plugins = plugins
        this.config = config
    }    
    updatePlugins(newPlugins) {
        const oldCount = this.plugins.length
        this.plugins.length = 0
        this.plugins.push(...newPlugins)
        
        if (newPlugins.length !== oldCount) {
            logger.plugin('updated', `${oldCount} to ${newPlugins.length} plugins`)
        } else {
            logger.plugin('refreshed', `${newPlugins.length} plugins`)
        }
    }

    async handleMessage(m) {
        try {
            const msg = m.messages[0]
            if (!msg.message) return
            
            // Make sure bot doesn't reply to its own messages
            if (msg.key.fromMe) return
            
            // Don't respond to status/broadcast messages
            if (msg.key.remoteJid === 'status@broadcast') return
              
            // Additional check to prevent replying to bot's own messages
            const botNumber = this.sock.user?.id?.split(':')[0]
            if (botNumber && msg.key.participant?.includes(botNumber)) return
            if (botNumber && msg.key.remoteJid?.includes(botNumber) && !msg.key.remoteJid?.endsWith('@g.us')) return
            
            const messageType = getContentType(msg.message)
            const body = this.getMessageBody(msg, messageType)
            const isGroup = msg.key.remoteJid.endsWith('@g.us')
            const sender = msg.key.participant || msg.key.remoteJid
            
            // Get group metadata safely
            let groupMetadata = null
            if (isGroup) {
                try {
                    groupMetadata = await this.sock.groupMetadata(msg.key.remoteJid)
                } catch (error) {
                    logger.error('Error getting group metadata:', error)
                    groupMetadata = null
                }
            }
            
            const pushName = msg.pushName || 'Unknown'

            // Create message context
            const context = {
                sock: this.sock,
                msg,
                body,
                messageType,
                isGroup,
                sender,
                groupMetadata,
                pushName,
                db: this.db,
                config: this.config,
                reply: (text) => this.reply(msg, text),
                react: (emoji) => this.react(msg, emoji)
            }

            // Check if user is banned
            if (this.db.isBanned(sender)) {
                return
            }            // Group protection features (antilink & antispam)
            if (isGroup && groupMetadata) {
                const groupData = this.db.getGroup(msg.key.remoteJid)
                const isAdmin = this.config.isAdmin(sender) || this.config.isOwner(sender)
                const isBotAdmin = groupMetadata.participants?.find(p => p.id === (this.sock.user?.id?.split(':')[0] + '@s.whatsapp.net'))?.admin
                const isWhitelisted = groupData.whitelist && groupData.whitelist.includes(sender)
                
                // Only apply protections to non-admin, non-whitelisted users
                if (!isAdmin && !isWhitelisted && body) {                    // Antilink protection
                    if (groupData.antilink && isBotAdmin) {
                        const linkRegex = /(https?:\/\/)?(?:www\.)?(?:chat\.whatsapp\.com|wa\.me)\/[^\s]+/gi
                        if (linkRegex.test(body)) {                            try {
                                await this.sock.sendMessage(msg.key.remoteJid, {
                                    delete: msg.key
                                })
                                
                                const action = groupData.antilinkAction || 'delete'
                                const userName = `@${sender.split('@')[0]}`
                                
                                if (action === 'warn') {
                                    await this.sock.sendMessage(msg.key.remoteJid, {
                                        text: `⚠️ *${font.smallCaps('Antilink Protection')}*\n\n${userName} ${font.smallCaps('Group links are not allowed')}!\n${font.smallCaps('This is a warning. Repeated violations may result in removal')}.`,
                                        mentions: [sender]
                                    })
                                } else if (action === 'kick') {
                                    await this.sock.sendMessage(msg.key.remoteJid, {
                                        text: `🚫 *${font.smallCaps('Antilink Protection')}*\n\n${userName} ${font.smallCaps('has been removed for posting group links')}!`,
                                        mentions: [sender]
                                    })
                                    await this.sock.groupParticipantsUpdate(msg.key.remoteJid, [sender], 'remove')
                                }
                                
                                return
                            } catch (error) {
                                logger.error('Error in antilink protection:', error)
                            }
                        }
                    }
                    
                    // Antispam protection
                    if (groupData.antispam) {
                        const now = Date.now()
                        const spamKey = `${sender}_${msg.key.remoteJid}`
                        
                        if (!this.spamTracker) this.spamTracker = new Map()
                        
                        const userSpamData = this.spamTracker.get(spamKey) || { count: 0, lastMessage: now, messages: [] }
                          userSpamData.messages = userSpamData.messages.filter(time => now - time < 60000)
                        
                        userSpamData.messages.push(now)
                        userSpamData.lastMessage = now
                        
                        if (userSpamData.messages.length > 5) {
                            try {
                                if (isBotAdmin) {
                                    await this.sock.sendMessage(msg.key.remoteJid, {
                                        text: `⚠️ *${font.smallCaps('Antispam Protection')}*\n\n@${sender.split('@')[0]} ${font.smallCaps('You are sending messages too quickly! Please slow down')}.`,
                                        mentions: [sender]
                                    })
                                    
                                    this.spamTracker.delete(spamKey)
                                }
                                return
                            } catch (error) {
                                logger.error('Error handling spam:', error)
                            }
                        }
                        
                        this.spamTracker.set(spamKey, userSpamData)
                    }                // Antisticker protection
                    if (groupData.antisticker && isBotAdmin && messageType === 'stickerMessage') {
                        try {
                            await this.sock.sendMessage(msg.key.remoteJid, {
                                delete: msg.key
                            })
                            
                            const action = groupData.antistickerAction || 'delete'
                            const userName = `@${sender.split('@')[0]}`
                            
                            if (action === 'warn') {
                                await this.sock.sendMessage(msg.key.remoteJid, {
                                    text: `⚠️ *${font.smallCaps('Antisticker Protection')}*\n\n${userName} ${font.smallCaps('Stickers are not allowed in this group')}!\n${font.smallCaps('This is a warning. Repeated violations may result in removal')}.`,
                                    mentions: [sender]
                                })
                            } else if (action === 'kick') {
                                await this.sock.sendMessage(msg.key.remoteJid, {
                                    text: `🚫 *${font.smallCaps('Antisticker Protection')}*\n\n${userName} ${font.smallCaps('has been removed for sending stickers')}!`,
                                    mentions: [sender]
                                })
                                await this.sock.groupParticipantsUpdate(msg.key.remoteJid, [sender], 'remove')
                            }
                            
                            return
                        } catch (error) {
                            logger.error('Error in antisticker protection:', error)
                        }
                    }
                }
            }

            // Enhanced message logging with command detection
            const botPrefix = this.config.getPrefix()
            const isCommand = this.isValidCommand(body, botPrefix)
            
            // Log pesan masuk
            const chatType = isGroup ? 'GROUP' : 'PRIVATE'
            const chatName = isGroup ? (groupMetadata?.subject || 'Unknown Group') : 'Private Chat'
            const messageContent = body || `[${messageType}]`
            
            if (isCommand) {
                const { command: cmd } = this.parseCommand(body, botPrefix)
                const plugin = this.plugins.find(p => 
                    p.command === cmd || (p.aliases && p.aliases.includes(cmd))
                )
                
                if (plugin) {
                    // Log command sekali saja saat detection
                    logger.command(cmd, 'detected', chatType.toLowerCase(), pushName)
                } else {
                    // Log command yang tidak ditemukan
                    logger.command(cmd, 'not_found', chatType.toLowerCase(), pushName)
                }
            } else {
                // Log regular message
                logger.info(`${chatType} | ${chatName} | ${pushName} | ${messageContent}`)
            }

            if (this.isValidCommand(body, botPrefix)) {
                await this.handleCommand(context)
            }

        } catch (error) {
            logger.error('Error handling message:', error)
        }
    }    async handleCommand(context) {
        const { body, sender, isGroup, msg, groupMetadata } = context
        const prefix = this.config.getPrefix()
        const { command, args } = this.parseCommand(body, prefix)
        const cmd = command.toLowerCase()// Find plugin
        const plugin = this.plugins.find(p => 
            p.command === cmd || (p.aliases && p.aliases.includes(cmd))
        )

        if (!plugin) {
            if (body && body.trim() === prefix) {
                return
            }
            logger.warn(`Command not found: ${prefix}${cmd} | ${context.pushName}`)
            return
        }

        // Check cooldown
        const cooldown = this.db.checkCooldown(sender, cmd)
        if (cooldown > 0) {
            // Log cooldown
            const cooldownTimeStr = new Date().toLocaleTimeString('id-ID', { 
                timeZone: 'Asia/Jakarta',
                hour12: false 
            })
            
            logger.warn('COOLDOWN', `Command "${prefix}${cmd}" by ${context.pushName} - ${cooldown}s remaining`)
            
            await context.reply(this.config.get('replyMessages', 'cooldown').replace('{cooldown}', cooldown))
            return
        }        // Check if command is group only
        if (plugin.groupOnly && !isGroup) {
            logger.warn('ACCESS', `Command "${cmd}" denied for ${context.pushName} - Group only`)
            await context.reply(this.config.get('replyMessages', 'groupOnly'))
            return
        }

        // Check if command is private only
        if (plugin.privateOnly && isGroup) {
            this.logPermissionDenied('PRIVATE ONLY', cmd, context.pushName, 'Command requires private chat')
            await context.reply(this.config.get('replyMessages', 'privateOnly'))
            return
        }

        // Skip admin check here - will be handled later for group context
        // Check if user is owner (for owner commands)
        if (plugin.ownerOnly && !this.config.isOwner(sender)) {
            this.logPermissionDenied('OWNER ONLY', cmd, context.pushName, 'User is not owner')
            await context.reply(this.config.get('replyMessages', 'ownerOnly'))
            return
        }

        // Check if user is premium (for premium commands)
        if (plugin.premium && !this.db.isPremium(sender)) {
            await context.reply(this.config.get('replyMessages', 'premiumOnly'))
            return
        }        // Check limit (owner and premium users bypass limit)
        if (plugin.limit && !this.config.isOwner(sender) && !this.db.isPremium(sender)) {
            if (!this.db.useLimit(sender, plugin.limit)) {
                const user = this.db.getUser(sender)
                await context.reply(this.config.get('replyMessages', 'limitReached').replace('{limit}', user.limit))
                return
            }
        }try {
            // Check if bot has admin privileges (for bot admin commands)
            if (plugin.botAdmin && isGroup && groupMetadata) {
                const botNumber = this.sock.user.id.split(':')[0] + '@s.whatsapp.net'
                const groupAdmins = groupMetadata.participants?.filter(p => p.admin)?.map(p => p.id) || []
                if (!groupAdmins.includes(botNumber)) {
                    await context.reply(this.config.get('replyMessages', 'botAdmin'))
                    return
                }
            }

            // Check if user has admin privileges (for admin commands)
            if (plugin.adminOnly) {
                // Always allow bot owner
                if (this.config.isOwner(sender)) {
                    // Owner can use admin commands anywhere
                } else if (isGroup && groupMetadata) {
                    // In groups, check group admin status
                    const groupAdmins = groupMetadata.participants?.filter(p => p.admin)?.map(p => p.id) || []
                    if (!groupAdmins.includes(sender)) {
                        this.logPermissionDenied('ADMIN ONLY', cmd, context.pushName, 'User is not group admin')
                        await context.reply(this.config.get('replyMessages', 'adminOnly'))
                        return
                    }
                } else {
                    // In private chat, check bot admin status
                    if (!this.config.isAdmin(sender)) {
                        this.logPermissionDenied('ADMIN ONLY', cmd, context.pushName, 'User is not bot admin')
                        await context.reply(this.config.get('replyMessages', 'adminOnly'))
                        return
                    }
                }
            }

            // Set cooldown
            if (plugin.cooldown) {
                this.db.setCooldown(sender, cmd, plugin.cooldown * 1000)
            }

            // Add context for plugin
            context.command = cmd
            context.args = args
            context.text = args.join(' ')
            context.prefix = prefix
            context.groupMetadata = groupMetadata
            context.plugins = this.plugins
            
            // Add admin status helpers
            if (isGroup && groupMetadata) {
                const groupAdmins = groupMetadata.participants?.filter(p => p.admin)?.map(p => p.id) || []
                context.isGroupAdmin = groupAdmins.includes(sender) || this.config.isOwner(sender)
                const botNumber = this.sock.user.id.split(':')[0] + '@s.whatsapp.net'
                context.isBotAdmin = groupAdmins.includes(botNumber)
            } else {
                context.isGroupAdmin = false
                context.isBotAdmin = false
            }
            context.isOwner = this.config.isOwner(sender)
            context.isBotGlobalAdmin = this.config.isAdmin(sender) || this.config.isOwner(sender)            // Execute plugin
            await plugin.execute(context)

            // Add experience
            this.db.addExp(sender, 5)
            
            // Command executed successfully - tidak perlu log untuk mengurangi spam

        } catch (error) {
            // Log command error saja
            const chatType = isGroup ? 'group' : 'private'
            logger.command(cmd, 'error', chatType, context.pushName)
            logger.error(`Command execution failed: ${error.message || 'Unknown error'}`)
            await context.reply(this.config.get('replyMessages', 'error'))
        }
    }

    async handleNonCommand(context) {
        const { sender, body, isGroup } = context

        if (body) {
            const autoResponses = {
                'hi': 'Hello! 👋',
                'hello': 'Hi there! 👋',
                'bot': 'Yes, I am a bot! 🤖'
            }

            const lowerBody = body.toLowerCase()
            for (const [trigger, response] of Object.entries(autoResponses)) {
                if (lowerBody.includes(trigger)) {
                    await context.reply(response)
                    break
                }
            }
        }

        const user = this.db.getUser(sender)
        user.lastSeen = Date.now()
        this.db.saveUsers()
    }    async handleGroupUpdate(update) {
        try {
            const { id, participants, action } = update
            const groupData = this.db.getGroup(id)

            if (!groupData.welcome && !groupData.bye) return

            const botNumber = this.sock.user?.id?.split(':')[0] + '@s.whatsapp.net'

            for (const participant of participants) {
                if (participant === botNumber) continue
                
                if (action === 'add' && groupData.welcome) {
                    let welcomeMsg = groupData.welcomeText || this.config.get('replyMessages', 'welcome')
                    
                    // Replace variables
                    welcomeMsg = welcomeMsg
                        .replace(/@user/g, `@${participant.split('@')[0]}`)
                        .replace(/@{user}/g, participant.split('@')[0])
                        .replace(/@group/g, groupData.name || 'This Group')
                        .replace(/@date/g, new Date().toLocaleDateString('id-ID'))
                        .replace(/@time/g, new Date().toLocaleTimeString('id-ID'))
                    
                    await this.sock.sendMessage(id, {
                        text: welcomeMsg,
                        mentions: [participant]
                    })
                } else if (action === 'remove' && groupData.bye) {
                    let byeMsg = groupData.byeText || this.config.get('replyMessages', 'goodbye')
                    
                    // Replace variables
                    byeMsg = byeMsg
                        .replace(/@user/g, `@${participant.split('@')[0]}`)
                        .replace(/@{user}/g, participant.split('@')[0])
                        .replace(/@group/g, groupData.name || 'This Group')
                        .replace(/@date/g, new Date().toLocaleDateString('id-ID'))
                        .replace(/@time/g, new Date().toLocaleTimeString('id-ID'))
                    
                    await this.sock.sendMessage(id, {
                        text: byeMsg,
                        mentions: [participant]
                    })
                }
            }
        } catch (error) {
            logger.error('Error handling group update:', error)
        }
    }

    async handleGroupsUpdate(updates) {
        for (const update of updates) {
            const groupData = this.db.getGroup(update.id)
            if (update.subject) {
                groupData.name = update.subject
                this.db.saveGroups()
            }
        }
    }

    getMessageBody(msg, messageType) {
        switch (messageType) {
            case 'conversation':
                return msg.message.conversation
            case 'extendedTextMessage':
                return msg.message.extendedTextMessage.text
            case 'imageMessage':
                return msg.message.imageMessage.caption || ''
            case 'videoMessage':
                return msg.message.videoMessage.caption || ''
            case 'documentMessage':
                return msg.message.documentMessage.caption || ''
            default:
                return ''
        }
    }

    async reply(msg, text) {
        return await this.sock.sendMessage(msg.key.remoteJid, {
            text: text
        }, {
            quoted: msg
        })
    }

    async react(msg, emoji) {
        return await this.sock.sendMessage(msg.key.remoteJid, {
            react: {
                text: emoji,
                key: msg.key
            }
        })
    }    
    async sendContact(chat, contacts, msg, options = {}) {
        const { org, website, email, note, categories } = options
        
        // Format contacts array
        const formattedContacts = contacts.map(contact => {
            let vcard = `BEGIN:VCARD
VERSION:3.0
FN:${contact.name || 'Contact'}`
            
            if (org) vcard += `\nORG:${org}`
            if (contact.about) vcard += `\nTITLE:${contact.about}`
            
            const cleanNumber = contact.number.replace(/[^\d]/g, '')
            vcard += `\nTEL;type=CELL;type=VOICE;waid=${cleanNumber}:+${cleanNumber}`
            
            if (website) vcard += `\nURL;type=WORK:${website}`
            if (email) vcard += `\nEMAIL;type=WORK:${email}`
            if (note) vcard += `\nNOTE:${note}`
            if (categories) vcard += `\nCATEGORIES:${categories}`
            
            vcard += `\nEND:VCARD`
            
            return {
                displayName: contact.name || 'Contact',
                vcard: vcard
            }
        })
        
        return await this.sock.sendMessage(chat, {
            contacts: {
                displayName: contacts[0]?.name || 'Contact',
                contacts: formattedContacts
            }
        }, { quoted: msg })
    }    
    logPermissionDenied(type, cmd, pushName, reason) {
        logger.warn(`${type}: .${cmd} | ${pushName} | ${reason}`)
    }

    isValidCommand(body, prefix) {
        if (!body || typeof body !== 'string') return false
        
        if (body.startsWith(prefix) && body.length > prefix.length) {
            const afterPrefix = body.slice(prefix.length)
            return afterPrefix.trim().length > 0
        }
        
        if (body.startsWith(prefix + ' ')) {
            const afterPrefix = body.slice(prefix.length + 1)
            return afterPrefix.trim().length > 0
        }
        
        return false
    }

    parseCommand(body, prefix) {
        if (!body || typeof body !== 'string') {
            return { command: '', args: [] }
        }

        let commandText = ''
        
        if (body.startsWith(prefix) && !body.startsWith(prefix + ' ')) {
            commandText = body.slice(prefix.length).trim()
        }
        else if (body.startsWith(prefix + ' ')) {
            commandText = body.slice(prefix.length + 1).trim()
        }
        
        if (!commandText) {
            return { command: '', args: [] }
        }
        
        const [command, ...args] = commandText.split(' ')
        return { 
            command: command || '', 
            args: args || [] 
        }
    }
}
