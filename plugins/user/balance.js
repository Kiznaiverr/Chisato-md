import { convertToSmallCaps } from '../../lib/font.js';

export default {
    command: 'balance',
    aliases: ['bal', 'points', 'money'],
    category: 'user',
    description: 'Check your point balance and economy stats',
    usage: '',
    cooldown: 3,    
    async execute({ reply, db, sender, react }) {
        try {
            await react('💰')
            
            const userId = sender;
            
            if (!db.users[userId]) {
                db.users[userId] = { points: 0 };
            }

            const user = db.users[userId];
            const points = user.points || 0;
            const level = Math.floor(points / 100) + 1;
            const nextLevelPoints = level * 100;
            const progressPoints = points % 100;
            const progressPercent = (progressPoints / 100 * 100).toFixed(1);

            // Calculate daily earning potential
            const lastCheckin = user.lastCheckin;
            const today = new Date().toDateString();
            const canCheckin = lastCheckin !== today;
            
            let dailyPotential = 10; // Base checkin
            if (user.checkinStreak) {
                dailyPotential += Math.min(user.checkinStreak * 2, 50);
            }

            // Point history (last 7 days)
            let pointHistory = user.pointHistory || [];
            
            // Generate progress bar
            const barLength = 20;
            const filledBars = Math.floor((progressPoints / 100) * barLength);
            const progressBar = '█'.repeat(filledBars) + '░'.repeat(barLength - filledBars);

            let balanceMessage = convertToSmallCaps(`💰 YOUR BALANCE\n`) +
                convertToSmallCaps(`━━━━━━━━━━━━━━━\n\n`) +
                convertToSmallCaps(`💎 Current points: ${points}\n`) +
                convertToSmallCaps(`⭐ Current level: ${level}\n\n`) +
                convertToSmallCaps(`📈 LEVEL PROGRESS:\n`) +
                convertToSmallCaps(`${progressBar} ${progressPercent}%\n`) +
                convertToSmallCaps(`${progressPoints}/${nextLevelPoints - (level - 1) * 100} points to level ${level + 1}\n\n`) +
                convertToSmallCaps(`💰 EARNING INFO:\n`) +
                convertToSmallCaps(`• Daily potential: ${dailyPotential} points\n`) +
                convertToSmallCaps(`• Check-in available: ${canCheckin ? 'Yes ✅' : 'No ❌'}\n`) +
                convertToSmallCaps(`• Current streak: ${user.checkinStreak || 0} days\n\n`);

            // Show point categories/sources
            const totalCheckinPoints = (user.totalCheckins || 0) * 10;
            const streakBonusPoints = Math.max(0, points - totalCheckinPoints);
            
            balanceMessage += convertToSmallCaps(`📊 POINT SOURCES:\n`) +
                convertToSmallCaps(`• Daily check-ins: ~${totalCheckinPoints}\n`) +
                convertToSmallCaps(`• Streak bonuses: ~${streakBonusPoints}\n`) +
                convertToSmallCaps(`• Other activities: ${points - totalCheckinPoints - streakBonusPoints}\n\n`);

            // Add tips for earning more points
            balanceMessage += convertToSmallCaps(`💡 EARNING TIPS:\n`) +
                convertToSmallCaps(`• Daily check-in: up to 60 points\n`) +
                convertToSmallCaps(`• Keep streaks: 2x points per day\n`) +
                convertToSmallCaps(`• Weekly bonus: +50 points (7 days)\n`) +
                convertToSmallCaps(`• Monthly bonus: +200 points (30 days)\n\n`);

            if (canCheckin) {
                balanceMessage += convertToSmallCaps(`🎯 Use .checkin to earn ${dailyPotential} points today!`);
            } else {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                balanceMessage += convertToSmallCaps(`⏰ Next check-in: ${tomorrow.toDateString()}`);
            }            await reply(balanceMessage);

        } catch (error) {
            console.error('Balance command error:', error);
            await reply(convertToSmallCaps('❌ Error occurred while checking balance.'));
        }
    }
};
