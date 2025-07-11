import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import logger from './logger.js'

class ConfigManager {
    constructor() {
        this.configPath = join(process.cwd(), 'config.json')
        this.config = this.loadConfig()
    }

    loadConfig() {
        try {
            if (!existsSync(this.configPath)) {
                logger.system('config.json not found! Creating default config...')
                logger.system('Please edit config.json with your settings before running the bot again')
                return this.createDefaultConfig()
            }
            
            const configData = readFileSync(this.configPath, 'utf8')
            const config = JSON.parse(configData)
            
            logger.system('Configuration loaded from config.json')
            return config
        } catch (error) {
            logger.error('Error loading config.json:', error.message)
            logger.system('Please check your config.json syntax')
            process.exit(1)
        }
    }

    createDefaultConfig() {
        const defaultConfig = {
            botSettings: {
                botName: "Chisato-MD",
                version: "1.0.0",
                author: "Kiznavierr",
                prefix: ".",
                timezone: "Asia/Jakarta",
                language: "id",
                autoRead: false,
                autoTyping: true,
                autoRecording: false,
                selfReply: false,
                publicMode: true
            },
            ownerSettings: {
                owners: ["628xxxxxxxxxx@s.whatsapp.net"],
                ownerName: "Bot Owner",
                ownerNumber: "628xxxxxxxxxx"
            },
            adminSettings: {
                admins: [],
                autoPromoteOwner: true
            },
            limitSettings: {
                dailyLimit: 50,
                premiumLimit: 999,
                limitResetHour: 0,
                limitResetMinute: 0
            },
            cooldownSettings: {
                globalCooldown: 1,
                userCooldown: 3,
                groupCooldown: 5
            },
            databaseSettings: {
                saveInterval: 30000,
                backupInterval: 3600000,
                maxBackups: 5,
                autoCleanup: true
            },
            securitySettings: {
                antiSpam: true,
                maxMessagePerMinute: 10,
                blacklistedNumbers: [],
                whitelistedNumbers: [],
                blockInvalidCommands: false
            },
            featureSettings: {
                welcomeMessage: true,
                goodbyeMessage: true,
                antiLink: false,
                autoKickBadWords: false,
                levelSystem: true,
                economySystem: false
            },
            apiKeys: {
                googleApi: "",
                weatherApi: "",
                translateApi: "",
                newsApi: ""
            },
            webhookSettings: {
                enabled: false,
                url: "",
                secret: ""
            },
            logSettings: {
                logLevel: "info",
                logToFile: true,
                logFilePath: "./logs/bot.log",
                coloredLogs: true,
                logCommands: true,
                logErrors: true,
                logConnections: true
            }
        }

        try {
            writeFileSync(this.configPath, JSON.stringify(defaultConfig, null, 2), 'utf8')
            logger.system('Default config.json created')
            logger.warn('IMPORTANT: Please edit config.json with your actual settings!')
            logger.system('Especially change the owner number in ownerSettings')
            process.exit(0)
        } catch (error) {
            logger.error('Failed to create config.json:', error)
            process.exit(1)
        }
    }

    validateConfig(config) {
        const requiredSections = [
            'botSettings', 'ownerSettings', 'adminSettings', 
            'limitSettings', 'cooldownSettings', 'databaseSettings',
            'securitySettings', 'featureSettings', 'apiKeys',
            'webhookSettings', 'logSettings'
        ]

        let needsSave = false
        const defaultConfig = this.createDefaultConfig()

        for (const section of requiredSections) {
            if (!config[section]) {
                config[section] = defaultConfig[section]
                needsSave = true
            } else {
                for (const key in defaultConfig[section]) {
                    if (config[section][key] === undefined) {
                        config[section][key] = defaultConfig[section][key]
                        needsSave = true
                    }
                }
            }
        }

        if (needsSave) {
            this.saveConfig(config)
        }

        return config
    }

