import { convertToSmallCaps } from '../../lib/font.js';
import fs from 'fs';

export default {
    command: 'block',
    aliases: ['ban'],
    category: 'owner',
    description: 'Block a user from using the bot',
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
                    text: convertToSmallCaps('❌ Please mention a user or provide a phone number to block.\n\nExample: .block @user or .block 6281234567890')
                });
            }            // Read database
            const dbPath = './database/users.json';
            let db = {};
            
            if (fs.existsSync(dbPath)) {
                db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
            }

            if (!db[target]) {
                db[target] = {};
            }

            db[target].isBlocked = true;
            db[target].blockedAt = new Date().toISOString();

            // Save database
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

            await sock.sendMessage(m.key.remoteJid, {
                text: convertToSmallCaps(`✅ Successfully blocked user ${target.split('@')[0]}.\n\nThe user will no longer be able to use bot commands.`)
            });        } catch (error) {
            console.error('Block command error:', error);
            await sock.sendMessage(m.key.remoteJid, {
                text: convertToSmallCaps('❌ Error occurred while blocking user.')
            });
        }
    }
};
