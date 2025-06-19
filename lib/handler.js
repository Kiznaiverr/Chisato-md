import { getContentType } from '@whiskeysockets/baileys'
import chalk from 'chalk'
import config from './config.js'
import logSymbols from 'log-symbols'

const logInfo = (...args) => console.log(logSymbols.info, ...args)
const logSuccess = (...args) => console.log(logSymbols.success, ...args)
const logWarn = (...args) => console.log(logSymbols.warning, ...args)
const logError = (...args) => console.log(logSymbols.error, ...args)

export class Handler {
    constructor(sock, db, plugins) {
        this.sock = sock
        this.db = db
        this.plugins = plugins
        this.config = config
    }async handleMessage(m) {
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
                    console.error('Error getting group metadata:', error)
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
            }

            // Enhanced message logging with command detection
            const timeStr = new Date().toLocaleTimeString('id-ID', { 
                timeZone: 'Asia/Jakarta',
                hour12: false 
            })
            
            // Check if message is a command
            const botPrefix = this.config.getPrefix()
            let messageColor = chalk.white
            let commandStatus = ''
            
            if (body && body.startsWith(botPrefix)) {
                const commandText = body.slice(botPrefix.length).trim()
                const [command] = commandText.split(' ')
                const cmd = command.toLowerCase()
                
                // Check if command exists
                const plugin = this.plugins.find(p => 
                    p.command === cmd || (p.aliases && p.aliases.includes(cmd))
                )
                
                if (plugin) {
                    messageColor = chalk.yellow
                    commandStatus = chalk.green(' ✓')
                } else {
                    messageColor = chalk.red
                    commandStatus = chalk.red(' ✗')
                }
            }
            
            // Format chat type with icons
            const chatType = isGroup 
                ? chalk.blue(`👥 [${(groupMetadata?.subject || 'Group').substring(0, 20)}...]`)
                : chalk.magenta(`💬 [Private]`)
            
            // Helper komponen warna log
            const box = (text, bg, fg = chalk.white) => bg(fg(text))
            const label = (text) => chalk.bgWhite.black(` ${text} `)
            const value = (text) => chalk.bgBlue.white(` ${text} `)
            const ok = (text) => chalk.bgGreen.black(` ${text} `)
            const fail = (text) => chalk.bgRed.white(` ${text} `)
            const warn = (text) => chalk.bgYellow.black(` ${text} `)
            const info = (text) => chalk.bgCyan.black(` ${text} `)
            const cat = (category) => chalk.bgMagenta.white(` ${category.toUpperCase()} `)

            // Logging pesan masuk
            let logMsg = `${timeStr} | ${isGroup ? `[${(groupMetadata?.subject || 'Group').substring(0, 20)}]` : '[Private]'} | ${pushName} | ${body || messageType}`
            // Hindari ReferenceError: plugin
            if (body && body.startsWith(botPrefix)) {
                const commandText = body.slice(botPrefix.length).trim()
                const [command] = commandText.split(' ')
                const cmd = command.toLowerCase()
                const foundPlugin = this.plugins.find(p => p.command === cmd || (p.aliases && p.aliases.includes(cmd)))
                logMsg += foundPlugin ? ' ✔' : ' ✖'
            }
            logInfo(logMsg)

