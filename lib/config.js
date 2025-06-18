import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

class ConfigManager {
    constructor() {
        this.configPath = join(process.cwd(), 'config.json')
        this.config = this.loadConfig()
    }

    loadConfig() {
        try {
            if (!existsSync(this.configPath)) {
                console.log('Config file not found, creating default config...')
                this.createDefaultConfig()
            }
            
            const configData = readFileSync(this.configPath, 'utf8')
            const config = JSON.parse(configData)
            
            // Validate and merge with defaults if needed
            return this.validateConfig(config)
        } catch (error) {
            console.error('Error loading config:', error)
            console.log('Creating default config...')
            return this.createDefaultConfig()
        }
    }    createDefaultConfig() {
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
                owners: ["YOUR_NUMBER@s.whatsapp.net"],
                ownerName: "Bot Owner",
                ownerNumber: "YOUR_NUMBER"
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

        console.log('⚠️  Creating default config.json - Please update your settings!')
        console.log('📝 Important: Change "YOUR_NUMBER" to your actual WhatsApp number in ownerSettings')
        this.saveConfig(defaultConfig)
        return defaultConfig
    }

    validateConfig(config) {
        // Ensure all required sections exist
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
                // Merge missing keys within sections
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
            console.error('Error saving config:', error)
            return false
        }
    }

    // Getter methods for easy access
    get(section, key = null) {
        if (key) {
            return this.config[section]?.[key]
        }
        return this.config[section] || {}
    }

    set(section, key, value = null) {
        if (value === null && typeof key === 'object') {
            // Setting entire section
            this.config[section] = { ...this.config[section], ...key }
        } else {
            // Setting specific key
            if (!this.config[section]) {
                this.config[section] = {}
            }
            this.config[section][key] = value
        }
        return this.saveConfig()
    }

    // Convenience methods
    getBotName() { return this.get('botSettings', 'botName') }
    getPrefix() { return this.get('botSettings', 'prefix') }
    getOwners() { return this.get('ownerSettings', 'owners') || [] }
    getAdmins() { return this.get('adminSettings', 'admins') || [] }
    getDailyLimit() { return this.get('limitSettings', 'dailyLimit') }
    isPublicMode() { return this.get('botSettings', 'publicMode') }
    
    // Owner/Admin checks
    isOwner(jid) {
        return this.getOwners().includes(jid)
    }
    
    isAdmin(jid) {
        return this.getAdmins().includes(jid) || this.isOwner(jid)
    }

    // Add/Remove methods
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
    }    // Reload config from file
    reload() {
        this.config = this.loadConfig()
        return this.config
    }

    // Get all config for debugging
    getAll() {
        return { ...this.config }
    }

    // Backup current config
    backup() {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
            const backupPath = join(process.cwd(), `config.backup.${timestamp}.json`)
            writeFileSync(backupPath, JSON.stringify(this.config, null, 2), 'utf8')
            console.log(`✅ Config backed up to: ${backupPath}`)
            return backupPath
        } catch (error) {
            console.error('❌ Failed to backup config:', error)
            return false
        }
    }

    // Reset config to defaults (with confirmation)
    reset() {
        try {
            // Backup current config first
            this.backup()
            
            // Create new default config
            const defaultConfig = this.createDefaultConfig()
            console.log('⚠️  Config has been reset to defaults!')
            console.log('📝 Please update your owner settings in config.json')
            return true
        } catch (error) {
            console.error('❌ Failed to reset config:', error)
            return false
        }
    }

    // Validate config structure
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
            console.warn('⚠️  Missing config sections:', missing.join(', '))
            return false
        }

        // Validate critical settings
        if (!this.config.ownerSettings.owners || this.config.ownerSettings.owners.length === 0) {
            console.warn('⚠️  No owners configured! Please set owner in config.json')
            return false
        }

        console.log('✅ Config validation passed')
        return true
    }
}

export default new ConfigManager()
