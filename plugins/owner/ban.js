import font from '../../lib/font.js'

export default {
    command: 'ban',
    description: 'Ban user',
    category: 'owner',
    usage: '@user',
    ownerOnly: true,
    cooldown: 0,
    async execute(context) {
        const { reply, msg, db } = context
        
        const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || []
        
        if (mentioned.length === 0) {
            return await reply(`❌ ${font.smallCaps('Please mention a user to ban')}!\n${font.smallCaps('Example')}: .ban @user`)
        }
        
        const target = mentioned[0]
        
        if (db.isOwner(target)) {
            return await reply(`❌ ${font.smallCaps('Cannot ban bot owner')}!`)
        }
        
        const user = db.getUser(target)
        
        if (user.banned) {
            return await reply(`❌ ${font.smallCaps('User is already banned')}!`)
        }
        
        user.banned = true
        db.saveUsers()
        
        await reply(`✅ ${font.smallCaps('Successfully banned')} @${target.split('@')[0]} ${font.smallCaps('from using the bot')}!`)
    }
}
