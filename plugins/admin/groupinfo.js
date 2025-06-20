import font from '../../lib/font.js'

export default {
    command: 'groupinfo',
    aliases: ['ginfo', 'groupdetails'],
    category: 'admin',
    description: 'Show detailed group information',
    usage: '',
    groupOnly: true,
    adminOnly: true,
    cooldown: 5,
    
    async execute({ sock, msg, reply, react, isGroup, groupMetadata }) {
        if (!isGroup) return reply(`❌ ${font.smallCaps('This command can only be used in groups')}!`)
        
        try {
            await react('🕔')
            
            const participants = groupMetadata.participants
            const admins = participants.filter(p => p.admin)
            const superAdmins = admins.filter(p => p.admin === 'superadmin')
            const regularAdmins = admins.filter(p => p.admin === 'admin')
            const members = participants.filter(p => !p.admin)
            
            const creationDate = groupMetadata.creation ? new Date(groupMetadata.creation * 1000) : null
            
            let infoText = `📋 ${font.bold(font.smallCaps('GROUP INFORMATION'))}

╭─「 🏷️ ${font.smallCaps('Basic Info')} 」
├ 📝 ${font.smallCaps('Name')}: ${font.smallCaps(groupMetadata.subject)}
├ 🆔 ${font.smallCaps('ID')}: ${msg.key.remoteJid.split('@')[0]}
├ 📄 ${font.smallCaps('Description')}: ${font.smallCaps(groupMetadata.desc || 'No description')}
├ 📅 ${font.smallCaps('Created')}: ${creationDate ? creationDate.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) : font.smallCaps('Unknown')}
├ 🔒 ${font.smallCaps('Restrict')}: ${groupMetadata.restrict ? font.smallCaps('Yes') : font.smallCaps('No')}
├ 📢 ${font.smallCaps('Announce')}: ${groupMetadata.announce ? font.smallCaps('Admins Only') : font.smallCaps('Everyone')}
╰───────────────

╭─「 👥 ${font.smallCaps('Member Statistics')} 」
├ 📊 ${font.smallCaps('Total Members')}: ${participants.length}
├ 👑 ${font.smallCaps('Super Admins')}: ${superAdmins.length}
├ 🛡️ ${font.smallCaps('Admins')}: ${regularAdmins.length}
├ 👤 ${font.smallCaps('Regular Members')}: ${members.length}
╰───────────────`

            if (superAdmins.length > 0) {
                infoText += `\n\n╭─「 👑 ${font.smallCaps('Super Admins')} 」\n`
                superAdmins.slice(0, 5).forEach((admin, index) => {
                    const number = admin.id.split('@')[0]
                    const symbol = index === superAdmins.length - 1 || index === 4 ? '╰' : '├'
                    infoText += `${symbol} @${number}\n`
                })
                if (superAdmins.length > 5) {
                    infoText += `└ ${font.smallCaps('and')} ${superAdmins.length - 5} ${font.smallCaps('more')}...\n`
                }
            }

            if (regularAdmins.length > 0) {
                infoText += `\n╭─「 🛡️ ${font.smallCaps('Admins')} 」\n`
                regularAdmins.slice(0, 5).forEach((admin, index) => {
                    const number = admin.id.split('@')[0]
                    const symbol = index === regularAdmins.length - 1 || index === 4 ? '╰' : '├'
                    infoText += `${symbol} @${number}\n`
                })
                if (regularAdmins.length > 5) {
                    infoText += `└ ${font.smallCaps('and')} ${regularAdmins.length - 5} ${font.smallCaps('more')}...\n`
                }
            }

            infoText += `\n╭─「 ⚙️ ${font.smallCaps('Group Settings')} 」\n`
            infoText += `├ 📝 ${font.smallCaps('Edit Info')}: ${groupMetadata.restrict ? font.smallCaps('Admins Only') : font.smallCaps('All Members')}\n`
            infoText += `├ 💬 ${font.smallCaps('Send Messages')}: ${groupMetadata.announce ? font.smallCaps('Admins Only') : font.smallCaps('All Members')}\n`
            infoText += `├ 🔗 ${font.smallCaps('Invite Link')}: ${font.smallCaps('Available')}\n`
            infoText += `╰───────────────\n\n`
            infoText += `🕒 ${font.smallCaps('Retrieved at')}: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`
            
            const mentions = [...superAdmins, ...regularAdmins.slice(0, 5)].map(admin => admin.id)
            
            await sock.sendMessage(msg.key.remoteJid, {
                text: infoText,
                mentions: mentions
            })
            
            await react('✅')
            
        } catch (error) {
            console.error('Error getting group info:', error)
            await react('❌')
            await reply(`❌ ${font.smallCaps('Failed to get group information')}.`)
        }
    }
}
