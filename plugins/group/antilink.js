import { convertToSmallCaps } from '../../lib/font.js';
import fs from 'fs';

export default {
    command: 'antilink',
    aliases: ['anti-link', 'nolink'],
    category: 'group',
    description: 'Enable/disable automatic link deletion',
    usage: '<on|off|kick|warn>',
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
                const enabled = db[groupId].antilinkEnabled || false;
                const action = db[groupId].antilinkAction || 'delete';
                const whitelist = db[groupId].antilinkWhitelist || [];
                
                return await sock.sendMessage(m.key.remoteJid, {
                    text: convertToSmallCaps(`🔗 ANTI-LINK PROTECTION\n`) +
                        convertToSmallCaps(`━━━━━━━━━━━━━━━\n\n`) +
                        convertToSmallCaps(`📊 Status: ${enabled ? 'enabled' : 'disabled'}\n`) +
                        convertToSmallCaps(`⚡ Action: ${action}\n`) +
                        convertToSmallCaps(`🏷️ Whitelisted domains: ${whitelist.length}\n\n`) +
                        convertToSmallCaps(`⚙️ COMMANDS:\n`) +
                        convertToSmallCaps(`• .antilink on - Enable link protection\n`) +
                        convertToSmallCaps(`• .antilink off - Disable link protection\n`) +
                        convertToSmallCaps(`• .antilink kick - Enable with auto-kick\n`) +
                        convertToSmallCaps(`• .antilink warn - Enable with warnings\n\n`) +
                        convertToSmallCaps(`ℹ️ Admins are exempt from anti-link protection`)
                });
            }

            const action = args[0].toLowerCase();

            switch (action) {
                case 'on':
                    db[groupId].antilinkEnabled = true;
                    db[groupId].antilinkAction = 'delete';
                    await sock.sendMessage(m.key.remoteJid, {
                        text: convertToSmallCaps('✅ Anti-link protection enabled!\n\n🔗 Links sent by non-admins will be automatically deleted.\n\n⚠️ Action: Delete message only')
                    });
                    break;

                case 'off':
                    db[groupId].antilinkEnabled = false;
                    await sock.sendMessage(m.key.remoteJid, {
                        text: convertToSmallCaps('❌ Anti-link protection disabled.\n\nMembers can now send links freely.')
                    });
                    break;

                case 'kick':
                    db[groupId].antilinkEnabled = true;
                    db[groupId].antilinkAction = 'kick';
                    await sock.sendMessage(m.key.remoteJid, {
                        text: convertToSmallCaps('✅ Anti-link protection enabled with auto-kick!\n\n🔗 Non-admins who send links will be:\n• Message deleted\n• Automatically kicked from group\n\n⚠️ Use this setting carefully!')
                    });
                    break;

                case 'warn':
                    db[groupId].antilinkEnabled = true;
                    db[groupId].antilinkAction = 'warn';
                    await sock.sendMessage(m.key.remoteJid, {
                        text: convertToSmallCaps('✅ Anti-link protection enabled with warnings!\n\n🔗 Non-admins who send links will be:\n• Message deleted\n• Given a warning\n• Kicked after 3 warnings\n\n💡 Balanced approach for rule enforcement')
                    });
                    break;

                default:
                    await sock.sendMessage(m.key.remoteJid, {
                        text: convertToSmallCaps('❌ Invalid option. Use: on, off, kick, or warn')
                    });
                    return;
            }

            if (!db[groupId].antilinkWhitelist) {
                db[groupId].antilinkWhitelist = ['youtube.com', 'youtu.be', 'github.com'];
            }

            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));        } catch (error) {
            console.error('Antilink command error:', error);
            await sock.sendMessage(m.key.remoteJid, {
                text: convertToSmallCaps('❌ Error occurred while configuring anti-link protection.')
            });
        }
    }
};
