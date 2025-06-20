import { convertToSmallCaps } from '../../lib/font.js';
import fs from 'fs';

export default {
    command: 'unblock',
    aliases: ['unban'],
    category: 'owner',
    description: 'Unblock a user from using the bot',
    usage: '<@user|number>',
    ownerOnly: true,
    cooldown: 5,
    
    async execute(sock, m, args) {
        try {
            let target;
            
            if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
                target = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
            } else if (args[0]) {
                target = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            } else {
                return await sock.sendMessage(m.key.remoteJid, {
                    text: convertToSmallCaps('❌ Please mention a user or provide a phone number to unblock.\n\nExample: .unblock @user or .unblock 6281234567890')
                });
            }            // Read database
            const dbPath = './database/users.json';
            let db = {};
            
            if (fs.existsSync(dbPath)) {
                db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
            }

            if (!db[target] || !db[target].isBlocked) {
                return await sock.sendMessage(m.key.remoteJid, {
                    text: convertToSmallCaps(`❌ User ${target.split('@')[0]} is not blocked.`)
                });
            }

            db[target].isBlocked = false;
            delete db[target].blockedAt;

            // Save database
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

            await sock.sendMessage(m.key.remoteJid, {
                text: convertToSmallCaps(`✅ Successfully unblocked user ${target.split('@')[0]}.\n\nThe user can now use bot commands again.`)
            });        } catch (error) {
            console.error('Unblock command error:', error);
            await sock.sendMessage(m.key.remoteJid, {
                text: convertToSmallCaps('❌ Error occurred while unblocking user.')
            });
        }
    }
};
