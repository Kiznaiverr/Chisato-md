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
┌─「 *GROUP ADMINS* 」
│ 
├ 🏷️ *Group:* ${groupMetadata.subject}
├ 👥 *Total Members:* ${participants.length}
├ 👑 *Total Admins:* ${admins.length}
│ 
`
            
            if (superAdmins.length > 0) {
                adminText += `├ 👑 *SUPER ADMINS:*\n`
                superAdmins.forEach((admin, index) => {
                    const number = admin.id.split('@')[0]
                    adminText += `│ ${index + 1}. @${number}\n`
                })
                adminText += `│ \n`
            }
            
            if (regularAdmins.length > 0) {
                adminText += `├ 🛡️ *ADMINS:*\n`
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
            await reply('❌ Failed to get group information!')
        }
    }
}
