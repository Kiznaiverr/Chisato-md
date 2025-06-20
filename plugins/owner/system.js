import { convertToSmallCaps } from '../../lib/font.js';
import os from 'os';
import fs from 'fs';
import process from 'process';

export default {
    command: 'system',
    aliases: ['sys', 'info'],
    category: 'owner',
    description: 'Check detailed system status and performance',
    usage: '',
    ownerOnly: true,
    cooldown: 10,
    
    async execute(sock, m, args) {        try {
            const totalMem = os.totalmem();
            const freeMem = os.freemem();
            const usedMem = totalMem - freeMem;
            const memUsage = ((usedMem / totalMem) * 100).toFixed(2);

            const cpus = os.cpus();
            const cpuModel = cpus[0].model;
            const cpuCount = cpus.length;

            const uptime = process.uptime();
            const days = Math.floor(uptime / 86400);
            const hours = Math.floor((uptime % 86400) / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = Math.floor(uptime % 60);

            let diskUsage = 'unknown';
            try {
                const stats = fs.statSync('./');
                diskUsage = 'available';
            } catch (error) {
                diskUsage = 'error reading';
            }

            const processMemory = process.memoryUsage();
            const heapUsed = (processMemory.heapUsed / 1024 / 1024).toFixed(2);
            const heapTotal = (processMemory.heapTotal / 1024 / 1024).toFixed(2);

            const platform = os.platform();
            const arch = os.arch();
            const nodeVersion = process.version;

            const systemInfo = convertToSmallCaps(`📊 SYSTEM STATUS REPORT\n`) +
                convertToSmallCaps(`━━━━━━━━━━━━━━━\n\n`) +
                convertToSmallCaps(`💻 HARDWARE INFO:\n`) +
                convertToSmallCaps(`• CPU: ${cpuModel}\n`) +
                convertToSmallCaps(`• Cores: ${cpuCount}\n`) +
                convertToSmallCaps(`• Architecture: ${arch}\n`) +
                convertToSmallCaps(`• Platform: ${platform}\n\n`) +
                convertToSmallCaps(`🧠 MEMORY USAGE:\n`) +
                convertToSmallCaps(`• Total RAM: ${(totalMem / 1024 / 1024 / 1024).toFixed(2)} GB\n`) +
                convertToSmallCaps(`• Used RAM: ${(usedMem / 1024 / 1024 / 1024).toFixed(2)} GB (${memUsage}%)\n`) +
                convertToSmallCaps(`• Free RAM: ${(freeMem / 1024 / 1024 / 1024).toFixed(2)} GB\n\n`) +
                convertToSmallCaps(`🔧 PROCESS INFO:\n`) +
                convertToSmallCaps(`• Node.js: ${nodeVersion}\n`) +
                convertToSmallCaps(`• Heap Used: ${heapUsed} MB\n`) +
                convertToSmallCaps(`• Heap Total: ${heapTotal} MB\n`) +
                convertToSmallCaps(`• PID: ${process.pid}\n\n`) +
                convertToSmallCaps(`⏱️ UPTIME:\n`) +
                convertToSmallCaps(`• Bot: ${days}d ${hours}h ${minutes}m ${seconds}s\n`) +
                convertToSmallCaps(`• System: ${(os.uptime() / 3600).toFixed(2)} hours\n\n`) +
                convertToSmallCaps(`💾 STORAGE:\n`) +
                convertToSmallCaps(`• Disk Status: ${diskUsage}\n`) +
                convertToSmallCaps(`• Working Directory: ${process.cwd()}`);

            await sock.sendMessage(m.key.remoteJid, {
                text: systemInfo
            });        } catch (error) {
            console.error('System command error:', error);
            await sock.sendMessage(m.key.remoteJid, {
                text: convertToSmallCaps('❌ Error occurred while getting system information.')
            });
        }
    }
};
