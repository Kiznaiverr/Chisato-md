import fs from 'fs'
import path from 'path'
import axios from 'axios'
import cron from 'node-cron'
import Helper from './helper.js'

const __dirname = Helper.__dirname(import.meta.url)

class ProxyManager {
    constructor() {
        this.cacheDir = path.join(__dirname, '../cache')
        this.cacheFile = path.join(this.cacheDir, 'proxies.json')
        this.proxyUrl = 'https://api.proxyscrape.com/v4/free-proxy-list/get?request=display_proxies&proxy_format=protocolipport&format=json'
        this.currentIndex = 0
        this.proxies = []
        this.lastFetch = null
        this.cacheExpiry = 30 * 60 * 1000 // 30 minutes in milliseconds
        this.currentProxyConfig = null

        this.ensureCacheDir()

        this.loadFromCache()
        
        this.setupCronJobs()
    }

    ensureCacheDir() {
        try {
            if (!fs.existsSync(this.cacheDir)) {
                fs.mkdirSync(this.cacheDir, { recursive: true })
                console.log(`📁 Created cache directory: ${this.cacheDir}`)
            }
        } catch (error) {
            console.error('❌ Failed to create cache directory:', error.message)
        }
    }

    loadFromCache() {
        try {
            if (fs.existsSync(this.cacheFile)) {
                const cache = JSON.parse(fs.readFileSync(this.cacheFile))
                if (cache.timestamp && (Date.now() - cache.timestamp) < this.cacheExpiry) {
                    this.proxies = cache.proxies
                    this.lastFetch = cache.timestamp
                    const lastFetchTime = new Date(this.lastFetch).toLocaleString('id-ID', {
                        timeZone: 'Asia/Jakarta',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    })
                    console.log(`✅ Loaded ${this.proxies.length} proxies from cache (last fetch: ${lastFetchTime})`)
                    return true
                } else {
                    console.log('🔄 Cache expired, will fetch new proxies')
                }
            }
        } catch (error) {
            console.error('❌ Failed to load proxies from cache:', error.message)
        }
        return false
    }

    saveToCache() {
        try {
            const cacheData = JSON.stringify({
                proxies: this.proxies,
                timestamp: Date.now()
            })
            
            try {
                fs.writeFileSync(this.cacheFile, cacheData)
                console.log(`✅ Saved ${this.proxies.length} proxies to cache at ${this.cacheFile}`)
                return true
            } catch (writeError) {
                console.error(`❌ Failed to write to primary cache file: ${writeError.message}`)
                
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
                const backupFile = path.join(this.cacheDir, `proxies_${timestamp}.json`)
                
                fs.writeFileSync(backupFile, cacheData)
                console.log(`⚠️ Saved ${this.proxies.length} proxies to backup cache at ${backupFile}`)
                return true
            }
        } catch (error) {
            console.error('❌ Failed to save proxies to any cache file:', error.message)
            return false
        }
    }

    async fetchProxies() {
        try {
            console.log('🔄 Fetching new proxies...')
            const fetchStartTime = Date.now()
            
            // Clear any existing proxy configuration to avoid using expired proxies
            delete axios.defaults.proxy
            delete axios.defaults.timeout
            
            const freshAxios = axios.create({
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            })
            
            const response = await freshAxios.get(this.proxyUrl)
            
            this.proxies = response.data.proxies
                .filter(p => p.alive && p.uptime > 80) // Only take proxies with >80% uptime
                .map(p => ({
                    proxy: p.proxy,
                    protocol: p.protocol,
                    uptime: p.uptime,
                    timeout: p.timeout,
                    country: p.ip_data?.country || 'Unknown',
                    lastUsed: null,
                    failureCount: 0
                }))
                .sort((a, b) => b.uptime - a.uptime) // Sort by uptime

            this.lastFetch = Date.now()
            this.currentIndex = 0
            const fetchTime = (this.lastFetch - fetchStartTime) / 1000
            
            const currentTime = new Date().toLocaleString('id-ID', {
                timeZone: 'Asia/Jakarta',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            })
            
            console.log(`✅ Fetched ${this.proxies.length} working proxies in ${fetchTime.toFixed(2)}s at ${currentTime}`)
            
            // Save fetched proxies to cache
            this.saveToCache()
            
            return true
        } catch (error) {
            console.error('❌ Failed to fetch proxies:', error.message)
            return false
        }
    }

    setupCronJobs() {
        // Clean cache and fetch new proxies every 30 minutes (at 0 and 30 minutes of each hour)
        this.cacheCleanupJob = cron.schedule('0,30 * * * *', () => {
            console.log('🕒 Scheduled cache cleanup and proxy refresh triggered')
            this.cleanupAndRefresh()
        }, {
            scheduled: true,
            timezone: 'Asia/Jakarta'
        })

        this.backupCleanupJob = cron.schedule('0 0 * * *', () => {
            console.log('🧹 Daily cleanup of old backup cache files')
            this.cleanupOldBackupFiles()
        }, {
            scheduled: true,
            timezone: 'Asia/Jakarta'
        })

        console.log('⏰ Cron jobs scheduled: Cache cleanup every 30 minutes, backup cleanup daily')
    }

    async cleanupAndRefresh() {
        try {
            delete axios.defaults.proxy
            delete axios.defaults.timeout
            
            if (fs.existsSync(this.cacheFile)) {
                fs.unlinkSync(this.cacheFile)
                console.log('🗑️ Cache file deleted successfully')
            }

            this.proxies = []
            this.currentIndex = 0
            this.lastFetch = null
            this.currentProxyConfig = null

            await this.fetchProxiesWithRetry()
        } catch (error) {
            console.error('❌ Error during cache cleanup and refresh:', error.message)
        }
    }

