export default {
    command: 'demote',
    aliases: ['unadmin'],
    description: 'Demote admin to member',
    category: 'group',
    usage: '.demote @user',
    groupOnly: true,
    cooldown: 5,
    async execute(context) {
        const { reply, sock, msg, sender } = context
        
        // Get group metadata
        const groupMetadata = await sock.groupMetadata(msg.key.remoteJid)
        const participants = groupMetadata.participants
        
        // Check if sender is admin
        const senderAdmin = participants.find(p => p.id === sender)?.admin
        if (!senderAdmin) {
            return await reply('❌ You need to be an admin to use this command!')
        }
        
        // Check if bot is admin
        const botJid = sock.user.id
        const botAdmin = participants.find(p => p.id === botJid)?.admin
        if (!botAdmin) {
            return await reply('❌ I need to be an admin to demote members!')
        }
        
        // Get mentioned users
        const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || []
        
        if (mentioned.length === 0) {
            return await reply('❌ Please mention a user to demote!\nExample: .demote @user')
        }
        
        const target = mentioned[0]
        
        // Check if target is admin
        const targetAdmin = participants.find(p => p.id === target)?.admin
        if (!targetAdmin) {
            return await reply('❌ User is not an admin!')
        }
        
        try {
            await sock.groupParticipantsUpdate(msg.key.remoteJid, [target], 'demote')
            await reply(`✅ Successfully demoted @${target.split('@')[0]} from admin!`)
        } catch (error) {
            await reply('❌ Failed to demote the user. Make sure I have admin permissions!')
        }
    }
}
