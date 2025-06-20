import fs from 'fs'
import path from 'path'
import font from '../../lib/font.js'

export default {
    command: 'backup',
    description: 'Backup database',
    category: 'owner',
    usage: '',
    ownerOnly: true,
    cooldown: 30,
    async execute(context) {
        const { reply, react, sock, msg } = context
        
        try {
            await react('💾')
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
            const backupData = {
                timestamp: new Date().toISOString(),
                users: {},
                groups: {},
                settings: {}
            }
            
            // Read database files
            try {
                const usersPath = path.join(process.cwd(), 'database', 'users.json')
                const groupsPath = path.join(process.cwd(), 'database', 'groups.json')
                
                if (fs.existsSync(usersPath)) {
                    backupData.users = JSON.parse(fs.readFileSync(usersPath, 'utf8'))
                }
                if (fs.existsSync(groupsPath)) {
                    backupData.groups = JSON.parse(fs.readFileSync(groupsPath, 'utf8'))
                }
            } catch (err) {
                console.log('Some database files not found, continuing with partial backup')
            }
            
            const backupJson = JSON.stringify(backupData, null, 2)
            const fileName = `backup-${timestamp}.json`
            
            await sock.sendMessage(msg.key.remoteJid, {
                document: Buffer.from(backupJson),
                fileName: fileName,
                mimetype: 'application/json',
                caption: `💾 ${font.bold(font.smallCaps('DATABASE BACKUP'))}

╭─「 📋 ${font.smallCaps('Backup Details')} 」
├ 📁 ${font.smallCaps('File')}: ${fileName}
├ 📊 ${font.smallCaps('Users')}: ${Object.keys(backupData.users).length}
├ 👥 ${font.smallCaps('Groups')}: ${Object.keys(backupData.groups).length}
├ 🕒 ${font.smallCaps('Created')}: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}
╰───────────────

🔒 ${font.smallCaps('Keep this backup file safe and secure')}!`
            }, { quoted: msg })
            
            await react('✅')
            
        } catch (error) {
            console.error('Backup error:', error)
            await react('❌')
            await reply(`❌ ${font.smallCaps('Failed to create backup')}.`)
        }
    }
}
