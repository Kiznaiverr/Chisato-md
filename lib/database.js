import fs from 'fs'
import path from 'path'
import config from './config.js'

export class Database {
    constructor() {
        this.dataDir = './database'
        this.ensureDataDir()
          // Initialize database files
        this.users = this.loadData('users.json', {})
        this.groups = this.loadData('groups.json', {})
        // Remove settings from database, use config instead
        // Messages not stored for performance
        this.cooldowns = new Map()
    }

    ensureDataDir() {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true })
        }
    }

    loadData(filename, defaultData = {}) {
        const filePath = path.join(this.dataDir, filename)
        try {
            if (fs.existsSync(filePath)) {
                const data = fs.readFileSync(filePath, 'utf8')
                return JSON.parse(data)
            }
        } catch (error) {
            console.error(`Error loading ${filename}:`, error)
        }
        return defaultData
    }

    saveData(filename, data) {
        const filePath = path.join(this.dataDir, filename)
        try {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
        } catch (error) {
            console.error(`Error saving ${filename}:`, error)
        }
    }    // User methods
    getUser(jid) {
        const userId = jid.split('@')[0]
        if (!this.users[userId]) {
            this.users[userId] = {
                jid: jid,
                name: '',
                level: 1,
                exp: 0,
                limit: config.get('limitSettings', 'dailyLimit') || 50,
                premium: false,
                premiumSince: null,
                premiumExpiry: null,
                banned: false,
                warning: 0,
                afk: false,
                afkReason: '',
                lastSeen: Date.now(),
                registered: false,
                regTime: 0,
                age: 0
            }
            this.saveUsers()
        }
        
        // Auto-check premium expiry
        if (this.users[userId].premium && this.users[userId].premiumExpiry) {
            if (Date.now() > this.users[userId].premiumExpiry) {
                this.users[userId].premium = false
                this.users[userId].premiumSince = null
                this.users[userId].premiumExpiry = null
                this.users[userId].limit = config.get('limitSettings', 'dailyLimit') || 50
                this.saveUsers()
            }
        }
        return this.users[userId]
    }

    saveUsers() {
        this.saveData('users.json', this.users)
    }

    // Group methods
    getGroup(jid) {
        if (!this.groups[jid]) {
            this.groups[jid] = {
                jid: jid,
                name: '',
                welcome: true,
                bye: true,
                antilink: false,
                antispam: false,
                mute: false,
                banned: false,
                created: Date.now()
            }
            this.saveGroups()
        }
        return this.groups[jid]
    }

    saveGroups() {
        this.saveData('groups.json', this.groups)
    }    // Settings methods - Now use config manager
    getSetting(key) {
        // Legacy support - redirect to config
        switch(key) {
            case 'prefix': return config.getPrefix()
            case 'botName': return config.getBotName()
            case 'owner': return config.getOwners().map(o => o.split('@')[0]).join(',')
            case 'admins': return config.getAdmins().map(a => a.split('@')[0]).join(',')
            case 'timezone': return config.get('botSettings', 'timezone')
            default: return config.get('botSettings', key) || ''
        }
    }

    setSetting(key, value) {
        // Legacy support - redirect to config
        switch(key) {
            case 'prefix': 
                config.set('botSettings', 'prefix', value)
                break
            case 'botName':
                config.set('botSettings', 'botName', value)
                break
            case 'owner':
                const owners = value.split(',').map(o => o.trim() + '@s.whatsapp.net')
                config.set('ownerSettings', 'owners', owners)
                break
            case 'admins':
                const admins = value.split(',').map(a => a.trim() + '@s.whatsapp.net')
                config.set('adminSettings', 'admins', admins)
                break
            case 'timezone':
                config.set('botSettings', 'timezone', value)
                break
            default:
                config.set('botSettings', key, value)
        }
    }

    // Message methods - Removed for performance
    // Messages are not stored to save disk space and improve performance
    async saveMessage(msg) {
        // Not implemented - messages not stored
        return
    }

    async getMessage(id) {
        // Not implemented - messages not stored
        return undefined
    }

    // Cooldown methods
    setCooldown(jid, command, duration = 5000) {
        const key = `${jid}-${command}`
        this.cooldowns.set(key, Date.now() + duration)
    }

    checkCooldown(jid, command) {
        const key = `${jid}-${command}`
        const cooldownTime = this.cooldowns.get(key)
        if (cooldownTime && Date.now() < cooldownTime) {
            return Math.ceil((cooldownTime - Date.now()) / 1000)
        }
        return 0
    }

    // Utility methods
    addExp(jid, exp) {
        const user = this.getUser(jid)
        user.exp += exp
        
        // Level up calculation
        const requiredExp = user.level * 100
        if (user.exp >= requiredExp) {
            user.level++
            user.exp = user.exp - requiredExp
        }
        
        this.saveUsers()
        return user
    }

    addLimit(jid, amount) {
        const user = this.getUser(jid)
        user.limit += amount
        this.saveUsers()
        return user
    }    useLimit(jid, amount = 1) {
        // Owner and premium users don't use limits
        if (this.isOwner(jid) || this.isPremium(jid)) {
            return true
        }
        
        const user = this.getUser(jid)
        if (user.limit >= amount) {
            user.limit -= amount
            this.saveUsers()
            return true
        }        return false
    }

    isOwner(jid) {
        return config.isOwner(jid)
    }    isPremium(jid) {
        const user = this.getUser(jid)
        
        // Check if premium expired
        if (user.premium && user.premiumExpiry) {
            if (Date.now() > user.premiumExpiry) {
                // Premium expired, remove premium status
                user.premium = false
                user.premiumSince = null
                user.premiumExpiry = null
                this.saveUsers()
            }
        }
        
        return user.premium || this.isOwner(jid)
    }

    isBanned(jid) {
        const user = this.getUser(jid)
        return user.banned
    }

    isAdmin(jid) {
        return config.isAdmin(jid)
    }

    addAdmin(jid) {
        return config.addAdmin(jid)
    }

    removeAdmin(jid) {
        return config.removeAdmin(jid)
    }

    // Getter methods for consistency
    getOwners() {
        return config.getOwners()
    }

    getAdmins() {
        return config.getAdmins()
    }

    banUser(jid) {
        const user = this.getUser(jid)
        user.banned = true
        this.saveUsers()
    }

    unbanUser(jid) {
        const user = this.getUser(jid)
        user.banned = false
        this.saveUsers()
    }
}