    cleanupOldBackupFiles() {
        try {
            const files = fs.readdirSync(this.cacheDir)
            const backupFiles = files.filter(file => file.startsWith('proxies_') && file.endsWith('.json'))
            
            if (backupFiles.length > 5) {
                backupFiles.sort()
                const filesToDelete = backupFiles.slice(0, backupFiles.length - 5)
                
                filesToDelete.forEach(file => {
                    const filePath = path.join(this.cacheDir, file)
                    try {
                        fs.unlinkSync(filePath)
                        console.log(`🗑️ Deleted old backup file: ${file}`)
                    } catch (err) {
                        console.error(`❌ Failed to delete backup file ${file}:`, err.message)
                    }
                })
            }
        } catch (error) {
            console.error('❌ Error during backup cleanup:', error.message)
        }
    }

    async getProxy() {
        if (!this.proxies.length || this.shouldRefreshProxies()) {
            console.log('⚠️ No proxies available or proxies expired, attempting to fetch...')
            const success = await this.fetchProxiesWithRetry()
            if (!success) {
                console.log('❌ Failed to fetch proxies after retries, returning null')
                return null
            }
        }

        if (!this.proxies.length) {
            return null
        }

        let attempts = 0
        const maxAttempts = this.proxies.length
        
        while (attempts < maxAttempts) {
            const proxy = this.proxies[this.currentIndex]
            this.currentIndex = (this.currentIndex + 1) % this.proxies.length
            
            if (proxy.failureCount >= 3) {
                attempts++
                continue
            }
            
            if (proxy) {
                const [protocol, host] = proxy.proxy.split('://')
                proxy.lastUsed = Date.now()
                
                return {
                    protocol: protocol,
                    host: host.split(':')[0],
                    port: parseInt(host.split(':')[1]),
                    timeout: Math.min(proxy.timeout || 5000, 10000), // Max 10s timeout
                    proxyIndex: this.currentIndex - 1 // Track which proxy this is
                }
            }
            attempts++
        }

        return null
    }

    shouldRefreshProxies() {
        if (this.lastFetch && (Date.now() - this.lastFetch) > (25 * 60 * 1000)) {
            return true
        }
        
        const workingProxies = this.proxies.filter(p => p.failureCount < 3)
        return workingProxies.length < (this.proxies.length * 0.3) // Less than 30% working
    }

    async fetchProxiesWithRetry() {
        const maxRetries = 3
        let attempt = 0
        
        while (attempt < maxRetries) {
            try {
                console.log(`🔄 Fetch attempt ${attempt + 1}/${maxRetries}`)
                const success = await this.fetchProxies()
                if (success) {
                    return true
                }
            } catch (error) {
                console.error(`❌ Fetch attempt ${attempt + 1} failed:`, error.message)
            }
            
            attempt++
            if (attempt < maxRetries) {
                const delay = Math.pow(2, attempt) * 1000 // Exponential backoff
                console.log(`⏳ Waiting ${delay/1000}s before retry...`)
                await new Promise(resolve => setTimeout(resolve, delay))
            }
        }
        
        return false
    }

    async configureGlobalProxy() {
        const proxy = await this.getProxy()
        if (proxy) {
            this.currentProxyConfig = proxy
            
            axios.defaults.proxy = {
                protocol: proxy.protocol,
                host: proxy.host,
                port: proxy.port
            }
            axios.defaults.timeout = proxy.timeout
            console.log(`✅ Global proxy configured: ${proxy.protocol}://${proxy.host}:${proxy.port}`)
            return true
        } else {
            delete axios.defaults.proxy
            axios.defaults.timeout = 30000 // Default timeout without proxy
            console.log('⚠️ No proxy available, using direct connection')
            return false
        }
    }

    markProxyAsFailed() {
        if (this.currentProxyConfig && this.currentProxyConfig.proxyIndex !== undefined) {
            const proxyIndex = this.currentProxyConfig.proxyIndex
            if (this.proxies[proxyIndex]) {
                this.proxies[proxyIndex].failureCount++
                console.log(`❌ Marked proxy as failed: ${this.proxies[proxyIndex].proxy} (failures: ${this.proxies[proxyIndex].failureCount})`)
            }
        }
    }

    getStatus() {
        const workingProxies = this.proxies.filter(p => p.failureCount < 3)
        
        const lastFetchFormatted = this.lastFetch ? 
            new Date(this.lastFetch).toLocaleString('id-ID', {
                timeZone: 'Asia/Jakarta',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }) : null

        return {
            total_proxies: this.proxies.length,
            working_proxies: workingProxies.length,
            failed_proxies: this.proxies.length - workingProxies.length,
            current_index: this.currentIndex,
            last_fetch: lastFetchFormatted,
            cache_path: this.cacheFile,
            cache_expiry: `${this.cacheExpiry/1000/60} minutes`,
            current_proxy: this.currentProxyConfig || null,
            next_refresh: 'Every 30 minutes (0 and 30 minutes of each hour)',
            should_refresh: this.shouldRefreshProxies(),
            cron_jobs: {
                cache_cleanup: this.cacheCleanupJob ? 'Active' : 'Inactive',
                backup_cleanup: this.backupCleanupJob ? 'Active' : 'Inactive'
            }
        }
    }

    async manualCleanup() {
        console.log('🔄 Manual cache cleanup triggered')
        await this.cleanupAndRefresh()
        return true
    }

    destroy() {
        if (this.cacheCleanupJob) {
            this.cacheCleanupJob.destroy()
            console.log('⏹️ Cache cleanup cron job stopped')
        }
        if (this.backupCleanupJob) {
            this.backupCleanupJob.destroy()
            console.log('⏹️ Backup cleanup cron job stopped')
        }
    }
}

export default new ProxyManager()
