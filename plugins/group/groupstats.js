import { convertToSmallCaps } from '../../lib/font.js';
import fs from 'fs';

export default {
    command: 'groupstats',
    aliases: ['gstats', 'groupinfo'],
    category: 'group',
    description: 'View detailed group statistics and activity',
    usage: '',
    groupOnly: true,
    cooldown: 10,
    
    async execute(sock, m, args) {        try {
            const groupId = m.key.remoteJid;
            
            // Get group metadata
            const groupMetadata = await sock.groupMetadata(groupId);
            const groupName = groupMetadata.subject;
            const totalMembers = groupMetadata.participants.length;
            const admins = groupMetadata.participants.filter(p => p.admin).length;
            const regularMembers = totalMembers - admins;
            const creationDate = new Date(groupMetadata.creation * 1000).toDateString();

            // Get group data from database
            const dbPath = './database/groups.json';
            let db = {};
            if (fs.existsSync(dbPath)) {
                db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
            }

            const groupData = db[groupId] || {};

            // Calculate activity stats
            const messagesCount = groupData.messageCount || 0;
            const commandsUsed = groupData.commandsUsed || 0;
            const lastActivity = groupData.lastActivity ? new Date(groupData.lastActivity).toDateString() : 'Unknown';

            // Get most active members (if tracking is enabled)
            let topMembers = [];
            if (groupData.memberStats) {
                topMembers = Object.entries(groupData.memberStats)
                    .sort(([,a], [,b]) => (b.messageCount || 0) - (a.messageCount || 0))
                    .slice(0, 5);
            }

            // Group features status
            const features = {
                'Welcome Messages': groupData.welcomeEnabled ? '✅' : '❌',
                'Anti-Link': groupData.antilinkEnabled ? '✅' : '❌',
                'Auto Admin': groupData.autoAdminEnabled ? '✅' : '❌',
                'Message Logging': groupData.loggingEnabled ? '✅' : '❌'
            };

            // Calculate group activity level
            let activityLevel = 'Low';
            const dailyAverage = messagesCount / Math.max(1, (Date.now() - (groupMetadata.creation * 1000)) / (1000 * 60 * 60 * 24));
            
            if (dailyAverage > 50) activityLevel = 'Very High';
            else if (dailyAverage > 20) activityLevel = 'High';
            else if (dailyAverage > 10) activityLevel = 'Medium';

            let statsMessage = convertToSmallCaps(`📊 GROUP STATISTICS\n`) +
                convertToSmallCaps(`━━━━━━━━━━━━━━━\n\n`) +
                convertToSmallCaps(`🏷️ GROUP INFO:\n`) +
                convertToSmallCaps(`• Name: ${groupName}\n`) +
                convertToSmallCaps(`• Created: ${creationDate}\n`) +
                convertToSmallCaps(`• ID: ${groupId.split('@')[0]}\n\n`) +
                convertToSmallCaps(`👥 MEMBERS:\n`) +
                convertToSmallCaps(`• Total: ${totalMembers}\n`) +
                convertToSmallCaps(`• Admins: ${admins}\n`) +
                convertToSmallCaps(`• Regular: ${regularMembers}\n\n`) +
                convertToSmallCaps(`📈 ACTIVITY:\n`) +
                convertToSmallCaps(`• Messages sent: ${messagesCount}\n`) +
                convertToSmallCaps(`• Commands used: ${commandsUsed}\n`) +
                convertToSmallCaps(`• Activity level: ${activityLevel}\n`) +
                convertToSmallCaps(`• Last activity: ${lastActivity}\n\n`) +
                convertToSmallCaps(`⚙️ FEATURES:\n`);

            // Add features status
            Object.entries(features).forEach(([feature, status]) => {
                statsMessage += convertToSmallCaps(`• ${feature}: ${status}\n`);
            });

            // Add top members if available
            if (topMembers.length > 0) {
                statsMessage += convertToSmallCaps(`\n🔥 MOST ACTIVE MEMBERS:\n`);
                topMembers.forEach(([memberId, stats], index) => {
                    const memberName = stats.name || memberId.split('@')[0];
                    const messageCount = stats.messageCount || 0;
                    statsMessage += convertToSmallCaps(`${index + 1}. ${memberName}: ${messageCount} messages\n`);
                });
            }

            // Add group health indicators
            const memberRatio = (admins / totalMembers * 100).toFixed(1);
            const commandRatio = totalMembers > 0 ? (commandsUsed / totalMembers).toFixed(1) : 0;

            statsMessage += convertToSmallCaps(`\n📊 GROUP HEALTH:\n`) +
                convertToSmallCaps(`• Admin ratio: ${memberRatio}%\n`) +
                convertToSmallCaps(`• Commands per member: ${commandRatio}\n`) +
                convertToSmallCaps(`• Engagement: ${messagesCount > totalMembers * 10 ? 'High' : messagesCount > totalMembers * 5 ? 'Medium' : 'Low'}\n\n`) +
                convertToSmallCaps(`💡 Tip: Use group management commands to improve activity and organization!`);

            await sock.sendMessage(m.key.remoteJid, {
                text: statsMessage
            });        } catch (error) {
            console.error('GroupStats command error:', error);
            await sock.sendMessage(m.key.remoteJid, {
                text: convertToSmallCaps('❌ Error occurred while retrieving group statistics.')
            });
        }
    }
};
