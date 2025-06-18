import { makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion } from '@whiskeysockets/baileys'
import qrcode from 'qrcode-terminal'
import chalk from 'chalk'
import pino from 'pino'
import { Handler } from './lib/handler.js'
import { Database } from './lib/database.js'
import { loadPlugins } from './lib/loader.js'

// Initialize logger
const logger = pino({ 
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

// Enhanced startup banner
console.log(chalk.cyan('\n╔══════════════════════════════════════╗'))
console.log(chalk.cyan('║') + chalk.bold.blue('        🤖 Chisato MD Bot         ') + chalk.cyan('║'))
console.log(chalk.cyan('║') + chalk.white('     WhatsApp Multi-Device Bot    ') + chalk.cyan('║'))
console.log(chalk.cyan('║') + chalk.gray('        Created by Kiznavierr      ') + chalk.cyan('║'))
console.log(chalk.cyan('╚══════════════════════════════════════╝'))

console.log(chalk.green('\n� Initializing bot systems...'))
console.log(chalk.yellow(`� Loaded ${plugins.length} plugins successfully`))
console.log(chalk.blue('🔧 Setting up WhatsApp connection...\n'))

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./session')
    const { version, isLatest } = await fetchLatestBaileysVersion()
    
    console.log(chalk.yellow(`📦 Using WA v${version.join('.')}, isLatest: ${isLatest}`))

    const sock = makeWASocket({
        version,
        logger,
        printQRInTerminal: false,
        auth: state,
        browser: ['Chisato MD', 'Chrome', '3.0'],
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,        getMessage: async (key) => {
            // Messages not stored for performance
            return undefined
        }
    })

    // Initialize handler
    const handler = new Handler(sock, db, plugins)

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update
          if (qr) {
            console.log(chalk.cyan('┌─────────────────────────────────────┐'))
            console.log(chalk.cyan('│') + chalk.bold.yellow('  📱 Scan QR Code to Connect Bot   ') + chalk.cyan('│'))
            console.log(chalk.cyan('└─────────────────────────────────────┘'))
            qrcode.generate(qr, { small: true })
        }
          if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut
            console.log(chalk.red('❌ Connection closed:'), lastDisconnect.error)
            if (shouldReconnect) {
                console.log(chalk.yellow('🔄 Reconnecting in 3 seconds...'))
                setTimeout(startBot, 3000)
            } else {
                console.log(chalk.red('🚪 Logged out. Please restart bot.'))
            }        } else if (connection === 'open') {
            const botNumber = sock.user.id.split(':')[0]
            const currentTime = new Date().toLocaleTimeString('id-ID')
            
            console.log(chalk.green('┌─────────────────────────────────────┐'))
            console.log(chalk.green('│') + chalk.bold.white('   ✅ Bot Connected Successfully!   ') + chalk.green('│'))
            console.log(chalk.green('│') + chalk.cyan(`   📱 Number: ${botNumber}`) + ' '.repeat(Math.max(0, 37 - 15 - botNumber.length)) + chalk.green('│'))
            console.log(chalk.green('│') + chalk.magenta(`   🕒 Time: ${currentTime}`) + ' '.repeat(Math.max(0, 37 - 12 - currentTime.length)) + chalk.green('│'))
            console.log(chalk.green('└─────────────────────────────────────┘'))
            console.log(chalk.yellow('📬 Bot is now ready to receive messages!\n'))
        }
    })

    sock.ev.on('creds.update', saveCreds)
    sock.ev.on('messages.upsert', handler.handleMessage.bind(handler))
    sock.ev.on('group-participants.update', handler.handleGroupUpdate.bind(handler))
    sock.ev.on('groups.update', handler.handleGroupsUpdate.bind(handler))

    return sock
}

// Start the bot
startBot().catch(err => {
    console.error(chalk.red('❌ Error starting bot:'), err)
    process.exit(1)
})

// Handle process termination
process.on('SIGINT', () => {
    console.log(chalk.yellow('\n🛑 Bot stopped by user'))
    process.exit(0)
})

process.on('uncaughtException', (err) => {
    console.error(chalk.red('❌ Uncaught Exception:'), err)
})

process.on('unhandledRejection', (err) => {
    console.error(chalk.red('❌ Unhandled Rejection:'), err)
})
