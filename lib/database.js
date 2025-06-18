import fs from 'fs'
import path from 'path'

export class Database {
    constructor() {
        this.dataDir = './database'
        this.ensureDataDir()
          // Initialize database files
        this.users = this.loadData('users.json', {})
        this.groups = this.loadData('groups.json', {})
        this.settings = this.loadData('settings.json', {
            prefix: '.',
            botName: 'Chisato MD',
            owner: '',
            admins: '',
            timezone: 'Asia/Jakarta'
        })
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
    }

    // User methods
    getUser(jid) {
        const userId = jid.split('@')[0]
        if (!this.users[userId]) {
            this.users[userId] = {
                jid: jid,
                name: '',
                level: 1,
                exp: 0,
                limit: 10,
                premium: false,
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
    }

    // Settings methods
    getSetting(key) {
        return this.settings[key]
    }

    setSetting(key, value) {
        this.settings[key] = value
        this.saveData('settings.json', this.settings)    }

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
    }

    useLimit(jid, amount = 1) {
        const user = this.getUser(jid)
        if (user.limit >= amount) {
            user.limit -= amount
            this.saveUsers()
            return true
        }
        return false
    }

    isOwner(jid) {
        const userId = jid.split('@')[0]
        const owners = this.getSetting('owner').split(',').map(o => o.trim())
        return owners.includes(userId)
    }

    isPremium(jid) {
        const user = this.getUser(jid)
        return user.premium || this.isOwner(jid)
    }

    isBanned(jid) {
        const user = this.getUser(jid)
        return user.banned
    }

    isAdmin(jid) {
        const userId = jid.split('@')[0]
        const admins = this.getSetting('admins').split(',').map(a => a.trim())
        return admins.includes(userId) || this.isOwner(jid)
    }

    addAdmin(jid) {
        const userId = jid.split('@')[0]
        const currentAdmins = this.getSetting('admins')
        const admins = currentAdmins ? currentAdmins.split(',').map(a => a.trim()) : []
        
        if (!admins.includes(userId)) {
            admins.push(userId)
            this.setSetting('admins', admins.join(','))
        }
    }

    removeAdmin(jid) {
        const userId = jid.split('@')[0]
        const currentAdmins = this.getSetting('admins')
        const admins = currentAdmins ? currentAdmins.split(',').map(a => a.trim()) : []
        
        const index = admins.indexOf(userId)
        if (index > -1) {
            admins.splice(index, 1)
            this.setSetting('admins', admins.join(','))
        }
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
