import si from 'systeminformation'
import os from 'os'
import font from '../../lib/font.js'

export default {
    command: 'sysinfo',
    aliases: ['systeminfo', 'system'],
    category: 'general',
    description: '',
    usage: '',
    cooldown: 10,
    
    async execute({ reply, react }) {
        try {
            await react('🕔')
            
            const platform = os.platform()
            const arch = os.arch()
            const hostname = os.hostname()
            const uptime = os.uptime()
            
            const [cpu, mem, osInfo, graphics, fsSize, networkInterfaces, battery] = await Promise.all([
                si.cpu(),
                si.mem(),
                si.osInfo(),
                si.graphics(),
                si.fsSize(),
                si.networkInterfaces(),
                si.battery()
            ])
            
            const days = Math.floor(uptime / 86400)
            const hours = Math.floor((uptime % 86400) / 3600)
            const minutes = Math.floor((uptime % 3600) / 60)
            const uptimeStr = `${days}d ${hours}h ${minutes}m`
            
            const formatBytes = (bytes) => {
                if (bytes === 0) return '0 B'
                const k = 1024
                const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
                const i = Math.floor(Math.log(bytes) / Math.log(k))
                return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
            }
            
            const memUsagePercent = ((mem.used / mem.total) * 100).toFixed(1)
            
            const mainDisk = fsSize[0] || {}
            const storageUsed = mainDisk.used || 0
            const storageTotal = mainDisk.size || 0
            const storagePercent = storageTotal > 0 ? ((storageUsed / storageTotal) * 100).toFixed(1) : '0'
            
            const gpuInfo = graphics.controllers && graphics.controllers.length > 0 
                ? graphics.controllers[0].model || font.smallCaps('Unknown GPU')
                : font.smallCaps('No GPU detected')
                
            const activeNetworks = networkInterfaces.filter(net => net.operstate === 'up' && !net.internal)
            const networkInfo = activeNetworks.length > 0 
                ? `${activeNetworks[0].iface} (${activeNetworks[0].type})`
                : font.smallCaps('No active network')
            
            const processMemory = process.memoryUsage()
            const botMemUsed = (processMemory.heapUsed / 1024 / 1024).toFixed(1)
            const botMemTotal = (processMemory.heapTotal / 1024 / 1024).toFixed(1)
            
            let sysInfo = `┌─「 💻 ${font.smallCaps('System Information')} 」\n`
            sysInfo += `├───────────────\n`
            sysInfo += `├ 🖥️ ${font.smallCaps('OS')}: ${osInfo.distro || platform} ${osInfo.release || ''}\n`
            sysInfo += `├ 🏠 ${font.smallCaps('Host')}: ${hostname}\n`
            sysInfo += `├ 🏗️ ${font.smallCaps('Arch')}: ${arch}\n`
            sysInfo += `├ ⏰ ${font.smallCaps('Uptime')}: ${uptimeStr}\n`
            sysInfo += `├───────────────\n`
            sysInfo += `├ 🧠 ${font.smallCaps('CPU')}: ${cpu.manufacturer} ${cpu.brand}\n`
            sysInfo += `├ ⚙️ ${font.smallCaps('Cores')}: ${cpu.cores} ${font.smallCaps('cores')} / ${cpu.physicalCores} ${font.smallCaps('physical')}\n`
            sysInfo += `├ 🚀 ${font.smallCaps('Speed')}: ${font.smallCaps('Base')} ${cpu.speed} ${font.smallCaps('GHz')}, ${font.smallCaps('Max')} ${cpu.speedMax} ${font.smallCaps('GHz')}\n`
            sysInfo += `├───────────────\n`
            sysInfo += `├ 🎯 ${font.smallCaps('RAM')}: ${formatBytes(mem.used)} / ${formatBytes(mem.total)} (${memUsagePercent}%)\n`
            sysInfo += `├ 🆓 ${font.smallCaps('Free')}: ${formatBytes(mem.free)}\n`
            sysInfo += `├ 🤖 ${font.smallCaps('Bot RAM')}: ${botMemUsed} ${font.smallCaps('MB')} / ${botMemTotal} ${font.smallCaps('MB')}\n`
            sysInfo += `├───────────────\n`
            sysInfo += `├ 💾 ${font.smallCaps('Storage')}: ${formatBytes(storageUsed)} / ${formatBytes(storageTotal)} (${storagePercent}%)\n`
            sysInfo += `├ 📁 ${font.smallCaps('Free')}: ${formatBytes(storageTotal - storageUsed)}\n`
            sysInfo += `├ 🎮 ${font.smallCaps('GPU')}: ${gpuInfo}\n`
            
            if (graphics.controllers && graphics.controllers[0] && graphics.controllers[0].vram) {
                sysInfo += `├ 🎨 ${font.smallCaps('VRAM')}: ${graphics.controllers[0].vram} ${font.smallCaps('MB')}\n`
            }
            
            sysInfo += `├───────────────\n`
            sysInfo += `├ 🌐 ${font.smallCaps('Network')}: ${networkInfo}\n`
            
            if (battery.hasBattery) {
                sysInfo += `├ 🔋 ${font.smallCaps('Battery')}: ${battery.percent}% ${battery.isCharging ? `(${font.smallCaps('Charging')})` : ''}\n`
            }
            
            sysInfo += `├ 📦 ${font.smallCaps('Node.js')}: ${process.version}\n`
            sysInfo += `├ 💻 ${font.smallCaps('Platform')}: ${process.platform}\n`
            sysInfo += `└ 🕒 ${font.smallCaps('Time')}: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`
            
            await react('✅')
            await reply(sysInfo)
            
        } catch (error) {
            console.error('Error getting system info:', error)
            await react('❌')
            await reply(`❌ ${font.smallCaps('Failed to get system information')}.`)
        }
    }
}
