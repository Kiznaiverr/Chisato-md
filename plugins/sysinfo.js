import si from 'systeminformation'
import os from 'os'

export default {
    command: 'sysinfo',
    aliases: ['systeminfo', 'system'],
    category: 'general',
    description: 'Show detailed system information',
    usage: 'sysinfo',
    cooldown: 10,
    
    async execute({ reply, react }) {
        try {
            await react('🕔')
            
            // Get basic info
            const platform = os.platform()
            const arch = os.arch()
            const hostname = os.hostname()
            const uptime = os.uptime()
            
            // Get detailed system info using systeminformation
            const [cpu, mem, osInfo, graphics, fsSize, networkInterfaces, battery] = await Promise.all([
                si.cpu(),
                si.mem(),
                si.osInfo(),
                si.graphics(),
                si.fsSize(),
                si.networkInterfaces(),
                si.battery()
            ])
            
            // Format uptime
            const days = Math.floor(uptime / 86400)
            const hours = Math.floor((uptime % 86400) / 3600)
            const minutes = Math.floor((uptime % 3600) / 60)
            const uptimeStr = `${days}d ${hours}h ${minutes}m`
            
            // Format bytes
            const formatBytes = (bytes) => {
                if (bytes === 0) return '0 B'
                const k = 1024
                const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
                const i = Math.floor(Math.log(bytes) / Math.log(k))
                return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
            }
            
            // Get memory usage percentage
            const memUsagePercent = ((mem.used / mem.total) * 100).toFixed(1)
            
            // Get main storage info
            const mainDisk = fsSize[0] || {}
            const storageUsed = mainDisk.used || 0
            const storageTotal = mainDisk.size || 0
            const storagePercent = storageTotal > 0 ? ((storageUsed / storageTotal) * 100).toFixed(1) : '0'
            
            // Get GPU info
            const gpuInfo = graphics.controllers && graphics.controllers.length > 0 
                ? graphics.controllers[0].model || 'Unknown GPU'
                : 'No GPU detected'
                
            // Get network info
            const activeNetworks = networkInterfaces.filter(net => net.operstate === 'up' && !net.internal)
            const networkInfo = activeNetworks.length > 0 
                ? `${activeNetworks[0].iface} (${activeNetworks[0].type})`
                : 'No active network'
            
            // Bot process info
            const processMemory = process.memoryUsage()
            const botMemUsed = (processMemory.heapUsed / 1024 / 1024).toFixed(1)
            const botMemTotal = (processMemory.heapTotal / 1024 / 1024).toFixed(1)
            
            let sysInfo = `┌─「 💻 System Information 」\n`
            sysInfo += `├─────────────────────────\n`
            sysInfo += `├ 🖥️ OS: ${osInfo.distro || platform} ${osInfo.release || ''}\n`
            sysInfo += `├ 🏠 Host: ${hostname}\n`
            sysInfo += `├ 🏗️ Arch: ${arch}\n`
            sysInfo += `├ ⏰ Uptime: ${uptimeStr}\n`
            sysInfo += `├─────────────────────────\n`
            sysInfo += `├ 🧠 CPU: ${cpu.manufacturer} ${cpu.brand}\n`
            sysInfo += `├ ⚙️ Cores: ${cpu.cores} cores / ${cpu.physicalCores} physical\n`
            sysInfo += `├ 🚀 Speed: Base ${cpu.speed} GHz, Max ${cpu.speedMax} GHz\n`
            sysInfo += `├─────────────────────────\n`
            sysInfo += `├ 🎯 RAM: ${formatBytes(mem.used)} / ${formatBytes(mem.total)} (${memUsagePercent}%)\n`
            sysInfo += `├ 🆓 Free: ${formatBytes(mem.free)}\n`
            sysInfo += `├ 🤖 Bot RAM: ${botMemUsed} MB / ${botMemTotal} MB\n`
            sysInfo += `├─────────────────────────\n`
            sysInfo += `├ 💾 Storage: ${formatBytes(storageUsed)} / ${formatBytes(storageTotal)} (${storagePercent}%)\n`
            sysInfo += `├ 📁 Free: ${formatBytes(storageTotal - storageUsed)}\n`
            sysInfo += `├ 🎮 GPU: ${gpuInfo}\n`
            
            if (graphics.controllers && graphics.controllers[0] && graphics.controllers[0].vram) {
                sysInfo += `├ 🎨 VRAM: ${graphics.controllers[0].vram} MB\n`
            }
            
            sysInfo += `├─────────────────────────\n`
            sysInfo += `├ 🌐 Network: ${networkInfo}\n`
            
            if (battery.hasBattery) {
                sysInfo += `├ 🔋 Battery: ${battery.percent}% ${battery.isCharging ? '(Charging)' : ''}\n`
            }
            
            sysInfo += `├ 📦 Node.js: ${process.version}\n`
            sysInfo += `├ 💻 Platform: ${process.platform}\n`
            sysInfo += `└ 🕒 Time: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`
            
            await react('✅')
            await reply(sysInfo)
            
        } catch (error) {
            console.error('Error getting system info:', error)
            await react('❌')
            await reply('❌ Failed to get system information.')
        }
    }
}
