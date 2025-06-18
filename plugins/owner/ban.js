export default {
    command: 'ban',
    description: 'Ban user from using the bot',
    category: 'owner',
    usage: '.ban @user',
    ownerOnly: true,
    cooldown: 0,
    async execute(context) {
        const { reply, msg, db } = context
        
        // Get mentioned users
        const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || []
        
        if (mentioned.length === 0) {
            return await reply('❌ Please mention a user to ban!\nExample: .ban @user')
        }
        
        const target = mentioned[0]
        
        // Check if target is owner
        if (db.isOwner(target)) {
            return await reply('❌ Cannot ban bot owner!')
        }
        
        const user = db.getUser(target)
        
        if (user.banned) {
            return await reply('❌ User is already banned!')
        }
        
        user.banned = true
        db.saveUsers()
        
        await reply(`✅ Successfully banned @${target.split('@')[0]} from using the bot!`)
    }
}
