import font from '../../lib/font.js'

export default {
    command: 'adminlist',
    aliases: ['listadmin', 'admins'],
    description: 'Show list admins',
    category: 'group',
    usage: '',
    groupOnly: true,
    cooldown: 10,
    async execute(context) {
        const { reply, sock, msg } = context
        
        try {
            const groupMetadata = await sock.groupMetadata(msg.key.remoteJid)
            const participants = groupMetadata.participants
            
            const admins = participants.filter(p => p.admin)
            const superAdmins = admins.filter(p => p.admin === 'superadmin')
            const regularAdmins = admins.filter(p => p.admin === 'admin')
            
            let adminText = `
┌─「 ${font.bold(font.smallCaps('GROUP ADMINS'))} 」
│ 
├ 🏷️ ${font.bold(font.smallCaps('Group'))}: ${groupMetadata.subject}
├ 👥 ${font.bold(font.smallCaps('Total Members'))}: ${participants.length}
├ 👑 ${font.bold(font.smallCaps('Total Admins'))}: ${admins.length}
│ 
`
            
            if (superAdmins.length > 0) {
                adminText += `├ 👑 ${font.bold(font.smallCaps('SUPER ADMINS'))}:\n`
                superAdmins.forEach((admin, index) => {
                    const number = admin.id.split('@')[0]
                    adminText += `│ ${index + 1}. @${number}\n`
                })
                adminText += `│ \n`
            }
            
            if (regularAdmins.length > 0) {
                adminText += `├ 🛡️ ${font.bold(font.smallCaps('ADMINS'))}:\n`
                regularAdmins.forEach((admin, index) => {
                    const number = admin.id.split('@')[0]
                    adminText += `│ ${index + 1}. @${number}\n`
                })
            }
            
            adminText += `│ \n└────`
            
            const mentions = admins.map(admin => admin.id)
            
            await sock.sendMessage(msg.key.remoteJid, {
                text: adminText.trim(),
                mentions: mentions
            })
            
        } catch (error) {
            await reply(`❌ ${font.smallCaps('Failed to get group information')}!`)
        }
    }
}
