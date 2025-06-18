export default {
    command: 'kick',
    aliases: ['tendang'],
    description: 'Kick a member from group',
    category: 'group',
    usage: '.kick @user',
    groupOnly: true,
    cooldown: 5,
    async execute(context) {
        const { reply, sock, msg, isGroup, sender } = context
        
        if (!isGroup) {
            return await reply('❌ This command can only be used in groups!')
        }
        
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
            return await reply('❌ I need to be an admin to kick members!')
        }
        
        // Get mentioned users
        const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || []
        
        if (mentioned.length === 0) {
            return await reply('❌ Please mention a user to kick!\nExample: .kick @user')
        }
        
        const target = mentioned[0]
        
        // Check if target is admin
        const targetAdmin = participants.find(p => p.id === target)?.admin
        if (targetAdmin) {
            return await reply('❌ Cannot kick an admin!')
        }
        
        try {
            await sock.groupParticipantsUpdate(msg.key.remoteJid, [target], 'remove')
            await reply(`✅ Successfully kicked @${target.split('@')[0]} from the group!`)
        } catch (error) {
            await reply('❌ Failed to kick the user. Make sure I have admin permissions!')
        }
    }
}
