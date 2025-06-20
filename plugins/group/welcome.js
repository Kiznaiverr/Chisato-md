import { convertToSmallCaps } from '../../lib/font.js';
import fs from 'fs';

export default {
    command: 'welcome',
    aliases: ['welcomemsg', 'setwelcome'],
    category: 'group',
    description: 'Configure welcome messages for new group members',
    usage: '<on|off|set <message>|preview>',
    groupOnly: true,
    adminOnly: true,
    cooldown: 5,
    
    async execute(sock, m, args) {        try {
            const groupId = m.key.remoteJid;
            const dbPath = './database/groups.json';
            
            let db = {};
            if (fs.existsSync(dbPath)) {
                db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
            }

            if (!db[groupId]) {
                db[groupId] = {};
            }

            if (!args[0]) {
                const status = db[groupId].welcomeEnabled ? 'enabled' : 'disabled';
                const message = db[groupId].welcomeMessage || 'Welcome to our group, @user! 🎉';
                
                return await sock.sendMessage(m.key.remoteJid, {
                    text: convertToSmallCaps(`🎉 WELCOME MESSAGE SETTINGS\n`) +
                        convertToSmallCaps(`━━━━━━━━━━━━━━━\n\n`) +
                        convertToSmallCaps(`📊 Status: ${status}\n`) +
                        convertToSmallCaps(`📝 Current message:\n${message}\n\n`) +
                        convertToSmallCaps(`⚙️ COMMANDS:\n`) +
                        convertToSmallCaps(`• .welcome on - Enable welcome messages\n`) +
                        convertToSmallCaps(`• .welcome off - Disable welcome messages\n`) +
                        convertToSmallCaps(`• .welcome set <message> - Set custom message\n`) +
                        convertToSmallCaps(`• .welcome preview - Preview current message\n\n`) +
                        convertToSmallCaps(`💡 Use @user in your message to mention the new member`)
                });
            }

            const action = args[0].toLowerCase();

            switch (action) {
                case 'on':
                    db[groupId].welcomeEnabled = true;
                    await sock.sendMessage(m.key.remoteJid, {
                        text: convertToSmallCaps('✅ Welcome messages have been enabled!\n\nNew members will receive a welcome message when they join.')
                    });
                    break;

                case 'off':
                    db[groupId].welcomeEnabled = false;
                    await sock.sendMessage(m.key.remoteJid, {
                        text: convertToSmallCaps('❌ Welcome messages have been disabled.\n\nNew members will not receive welcome messages.')
                    });
                    break;

                case 'set':
                    if (!args.slice(1).length) {
                        return await sock.sendMessage(m.key.remoteJid, {
                            text: convertToSmallCaps('❌ Please provide a welcome message.\n\nExample: .welcome set Welcome @user! Please read the rules 📜')
                        });
                    }
                    
                    const newMessage = args.slice(1).join(' ');
                    db[groupId].welcomeMessage = newMessage;
                    db[groupId].welcomeEnabled = true; // Auto-enable when setting message
                    
                    await sock.sendMessage(m.key.remoteJid, {
                        text: convertToSmallCaps(`✅ Welcome message updated and enabled!\n\n📝 New message:\n${newMessage}\n\n💡 Use .welcome preview to see how it looks`)
                    });
                    break;

                case 'preview':
                    const previewMessage = db[groupId].welcomeMessage || 'Welcome to our group, @user! 🎉';
                    const sampleUser = m.key.participant || m.key.remoteJid;
                    const preview = previewMessage.replace(/@user/g, `@${sampleUser.split('@')[0]}`);
                    
                    await sock.sendMessage(m.key.remoteJid, {
                        text: convertToSmallCaps(`👀 WELCOME MESSAGE PREVIEW:\n`) +
                            convertToSmallCaps(`━━━━━━━━━━━━━━━\n\n`) +
                            convertToSmallCaps(`${preview}\n\n`) +
                            convertToSmallCaps(`ℹ️ This is how new members will see the welcome message.`),
                        mentions: [sampleUser]
                    });
                    break;

                default:
                    await sock.sendMessage(m.key.remoteJid, {
                        text: convertToSmallCaps('❌ Invalid option. Use: on, off, set, or preview')
                    });
                    return;
            }

            // Save database
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));        } catch (error) {
            console.error('Welcome command error:', error);
            await sock.sendMessage(m.key.remoteJid, {
                text: convertToSmallCaps('❌ Error occurred while configuring welcome messages.')
            });
        }
    }
};
