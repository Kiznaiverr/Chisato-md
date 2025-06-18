import config from '../lib/config.js'

export default {
    command: 'config',
    aliases: ['cfg', 'setting', 'settings'],
    category: 'owner',
    description: 'Manage bot configuration settings',
    usage: 'config [action] [key] [value]',
    ownerOnly: true,
    cooldown: 5,
    
    async execute({ reply, args, prefix }) {
        const action = args[0]?.toLowerCase()
        
        if (!action) {
            return this.showConfigMenu(reply, prefix)
        }
        
        switch (action) {
            case 'get':
            case 'show':
                return this.getConfig(args[1], reply)
                
            case 'set':
                return this.setConfig(args[1], args.slice(2).join(' '), reply)
                
            case 'list':
            case 'all':
                return this.showAllConfig(reply)
                
            case 'reset':
                return this.resetConfig(args[1], reply)
                
            case 'reload':
                return this.reloadConfig(reply)
                
            case 'backup':
                return this.backupConfig(reply)
                
            default:
                return reply(`❌ Unknown action: ${action}\n\n💡 Use ${prefix}config for help`)
        }
    },
    
    showConfigMenu(reply, prefix) {
        const menuText = `╭─「 ⚙️ Configuration Manager 」
├ 📋 Available Actions:
├ ${prefix}config get <key> - Get config value
├ ${prefix}config set <key> <value> - Set config value  
├ ${prefix}config list - Show all configurations
├ ${prefix}config reset <section> - Reset section to default
├ ${prefix}config reload - Reload from file
├ ${prefix}config backup - Create config backup
├─────────────────────────
├ 📂 Available Sections:
├ • botSettings - Bot basic settings
├ • ownerSettings - Owner configuration
├ • adminSettings - Admin management
├ • limitSettings - Daily limits & quotas
├ • cooldownSettings - Command cooldowns
├ • securitySettings - Security features
├ • featureSettings - Bot features
├ • logSettings - Logging configuration
├─────────────────────────
├ 💡 Examples:
├ ${prefix}config get botSettings.prefix
├ ${prefix}config set botSettings.botName MyBot
├ ${prefix}config list botSettings
╰ ${prefix}config reset botSettings`
        
        return reply(menuText)
    },
    
    getConfig(key, reply) {
        if (!key) {
            return reply('❌ Please specify a config key!\n\n💡 Example: config get botSettings.prefix')
        }
        
        try {
            const [section, configKey] = key.split('.')
            let value
            
            if (configKey) {
                value = config.get(section, configKey)
            } else {
                value = config.get(section)
            }
            
            if (value === undefined) {
                return reply(`❌ Config key "${key}" not found!`)
            }
            
            let displayValue = value
            if (typeof value === 'object') {
                displayValue = JSON.stringify(value, null, 2)
            }
            
            const configText = `╭─「 📋 Config Value 」
├ 🔑 Key: ${key}
├ 📄 Value: ${displayValue}
├ 📊 Type: ${typeof value}
╰─────────────────────`
            
            return reply(configText)
        } catch (error) {
            return reply(`❌ Error getting config: ${error.message}`)
        }
    },
    
    setConfig(key, value, reply) {
        if (!key || value === undefined) {
            return reply('❌ Please specify key and value!\n\n💡 Example: config set botSettings.prefix !')
        }
        
        try {
            const [section, configKey] = key.split('.')
            
            if (!configKey) {
                return reply('❌ Please specify section.key format!\n\n💡 Example: botSettings.prefix')
            }
            
            // Parse value if it looks like JSON
            let parsedValue = value
            if (value.startsWith('[') || value.startsWith('{') || value === 'true' || value === 'false' || !isNaN(value)) {
                try {
                    parsedValue = JSON.parse(value)
                } catch {
                    // Keep as string if JSON parsing fails
                }
            }
            
            const success = config.set(section, configKey, parsedValue)
            
            if (success) {
                const configText = `✅ Configuration updated!

╭─「 📝 Updated Config 」
├ 🔑 Key: ${key}
├ 📄 Old Value: ${config.get(section, configKey)}
├ 📄 New Value: ${parsedValue}
╰─────────────────────

💡 Changes saved to config.json`
                
                return reply(configText)
            } else {
                return reply('❌ Failed to save configuration!')
            }
        } catch (error) {
            return reply(`❌ Error setting config: ${error.message}`)
        }
    },
    
    showAllConfig(reply) {
        try {
            const sections = args[1] ? [args[1]] : [
                'botSettings', 'ownerSettings', 'adminSettings', 
                'limitSettings', 'cooldownSettings', 'securitySettings',
                'featureSettings', 'logSettings'
            ]
            
            let configText = `╭─「 📋 Bot Configuration 」\n`
            
            sections.forEach((section, index) => {
                const sectionData = config.get(section)
                if (sectionData) {
                    const isLast = index === sections.length - 1
                    const symbol = isLast ? '╰' : '├'
                    
                    configText += `├ 📂 ${section}:\n`
                    Object.entries(sectionData).forEach(([key, value], i, arr) => {
                        const isLastItem = i === arr.length - 1 && isLast
                        const itemSymbol = isLastItem ? '╰' : '│'
                        let displayValue = value
                        
                        // Hide sensitive data
                        if (key.toLowerCase().includes('key') || key.toLowerCase().includes('secret')) {
                            displayValue = '***hidden***'
                        } else if (Array.isArray(value)) {
                            displayValue = `[${value.length} items]`
                        } else if (typeof value === 'object') {
                            displayValue = '{...}'
                        }
                        
                        configText += `${itemSymbol}   ${key}: ${displayValue}\n`
                    })
                }
            })
            
            return reply(configText)
        } catch (error) {
            return reply(`❌ Error showing config: ${error.message}`)
        }
    },
    
    resetConfig(section, reply) {
        if (!section) {
            return reply('❌ Please specify section to reset!\n\n💡 Example: config reset botSettings')
        }
        
        try {
            // This would require implementing reset in config manager
            return reply(`⚠️ Reset feature not implemented yet for security reasons.
            
Please manually edit config.json or delete it to regenerate defaults.`)
        } catch (error) {
            return reply(`❌ Error resetting config: ${error.message}`)
        }
    },
    
    reloadConfig(reply) {
        try {
            config.reload()
            return reply('✅ Configuration reloaded from file!')
        } catch (error) {
            return reply(`❌ Error reloading config: ${error.message}`)
        }
    },
    
    backupConfig(reply) {
        try {
            const fs = require('fs')
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
            const backupPath = `./config-backup-${timestamp}.json`
            
            fs.copyFileSync('./config.json', backupPath)
            
            return reply(`✅ Configuration backed up!
            
📁 Backup saved to: ${backupPath}
🕒 Timestamp: ${new Date().toLocaleString('id-ID')}`)
        } catch (error) {
            return reply(`❌ Error creating backup: ${error.message}`)
        }
    }
}
