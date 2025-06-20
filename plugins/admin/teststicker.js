import font from '../../lib/font.js'

export default {
    command: 'teststicker',
    aliases: ['testantisticker', 'stickertest'],
    category: 'admin',
    description: 'Test the antisticker protection by sending a test sticker',
    usage: '',
    groupOnly: true,
    adminOnly: true,
    cooldown: 10,
    
    async execute({ sock, msg, args, reply, react, isGroup, db, sender, groupMetadata }) {
        if (!isGroup) return reply(`❌ ${font.smallCaps('This command can only be used in groups')}!`)
        
        const groupId = msg.key.remoteJid
        const groupData = db.getGroup(groupId)
        
        if (!groupData.antisticker) {
            return reply(`❌ ${font.smallCaps('Antisticker protection is disabled')}!\n\n${font.smallCaps('Enable it first with')}: ${font.smallCaps('.antisticker on')}`)
        }
        
        await react('🧪')
        
        const action = groupData.antistickerAction || font.smallCaps('delete')
        let actionDesc = ''
        
        switch (action) {
            case 'delete':
                actionDesc = font.smallCaps('Stickers will be deleted silently')
                break
            case 'warn':
                actionDesc = font.smallCaps('Stickers will be deleted and users will be warned')
                break
            case 'kick':
                actionDesc = font.smallCaps('Stickers will be deleted and users will be kicked')
                break
        }
        
        return reply(`🧪 *${font.smallCaps('Antisticker Test Info')}*\n\n🛡️ ${font.smallCaps('Protection Status')}: ✅ ${font.smallCaps('Enabled')}\n⚙️ ${font.smallCaps('Current Action')}: *${font.smallCaps(action)}*\n📝 ${font.smallCaps('Behavior')}: ${actionDesc}\n\n💡 ${font.smallCaps('Note')}: ${font.smallCaps('Send a sticker now to test the protection')}`)
    }
}
