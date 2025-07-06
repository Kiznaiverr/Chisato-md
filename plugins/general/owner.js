import font from '../../lib/font.js'

export default {
    command: 'owner',
    aliases: ['creator', 'dev'],
    description: 'Show owner details',
    category: 'general',
    usage: '',
    cooldown: 5,
    async execute(context) {
        const { reply, sock, config, msg } = context
        
        const ownerInfo = config.get('ownerSettings')
        const botInfo = config.get('botSettings')
        
        // Send owner contact if number is available
        if (ownerInfo.ownerNumber) {
            try {
                // Clean the phone number (remove any non-numeric characters)
                let cleanNumber = ownerInfo.ownerNumber.replace(/[^\d]/g, '')
                
                // VCard format exactly like the documentation
                const vcard = 'BEGIN:VCARD\n'
                    + 'VERSION:3.0\n'
                    + `FN:${ownerInfo.ownerName || 'Bot Owner'}\n`
                    + `ORG:${botInfo.botName || 'Chisato-MD'} Developer;\n`
                    + 'TITLE:Bot Developer & Creator\n'
                    + `TEL;type=CELL;type=VOICE;waid=${cleanNumber}:+${cleanNumber}\n`
                    + 'URL;type=WORK:https://kiznavierr.my.id\n'
                    + 'URL;type=HOME:https://github.com/kiznaiverr/chisato-md\n'
                    + 'EMAIL;type=WORK:contact@kiznavierr.my.id\n'
                    + 'END:VCARD'
                
                // Send contact exactly like the documentation
                await sock.sendMessage(msg.key.remoteJid, {
                    contacts: {
                        displayName: ownerInfo.ownerName || 'Bot Owner',
                        contacts: [{ vcard }]
                    }
                }, { quoted: msg })
                
            } catch (error) {
                console.error('Error sending contact:', error)
                await reply(`❌ ${font.smallCaps('Failed to send owner contact')}. ${font.smallCaps('Please contact manually')}: +${ownerInfo.ownerNumber}`)
            }
        } else {
            await reply(`⚠️ ${font.smallCaps('Owner number not configured in bot settings')}.`)
        }
    }
}
