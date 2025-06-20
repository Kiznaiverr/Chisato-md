import { convertToSmallCaps } from '../../lib/font.js';

export default {
    command: 'checkin',
    aliases: ['daily', 'check'],
    category: 'user',
    description: 'Daily check-in to earn points and rewards',
    usage: '',
    cooldown: 5,
      async execute({ reply, db, sender, react }) {
        try {
            await react('📅')
              const userId = sender;
            
            if (!db.users[userId]) {
                db.users[userId] = {};
            }

            const today = new Date().toDateString();
            const lastCheckin = db.users[userId].lastCheckin;

            // Check if already checked in today
            if (lastCheckin === today) {
                const nextCheckin = new Date();
                nextCheckin.setDate(nextCheckin.getDate() + 1);
                  return reply(convertToSmallCaps(`⏰ You have already checked in today!\n\nNext check-in available: ${nextCheckin.toDateString()}\n\nCurrent streak: ${db.users[userId].checkinStreak || 0} days\nTotal points: ${db.users[userId].points || 0}`));
            }

            // Initialize user data
            if (!db.users[userId].points) db.users[userId].points = 0;
            if (!db.users[userId].checkinStreak) db.users[userId].checkinStreak = 0;
            if (!db.users[userId].totalCheckins) db.users[userId].totalCheckins = 0;

            // Check if streak continues
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
              if (lastCheckin === yesterday.toDateString()) {
                db.users[userId].checkinStreak++;
            } else {
                db.users[userId].checkinStreak = 1;
            }

            // Calculate reward based on streak
            let baseReward = 10;
            let streakBonus = Math.min(db.users[userId].checkinStreak * 2, 50);
            let totalReward = baseReward + streakBonus;

            // Special milestones
            if (db.users[userId].checkinStreak === 7) totalReward += 50; // Weekly bonus
            if (db.users[userId].checkinStreak === 30) totalReward += 200; // Monthly bonus
            if (db.users[userId].checkinStreak % 100 === 0) totalReward += 500; // Century bonus

            db.users[userId].points += totalReward;
            db.users[userId].lastCheckin = today;
            db.users[userId].totalCheckins++;            // Save database
            
            let message = convertToSmallCaps(`✅ DAILY CHECK-IN SUCCESSFUL!\n`) +
                convertToSmallCaps(`━━━━━━━━━━━━━━━\n\n`) +
                convertToSmallCaps(`🎯 Base reward: ${baseReward} points\n`) +
                convertToSmallCaps(`🔥 Streak bonus: ${streakBonus} points\n`) +
                convertToSmallCaps(`💰 Total earned: ${totalReward} points\n\n`) +
                convertToSmallCaps(`📊 YOUR STATS:\n`) +
                convertToSmallCaps(`• Current streak: ${db.users[userId].checkinStreak} days\n`) +
                convertToSmallCaps(`• Total points: ${db.users[userId].points}\n`) +
                convertToSmallCaps(`• Total check-ins: ${db.users[userId].totalCheckins}\n\n`);

            // Add milestone messages
            if (db.users[userId].checkinStreak === 7) {
                message += convertToSmallCaps(`🎉 WEEKLY MILESTONE! +50 bonus points!\n`);
            }
            if (db.users[userId].checkinStreak === 30) {
                message += convertToSmallCaps(`🏆 MONTHLY MILESTONE! +200 bonus points!\n`);
            }
            if (db.users[userId].checkinStreak % 100 === 0) {
                message += convertToSmallCaps(`👑 CENTURY MILESTONE! +500 bonus points!\n`);
            }

            message += convertToSmallCaps(`\n⏰ Come back tomorrow for more rewards!`);

            await reply(message);        } catch (error) {
            console.error('Checkin command error:', error);
            await reply(convertToSmallCaps('❌ Error occurred during check-in.'));
        }
    }
};
