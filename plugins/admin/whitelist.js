import font from '../../lib/font.js'

export default {
    command: 'whitelist',
    aliases: ['wl', 'exempt'],
    category: 'admin',
    description: 'Manage whitelist for antilink and antispam protection',
    usage: '<add/remove/list> [@user]',
    groupOnly: true,
    adminOnly: true,
    cooldown: 3,
    
    async execute({ sock, msg, args, reply, react, isGroup, db, sender, groupMetadata }) {
        if (!isGroup) return reply(`❌ ${font.smallCaps('This command can only be used in groups')}!`)
        
        const groupId = msg.key.remoteJid
        let groupData = db.groups[groupId] || {
            jid: groupId,
            name: groupMetadata?.subject || '',
            welcome: false,
            bye: false,
            antilink: false,
            antispam: false,
            mute: false,
            banned: false,
            created: Date.now(),
            welcomeText: '',
            byeText: '',
            whitelist: []
        }
        
        if (!groupData.whitelist) groupData.whitelist = []
        
        if (!args[0]) {
            const count = groupData.whitelist.length
            return reply(`📋 *${font.smallCaps('Whitelist Management')}*\n\n${font.smallCaps('Current whitelisted users')}: ${count}\n\n💡 *${font.smallCaps('Usage')}*:\n• ${font.smallCaps('.whitelist add @user - Add user to whitelist')}\n• ${font.smallCaps('.whitelist remove @user - Remove user from whitelist')}\n• ${font.smallCaps('.whitelist list - Show all whitelisted users')}\n\n📝 *${font.smallCaps('Note')}*: ${font.smallCaps('Whitelisted users are exempt from antilink and antispam protection')}`)
        }
        
        const action = args[0].toLowerCase()
        
        if (action === 'list') {
            if (groupData.whitelist.length === 0) {
                return reply(`📋 *${font.smallCaps('Whitelist')}*\n\n${font.smallCaps('No users are currently whitelisted')}.`)
            }
            
            let listText = `📋 *${font.smallCaps('Whitelisted Users')}*\n\n`
            groupData.whitelist.forEach((user, index) => {
                listText += `${index + 1}. @${user.split('@')[0]}\n`
            })
            
            return reply(listText)
        }
        
        if (action === 'add' || action === 'remove') {
            let targetUser = null
            
            // Check if user mentioned someone
            if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
                targetUser = msg.message.extendedTextMessage.contextInfo.mentionedJid[0]
            } else if (args[1]) {
                // Try to parse manual input
                let number = args[1].replace(/[^0-9]/g, '')
                if (number.startsWith('0')) {
                    number = '62' + number.slice(1)
                } else if (!number.startsWith('62')) {
                    number = '62' + number
                }
                targetUser = number + '@s.whatsapp.net'
            }
            
            if (!targetUser) {
                return reply(`❌ ${font.smallCaps('Please mention a user or provide their number')}!\n\n${font.smallCaps('Example')}: ${font.smallCaps('.whitelist')} ${action} ${font.smallCaps('@user')}`)
            }
            
            if (action === 'add') {
                if (groupData.whitelist.includes(targetUser)) {
                    return reply(`⚠️ @${targetUser.split('@')[0]} ${font.smallCaps('is already whitelisted')}!`)
                }
                  groupData.whitelist.push(targetUser)
                db.groups[groupId] = groupData
                db.saveGroups()
                
                await react('✅')
                return reply(`✅ @${targetUser.split('@')[0]} ${font.smallCaps('has been added to whitelist')}!\n\n${font.smallCaps('They are now exempt from antilink and antispam protection')}`)
                
            } else if (action === 'remove') {
                const index = groupData.whitelist.indexOf(targetUser)
                if (index === -1) {
                    return reply(`❌ @${targetUser.split('@')[0]} ${font.smallCaps('is not in the whitelist')}!`)
                }
                  groupData.whitelist.splice(index, 1)
                db.groups[groupId] = groupData
                db.saveGroups()
                
                await react('✅')
                return reply(`✅ @${targetUser.split('@')[0]} ${font.smallCaps('has been removed from whitelist')}!`)
            }
        }
        
        return reply(`❌ ${font.smallCaps('Invalid action')}!\n\n${font.smallCaps('Available actions')}: add, remove, list`)
    }
}
