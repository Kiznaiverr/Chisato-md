export default {
    command: 'cekwarn',
    aliases: ['checkwarn', 'warningku', 'mywarnings'],
    category: 'user',
    description: 'Check your warnings or someone\'s warnings (admin only)',
    usage: '.cekwarn [@user]',
    cooldown: 5,
    groupOnly: true,

    async execute({ msg, sock, reply, react, args, db, isGroup }) {
        try {
            await react('🔍');

            // Check if it's a group
            if (!isGroup) {
                return reply('❌ This command can only be used in groups!')
            }

            let targetJid = msg.key.participant || msg.key.remoteJid
            let isCheckingOther = false

            // Check if admin is checking someone else's warnings
            if (db.isAdmin(msg.key.participant || msg.key.remoteJid)) {
                // Check if replying to a message
                if (msg.message.extendedTextMessage?.contextInfo?.quotedMessage) {
                    targetJid = msg.message.extendedTextMessage.contextInfo.participant
                    isCheckingOther = true
                }
                // Check if mentioning a user
                else if (msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
                    targetJid = msg.message.extendedTextMessage.contextInfo.mentionedJid[0]
                    isCheckingOther = true
                }
                // Check if providing number manually
                else if (args[0]) {
                    let number = args[0].replace(/[^0-9]/g, '')
                    if (number.startsWith('0')) number = '62' + number.slice(1)
                    if (!number.startsWith('62')) number = '62' + number
                    targetJid = number + '@s.whatsapp.net'
                    isCheckingOther = true
                }
            } else if (args[0]) {
                // Non-admin trying to check someone else's warnings
                return reply('❌ Only admins can check other users\' warnings!')
            }

            // Get warnings data
            const warnings = db.getWarnings(targetJid)
            const targetNumber = targetJid.split('@')[0]
            const targetUser = db.getUser(targetJid)

            // Create warning status message
            let statusMessage = `📋 *WARNING STATUS* 📋\n\n`
            
            if (isCheckingOther) {
                statusMessage += `👤 *User:* @${targetNumber}\n`
            } else {
                statusMessage += `👤 *Your Status*\n`
            }
            
            statusMessage += `⚠️ *Current Warnings:* ${warnings.count}/3\n`
            
            if (warnings.count === 0) {
                statusMessage += `✅ *Status:* Clean record! 🎉\n\n`
                statusMessage += `💡 Keep following group rules to maintain your good standing.`
            } else {
                const remaining = 3 - warnings.count
                statusMessage += `🚨 *Risk Level:* ${warnings.count === 2 ? 'HIGH' : warnings.count === 1 ? 'MEDIUM' : 'LOW'}\n`
                statusMessage += `⏳ *Warnings until kick:* ${remaining}\n\n`
                
                // Show last warning details
                if (warnings.lastWarning) {
                    statusMessage += `📝 *Last Warning:*\n`
                    statusMessage += `   • Reason: ${warnings.lastWarning.reason}\n`
                    statusMessage += `   • By: ${warnings.lastWarning.warnedBy}\n`
                    statusMessage += `   • Date: ${new Date(warnings.lastWarning.timestamp).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}\n\n`
                }
                
                if (warnings.count >= 2) {
                    statusMessage += `🚨 *WARNING:* You are close to being kicked!\n`
                    statusMessage += `💡 Please follow group rules carefully.`
                } else {
                    statusMessage += `💡 Please be more careful to avoid additional warnings.`
                }
            }

            // Add warning history for admins
            if (isCheckingOther && warnings.history && warnings.history.length > 0) {
                statusMessage += `\n\n📊 *Warning History:*\n`
                warnings.history.slice(-5).forEach((warning, index) => {
                    statusMessage += `${index + 1}. ${warning.reason} - ${new Date(warning.timestamp).toLocaleDateString('id-ID')}\n`
                })
                
                if (warnings.history.length > 5) {
                    statusMessage += `... and ${warnings.history.length - 5} more\n`
                }
            }

            // Add admin actions info for admins
            if (isCheckingOther) {
                statusMessage += `\n\n🛠️ *Admin Actions:*\n`
                statusMessage += `• Use \`.warn @user [reason]\` to warn\n`
                statusMessage += `• Use \`.unwarn @user [reason]\` to remove warning\n`
                statusMessage += `• Use \`.clearwarn @user\` to reset all warnings`
            }

            await sock.sendMessage(msg.key.remoteJid, {
                text: statusMessage,
                mentions: [targetJid]
            }, { quoted: msg })

            await react('✅')

        } catch (error) {
            console.error('Error in cekwarn command:', error)
            await react('❌')
            await reply('❌ An error occurred while checking warnings.')
        }
    }
}