    saveConfig(config = this.config) {
        try {
            writeFileSync(this.configPath, JSON.stringify(config, null, 2), 'utf8')
            this.config = config
            return true
        } catch (error) {
            logger.error('Error saving config:', error)
            return false
        }
    }

    get(section, key = null) {
        if (key) {
            return this.config[section]?.[key]
        }
        return this.config[section] || {}
    }

    set(section, key, value = null) {
        if (value === null && typeof key === 'object') {
            this.config[section] = { ...this.config[section], ...key }
        } else {
            if (!this.config[section]) {
                this.config[section] = {}
            }
            this.config[section][key] = value
        }
        return this.saveConfig()
    }

    getBotName() { return this.get('botSettings', 'botName') || 'Chisato-MD' }
    getPrefix() { return this.get('botSettings', 'prefix') || '.' }
    getOwners() { return this.get('ownerSettings', 'owners') || [] }
    getAdmins() { return this.get('adminSettings', 'admins') || [] }
    getDailyLimit() { return this.get('limitSettings', 'dailyLimit') || 50 }
    isPublicMode() { return this.get('botSettings', 'publicMode') !== false }
    
    isOwner(jid) {
        return this.getOwners().includes(jid)
    }
    
    isAdmin(jid) {
        return this.getAdmins().includes(jid) || this.isOwner(jid)
    }

    addOwner(jid) {
        const owners = this.getOwners()
        if (!owners.includes(jid)) {
            owners.push(jid)
            return this.set('ownerSettings', 'owners', owners)
        }
        return false
    }

    removeOwner(jid) {
        const owners = this.getOwners()
        const index = owners.indexOf(jid)
        if (index > -1) {
            owners.splice(index, 1)
            return this.set('ownerSettings', 'owners', owners)
        }
        return false
    }

    addAdmin(jid) {
        const admins = this.getAdmins()
        if (!admins.includes(jid) && !this.isOwner(jid)) {
            admins.push(jid)
            return this.set('adminSettings', 'admins', admins)
        }
        return false
    }

    removeAdmin(jid) {
        const admins = this.getAdmins()
        const index = admins.indexOf(jid)
        if (index > -1 && !this.isOwner(jid)) {
            admins.splice(index, 1)
            return this.set('adminSettings', 'admins', admins)
        }
        return false
    }    
    reload() {
        this.config = this.loadConfig()
        return this.config
    }

    getAll() {
        return { ...this.config }
    }

    backup() {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
            const backupPath = join(process.cwd(), `config.backup.${timestamp}.json`)
            writeFileSync(backupPath, JSON.stringify(this.config, null, 2), 'utf8')
            logger.system(`Config backed up to: ${backupPath}`)
            return backupPath
        } catch (error) {
            logger.error('Failed to backup config:', error)
            return false
        }
    }

    reset() {
        try {
            this.backup()
            
            const defaultConfig = this.createDefaultConfig()
            logger.warn('Config has been reset to defaults!')
            logger.system('Please update your owner settings in config.json')
            return true
        } catch (error) {
            logger.error('Failed to reset config:', error)
            return false
        }
    }

    validate() {
        const requiredSections = [
            'botSettings', 'ownerSettings', 'adminSettings', 
            'limitSettings', 'cooldownSettings', 'databaseSettings',
            'securitySettings', 'featureSettings', 'apiKeys',
            'webhookSettings', 'logSettings'
        ]

        const missing = []
        for (const section of requiredSections) {
            if (!this.config[section]) {
                missing.push(section)
            }
        }

        if (missing.length > 0) {
            logger.warn('Missing config sections:', missing.join(', '))
            return false
        }

        if (!this.config.ownerSettings.owners || this.config.ownerSettings.owners.length === 0) {
            logger.warn('No owners configured! Please set owner in config.json')
            return false
        }

        logger.success('Config validation passed')
        return true
    }
}

export default new ConfigManager()