            // Check for commands - only respond when prefix is used
            if (body && body.startsWith(botPrefix)) {
                await this.handleCommand(context)
            }

        } catch (error) {
            console.error(chalk.red('❌ Error handling message:'), error)
        }
    }    async handleCommand(context) {
        const { body, sender, isGroup, msg, groupMetadata } = context
        const prefix = this.config.getPrefix()
        const commandText = body.slice(prefix.length).trim()
        const [command, ...args] = commandText.split(' ')
        const cmd = command.toLowerCase()        // Find plugin
        const plugin = this.plugins.find(p => 
            p.command === cmd || (p.aliases && p.aliases.includes(cmd))
        )

        if (!plugin) {
            if (body && body.trim() === prefix) {
                return
            }
            const notFoundTimeStr = new Date().toLocaleTimeString('id-ID', { 
                timeZone: 'Asia/Jakarta',
                hour12: false 
            })
            logWarn(`${notFoundTimeStr} | NOT FOUND: ${prefix}${cmd} | ${context.pushName} | Command does not exist`)
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
            
            console.log(
                chalk.gray(`[${cooldownTimeStr}]`) + 
                chalk.yellow(` ⏱️ COOLDOWN:`) + 
                chalk.bold.yellow(` ${prefix}${cmd}`) +
                chalk.gray(` │ `) +
                chalk.cyan(`${context.pushName}`) +
                chalk.gray(` │ `) +
                chalk.yellow(`${cooldown}s remaining`)
            )
            
            await context.reply(this.config.get('replyMessages', 'cooldown').replace('{cooldown}', cooldown))
            return
        }        // Check if command is group only
        if (plugin.groupOnly && !isGroup) {
            this.logPermissionDenied('GROUP ONLY', cmd, context.pushName, 'Command requires group chat')
            await context.reply(this.config.get('replyMessages', 'groupOnly'))
            return
        }

        // Check if command is private only
        if (plugin.privateOnly && isGroup) {
            this.logPermissionDenied('PRIVATE ONLY', cmd, context.pushName, 'Command requires private chat')
            await context.reply(this.config.get('replyMessages', 'privateOnly'))
            return
        }

        // Check if user is admin (for admin commands)
        if (plugin.adminOnly && !this.config.isAdmin(sender) && !this.config.isOwner(sender)) {
            this.logPermissionDenied('ADMIN ONLY', cmd, context.pushName, 'User is not admin')
            await context.reply(this.config.get('replyMessages', 'adminOnly'))
            return
        }
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

            // Check if user has admin privileges in group (for admin commands in groups)
            if (plugin.adminOnly && isGroup && groupMetadata) {
                const groupAdmins = groupMetadata.participants?.filter(p => p.admin)?.map(p => p.id) || []
                if (!groupAdmins.includes(sender) && !this.config.isOwner(sender)) {
                    await context.reply(this.config.get('replyMessages', 'needAdmin'))
                    return
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
            context.plugins = this.plugins            // Execute plugin
            await plugin.execute(context)

            // Add experience
            this.db.addExp(sender, 5)

            const execTimeStr = new Date().toLocaleTimeString('id-ID', { 
                timeZone: 'Asia/Jakarta',
                hour12: false 
            })
            logSuccess(`${execTimeStr} | EXECUTED: ${prefix}${cmd} | ${context.pushName} | ${isGroup ? (groupMetadata?.subject || 'Group').substring(0, 15) : 'Private'} | +5 exp`)

        } catch (error) {
            const errorTimeStr = new Date().toLocaleTimeString('id-ID', { 
                timeZone: 'Asia/Jakarta',
                hour12: false 
            })
            logError(`${errorTimeStr} | ERROR: ${body || ''} | ${error.message || 'Unknown error'}`)
            await context.reply(this.config.get('replyMessages', 'error'))
        }
    }

    async handleNonCommand(context) {
        // Handle auto-responses, level up notifications, etc.
        const { sender, body, isGroup } = context

        // Check for auto-responses
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

        // Update user last seen
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
                // Don't send welcome/bye message for bot itself
                if (participant === botNumber) continue
                
                if (action === 'add' && groupData.welcome) {
                    const welcomeMsg = this.config.get('replyMessages', 'welcome').replace('@{user}', participant.split('@')[0])
                    await this.sock.sendMessage(id, {
                        text: welcomeMsg,
                        mentions: [participant]
                    })
                } else if (action === 'remove' && groupData.bye) {
                    const byeMsg = this.config.get('replyMessages', 'goodbye').replace('@{user}', participant.split('@')[0])
                    await this.sock.sendMessage(id, {
                        text: byeMsg,
                        mentions: [participant]
                    })
                }
            }
        } catch (error) {
            console.error(chalk.red('❌ Error handling group update:'), error)
        }
    }

    async handleGroupsUpdate(updates) {
        // Handle group settings updates
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

    // Helper method for logging permission denied
    logPermissionDenied(type, cmd, pushName, reason) {
        const timeStr = new Date().toLocaleTimeString('id-ID', { 
            timeZone: 'Asia/Jakarta',
            hour12: false 
        })
        logWarn(`${timeStr} | ${type}: .${cmd} | ${pushName} | ${reason}`)
    }
}
