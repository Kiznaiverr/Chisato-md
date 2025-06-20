import os from 'os'
import font from '../../lib/font.js'

export default {
    command: 'ping',
    aliases: ['p'],
    category: 'general',
    description: 'Check bot response',
    usage: '',
    cooldown: 3,
    
    async execute({ reply, prefix }) {
        const start = Date.now()
        
        const platform = os.platform()
        const arch = os.arch()
        const totalMem = os.totalmem()
        const freeMem = os.freemem()
        const usedMem = totalMem - freeMem
        const memUsage = ((usedMem / totalMem) * 100).toFixed(1)
        
        const cpus = os.cpus()
        const cpuModel = cpus[0]?.model?.split(' ').slice(0, 3).join(' ') || font.smallCaps('Unknown')
        const cpuCores = cpus.length
        
        const formatGB = (bytes) => `${(bytes / (1024 ** 3)).toFixed(1)} ${font.smallCaps('GB')}`
        
        const processMemory = process.memoryUsage()
        const botMemUsed = (processMemory.heapUsed / 1024 / 1024).toFixed(1)
        
        const end = Date.now()
        const responseTime = end - start
        
        let status = `🟢 ${font.smallCaps('Excellent')}`
        if (responseTime > 1000) status = `🔴 ${font.smallCaps('Slow')}`
        else if (responseTime > 500) status = `🟡 ${font.smallCaps('Good')}`
        else if (responseTime > 200) status = `🟠 ${font.smallCaps('Fair')}`
        
        let pingInfo = `┌─「 🏓 ${font.smallCaps('Ping & Quick Info')} 」\n`
        pingInfo += `├ ⚡ ${font.smallCaps('Response')}: ${responseTime}ms ${status}\n`
        pingInfo += `├───────────────\n`
        pingInfo += `├ 💻 ${font.smallCaps('OS')}: ${platform === 'win32' ? font.smallCaps('Windows') : platform === 'darwin' ? font.smallCaps('macOS') : font.smallCaps('Linux')} ${arch}\n`
        pingInfo += `├ 🧠 ${font.smallCaps('CPU')}: ${cpuModel} (${cpuCores} ${font.smallCaps('cores')})\n`
        pingInfo += `├ 🎯 ${font.smallCaps('RAM')}: ${formatGB(usedMem)} / ${formatGB(totalMem)} (${memUsage}%)\n`
        pingInfo += `├ 🤖 ${font.smallCaps('Bot')}: ${botMemUsed} ${font.smallCaps('MB')}\n`
        pingInfo += `├ 📦 ${font.smallCaps('Node')}: ${process.version}\n`
        pingInfo += `├───────────────\n`
        pingInfo += `└ 💡 ${font.smallCaps('Use')} ${prefix}${font.smallCaps('sysinfo')} ${font.smallCaps('for detailed info')}`
        
        await reply(pingInfo)
    }
}
