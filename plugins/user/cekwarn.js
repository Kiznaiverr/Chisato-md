import font from '../../lib/font.js'

export default {
    command: 'cekwarn',
    aliases: ['checkwarn', 'warningku', 'mywarnings'],
    category: 'user',
    description: 'Check your warnings or someone\'s warnings (admin only)',
    usage: '@user',
    cooldown: 5,
    groupOnly: true,

    async execute({ msg, sock, reply, react, args, db, isGroup }) {
        try {
            await react('🔍');

            // Check if it's a group
            if (!isGroup) {
                return reply(`❌ ${font.smallCaps('This command can only be used in groups')}!`)
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
                return reply(`❌ ${font.smallCaps('Only admins can check other users\' warnings')}!`)
            }

            // Get warnings data
            const warnings = db.getWarnings(targetJid)
            const targetNumber = targetJid.split('@')[0]
            const targetUser = db.getUser(targetJid)

            // Create warning status message
            let statusMessage = `📋 ${font.bold(font.smallCaps('WARNING STATUS'))} 📋\n\n`
            
            if (isCheckingOther) {
                statusMessage += `👤 ${font.bold(font.smallCaps('User'))}: @${targetNumber}\n`
            } else {
                statusMessage += `👤 ${font.bold(font.smallCaps('Your Status'))}\n`
            }
            
            statusMessage += `⚠️ ${font.bold(font.smallCaps('Current Warnings'))}: ${warnings.count}/3\n`
            
            if (warnings.count === 0) {
                statusMessage += `✅ ${font.bold(font.smallCaps('Status'))}: ${font.smallCaps('Clean record')}! 🎉\n\n`
                statusMessage += `💡 ${font.smallCaps('Keep following group rules to maintain your good standing')}.`
            } else {
                const remaining = 3 - warnings.count
                statusMessage += `🚨 ${font.bold(font.smallCaps('Risk Level'))}: ${warnings.count === 2 ? font.smallCaps('HIGH') : warnings.count === 1 ? font.smallCaps('MEDIUM') : font.smallCaps('LOW')}\n`
                statusMessage += `⏳ ${font.bold(font.smallCaps('Warnings until kick'))}: ${remaining}\n\n`
                
                // Show last warning details
                if (warnings.lastWarning) {
                    statusMessage += `📝 ${font.bold(font.smallCaps('Last Warning'))}:\n`
                    statusMessage += `   • ${font.smallCaps('Reason')}: ${warnings.lastWarning.reason}\n`
                    statusMessage += `   • ${font.smallCaps('By')}: ${warnings.lastWarning.warnedBy}\n`
                    statusMessage += `   • ${font.smallCaps('Date')}: ${new Date(warnings.lastWarning.timestamp).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}\n\n`
                }
                
                if (warnings.count >= 2) {
                    statusMessage += `🚨 ${font.bold(font.smallCaps('WARNING'))}: ${font.smallCaps('You are close to being kicked')}!\n`
                    statusMessage += `💡 ${font.smallCaps('Please follow group rules carefully')}.`
                } else {
                    statusMessage += `💡 ${font.smallCaps('Please be more careful to avoid additional warnings')}.`
                }
            }

            // Add warning history for admins
            if (isCheckingOther && warnings.history && warnings.history.length > 0) {
                statusMessage += `\n\n📊 ${font.bold(font.smallCaps('Warning History'))}:\n`
                warnings.history.slice(-5).forEach((warning, index) => {
                    statusMessage += `${index + 1}. ${warning.reason} - ${new Date(warning.timestamp).toLocaleDateString('id-ID')}\n`
                })
                
                if (warnings.history.length > 5) {
                    statusMessage += `... ${font.smallCaps('and')} ${warnings.history.length - 5} ${font.smallCaps('more')}\n`
                }
            }

            // Add admin actions info for admins
            if (isCheckingOther) {
                statusMessage += `\n\n🛠️ ${font.bold(font.smallCaps('Admin Actions'))}:\n`
                statusMessage += `• ${font.smallCaps('Use')} \`.warn @user [${font.smallCaps('reason')}]\` ${font.smallCaps('to warn')}\n`
                statusMessage += `• ${font.smallCaps('Use')} \`.unwarn @user [${font.smallCaps('reason')}]\` ${font.smallCaps('to remove warning')}\n`
                statusMessage += `• ${font.smallCaps('Use')} \`.clearwarn @user\` ${font.smallCaps('to reset all warnings')}`
            }

            await sock.sendMessage(msg.key.remoteJid, {
                text: statusMessage,
                mentions: [targetJid]
            }, { quoted: msg })

            await react('✅')

        } catch (error) {
            console.error('Error in cekwarn command:', error)
            await react('❌')
            await reply(`❌ ${font.smallCaps('An error occurred while checking warnings')}.`)
        }
    }
}
