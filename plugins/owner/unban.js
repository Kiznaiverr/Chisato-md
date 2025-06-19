export default {
    command: 'unban',
    description: 'Unban user',
    category: 'owner',
    usage: '@user',
    ownerOnly: true,
    cooldown: 0,
    async execute(context) {
        const { reply, msg, db } = context
        
        // Get mentioned users
        const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || []
        
        if (mentioned.length === 0) {
            return await reply('❌ Please mention a user to unban!\nExample: .unban @user')
        }
        
        const target = mentioned[0]
        const user = db.getUser(target)
        
        if (!user.banned) {
            return await reply('❌ User is not banned!')
        }
        
        user.banned = false
        db.saveUsers()
        
        await reply(`✅ Successfully unbanned @${target.split('@')[0]}!`)
    }
}
