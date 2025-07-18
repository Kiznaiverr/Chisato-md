import { makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion } from '@whiskeysockets/baileys'
import qrcode from 'qrcode-terminal'
import pino from 'pino'
import { Handler } from './lib/handler.js'
import { Database } from './lib/database.js'
import { loadPlugins, startAutoReload, stopAutoReload } from './lib/loader.js'
import config from './lib/config.js'
import logger from './lib/logger.js'
import proxyManager from './lib/proxyManager.js'

const pinoLogger = pino({ 
    level: 'error',
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true
        }
    }
})

// Initialize database
const db = new Database()

// Load plugins
const plugins = await loadPlugins()

let handler = null

logger.banner()
logger.system(`Initializing ${config.getBotName()}`)
logger.system(`Created by ${config.get('botSettings', 'author')}`)
logger.separator()
logger.plugin(`Loaded ${plugins.length} plugins successfully`)
logger.system(`Prefix: ${config.getPrefix()}`)
logger.system(`Owners: ${config.getOwners().length} configured`)
logger.connection('Setting up WhatsApp connection...')

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./session')
    const { version, isLatest } = await fetchLatestBaileysVersion()
    
    logger.system(`Using WA v${version.join('.')}, isLatest: ${isLatest}`)

    const sock = makeWASocket({
        version,
        logger: pinoLogger,
        printQRInTerminal: false,
        auth: state,
        browser: [config.getBotName(), 'Chrome', '3.0'],
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        getMessage: async (key) => {
            return undefined
        }    })

    handler = new Handler(sock, db, plugins)
    
    startAutoReload((updatedPlugins) => {
        if (handler) {
            handler.updatePlugins(updatedPlugins)
        }
    })

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update
          if (qr) {
            logger.connection('QR Code generated - scan to connect')
            logger.separator()
            qrcode.generate(qr, { small: true })
            logger.separator()
        }
          if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut
            logger.error('Connection closed:', lastDisconnect.error)
            if (shouldReconnect) {
                logger.connection('Reconnecting in 3 seconds...')
                setTimeout(startBot, 3000)
            } else {
                logger.connection('Logged out. Please restart bot.')
            }        } else if (connection === 'open') {
            const botNumber = sock.user.id.split(':')[0]
            const currentTime = new Date().toLocaleTimeString('id-ID')
            
            logger.success('Bot connected successfully!')
            logger.system(`Number: ${botNumber}`)
            logger.system(`Time: ${currentTime}`)
            logger.success('Bot is now ready to receive messages!')
            logger.system('Auto-reload is active - plugins will reload on file changes')
        }
    })

    sock.ev.on('creds.update', saveCreds)
    sock.ev.on('messages.upsert', handler.handleMessage.bind(handler))
    sock.ev.on('group-participants.update', handler.handleGroupUpdate.bind(handler))
    sock.ev.on('groups.update', handler.handleGroupsUpdate.bind(handler))

    return sock
}

startBot().catch(err => {
    logger.error('Error starting bot:', err)
    process.exit(1)
})

process.on('SIGINT', () => {
    logger.system('Bot stopped by user')
    stopAutoReload()
    process.exit(0)
})

process.on('uncaughtException', (err) => {
    if (err.stack && err.stack.includes('plugins')) {
        logger.error('Plugin Error:', err)
        return
    }
    
    logger.error('Uncaught Exception:', err)
    stopAutoReload()
})

process.on('unhandledRejection', (err) => {
    if (err && err.stack && err.stack.includes('plugins')) {
        logger.error('Plugin Rejection:', err)
        return
    }
    
    logger.error('Unhandled Rejection:', err)
    stopAutoReload()
})
