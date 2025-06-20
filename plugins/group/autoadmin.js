import { convertToSmallCaps } from '../../lib/font.js';
import fs from 'fs';

export default {
    command: 'autoadmin',
    aliases: ['auto-admin', 'autopromote'],
    category: 'group',
    description: 'Automatically promote active members to admin',
    usage: '<on|off|config <threshold>|list>',
    groupOnly: true,
    adminOnly: true,
    cooldown: 10,
    
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
                const enabled = db[groupId].autoAdminEnabled || false;
                const threshold = db[groupId].autoAdminThreshold || 100;
                const candidates = db[groupId].autoAdminCandidates || [];
                
                return await sock.sendMessage(m.key.remoteJid, {
                    text: convertToSmallCaps(`👑 AUTO-ADMIN SYSTEM\n`) +
                        convertToSmallCaps(`━━━━━━━━━━━━━━━\n\n`) +
                        convertToSmallCaps(`📊 Status: ${enabled ? 'enabled' : 'disabled'}\n`) +
                        convertToSmallCaps(`🎯 Message threshold: ${threshold}\n`) +
                        convertToSmallCaps(`📋 Current candidates: ${candidates.length}\n\n`) +
                        convertToSmallCaps(`⚙️ COMMANDS:\n`) +
                        convertToSmallCaps(`• .autoadmin on - Enable auto-promotion\n`) +
                        convertToSmallCaps(`• .autoadmin off - Disable auto-promotion\n`) +
                        convertToSmallCaps(`• .autoadmin config <number> - Set threshold\n`) +
                        convertToSmallCaps(`• .autoadmin list - View candidates\n\n`) +
                        convertToSmallCaps(`💡 Members who reach the message threshold will be promoted automatically`)
                });
            }

            const action = args[0].toLowerCase();

            switch (action) {
                case 'on':
                    db[groupId].autoAdminEnabled = true;
                    if (!db[groupId].autoAdminThreshold) {
                        db[groupId].autoAdminThreshold = 100;
                    }
                    
                    await sock.sendMessage(m.key.remoteJid, {
                        text: convertToSmallCaps(`✅ Auto-admin system enabled!\n\n👑 Active members will be automatically promoted when they reach ${db[groupId].autoAdminThreshold} messages.\n\n📊 The bot will track message counts and promote eligible members.`)
                    });
                    break;

                case 'off':
                    db[groupId].autoAdminEnabled = false;
                    await sock.sendMessage(m.key.remoteJid, {
                        text: convertToSmallCaps('❌ Auto-admin system disabled.\n\nMembers will no longer be automatically promoted.')
                    });
                    break;

                case 'config':
                    if (!args[1] || isNaN(args[1])) {
                        return await sock.sendMessage(m.key.remoteJid, {
                            text: convertToSmallCaps('❌ Please provide a valid number for the message threshold.\n\nExample: .autoadmin config 150')
                        });
                    }

                    const newThreshold = parseInt(args[1]);
                    if (newThreshold < 10 || newThreshold > 1000) {
                        return await sock.sendMessage(m.key.remoteJid, {
                            text: convertToSmallCaps('❌ Threshold must be between 10 and 1000 messages.')
                        });
                    }

                    db[groupId].autoAdminThreshold = newThreshold;
                    await sock.sendMessage(m.key.remoteJid, {
                        text: convertToSmallCaps(`✅ Auto-admin threshold updated to ${newThreshold} messages.\n\nMembers who send ${newThreshold} or more messages will be eligible for promotion.`)
                    });
                    break;

                case 'list':
                    const groupMetadata = await sock.groupMetadata(groupId);
                    const memberStats = db[groupId].memberStats || {};
                    const threshold = db[groupId].autoAdminThreshold || 100;
                    
                    // Find eligible candidates
                    let candidates = [];
                    for (const [memberId, stats] of Object.entries(memberStats)) {
                        const member = groupMetadata.participants.find(p => p.id === memberId);
                        if (member && !member.admin && stats.messageCount >= threshold) {
                            candidates.push({
                                id: memberId,
                                name: stats.name || memberId.split('@')[0],
                                messages: stats.messageCount
                            });
                        }
                    }

                    // Sort by message count
                    candidates.sort((a, b) => b.messages - a.messages);

                    if (candidates.length === 0) {
                        await sock.sendMessage(m.key.remoteJid, {
                            text: convertToSmallCaps(`📋 No members are currently eligible for auto-promotion.\n\nThreshold: ${threshold} messages\nEligible members will appear here when they reach the threshold.`)
                        });
                    } else {
                        let listMessage = convertToSmallCaps(`👑 AUTO-ADMIN CANDIDATES\n`) +
                            convertToSmallCaps(`━━━━━━━━━━━━━━━\n\n`) +
                            convertToSmallCaps(`🎯 Threshold: ${threshold} messages\n\n`) +
                            convertToSmallCaps(`📋 ELIGIBLE MEMBERS:\n`);

                        candidates.forEach((candidate, index) => {
                            listMessage += convertToSmallCaps(`${index + 1}. ${candidate.name} (${candidate.messages} messages)\n`);
                        });

                        listMessage += convertToSmallCaps(`\n💡 These members will be promoted automatically when auto-admin is enabled.`);

                        await sock.sendMessage(m.key.remoteJid, {
                            text: listMessage
                        });
                    }
                    break;

                default:
                    await sock.sendMessage(m.key.remoteJid, {
                        text: convertToSmallCaps('❌ Invalid option. Use: on, off, config, or list')
                    });
                    return;
            }

            // Save database
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));        } catch (error) {
            console.error('AutoAdmin command error:', error);
            await sock.sendMessage(m.key.remoteJid, {
                text: convertToSmallCaps('❌ Error occurred while configuring auto-admin system.')
            });
        }
    }
};
