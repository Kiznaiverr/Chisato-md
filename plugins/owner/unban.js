import font from '../../lib/font.js'

export default {
    command: 'unban',
    description: 'Unban user',
    category: 'owner',
    usage: '@user',
    ownerOnly: true,
    cooldown: 0,
    async execute(context) {
        const { reply, msg, db } = context
        
        const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || []
        
        if (mentioned.length === 0) {
            return await reply(`❌ ${font.smallCaps('Please mention a user to unban')}!\n${font.smallCaps('Example')}: .unban @user`)
        }
        
        const target = mentioned[0]
        const user = db.getUser(target)
        
        if (!user.banned) {
            return await reply(`❌ ${font.smallCaps('User is not banned')}!`)
        }
        
        user.banned = false
        db.saveUsers()
        
        await reply(`✅ ${font.smallCaps('Successfully unbanned')} @${target.split('@')[0]}!`)
    }
}
