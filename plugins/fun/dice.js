import crypto from 'crypto';
import font from '../../lib/font.js';

export default {
    command: 'dice',
    description: 'Roll dice with custom sides',
    category: 'fun',
    usage: '[sides] [count]',
    cooldown: 2,
    async execute(context) {
        const { args, reply } = context;
        
        let sides = parseInt(args[0]) || 6;
        let count = parseInt(args[1]) || 1;
        
        // Limits
        if (sides < 2) sides = 2;
        if (sides > 100) sides = 100;
        if (count < 1) count = 1;
        if (count > 10) count = 10;
        
        const rolls = [];
        let total = 0;
        
        for (let i = 0; i < count; i++) {
            const roll = crypto.randomInt(1, sides + 1);
            rolls.push(roll);
            total += roll;
        }
        
        // Dice emoji based on standard 6-sided dice
        const diceEmoji = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        
        let result = `🎲 ${font.bold(font.smallCaps('Dice Roll'))}\n\n`;
        
        if (count === 1) {
            const emoji = sides === 6 && rolls[0] <= 6 ? diceEmoji[rolls[0] - 1] : '🎲';
            result += `${emoji} ${font.bold('Result')}: ${rolls[0]}\n`;
            result += `🎯 ${font.smallCaps('Dice')}: ${sides}-sided\n`;
            
            // Special messages for common results
            if (sides === 6) {
                if (rolls[0] === 1) result += `\n💀 ${font.smallCaps('Critical fail!')}`;
                else if (rolls[0] === 6) result += `\n🎉 ${font.smallCaps('Critical success!')}`;
            } else if (rolls[0] === 1) {
                result += `\n💀 ${font.smallCaps('Minimum roll!')}`;
            } else if (rolls[0] === sides) {
                result += `\n🎉 ${font.smallCaps('Maximum roll!')}`;
            }
        } else {
            result += `🎲 ${font.bold('Rolls')}: [${rolls.join(', ')}]\n`;
            result += `📊 ${font.bold('Total')}: ${total}\n`;
            result += `📈 ${font.smallCaps('Average')}: ${(total / count).toFixed(1)}\n`;
            result += `🎯 ${font.smallCaps('Dice')}: ${count}x ${sides}-sided\n`;
            result += `📉 ${font.smallCaps('Min possible')}: ${count}\n`;
            result += `📈 ${font.smallCaps('Max possible')}: ${count * sides}`;
            
            // Check for special combinations
            const allSame = rolls.every(roll => roll === rolls[0]);
            const allMax = rolls.every(roll => roll === sides);
            const allMin = rolls.every(roll => roll === 1);
            
            if (allSame && !allMax && !allMin) {
                result += `\n🎯 ${font.smallCaps('All same numbers!')}`;
            } else if (allMax) {
                result += `\n🎉 ${font.smallCaps('All maximum rolls!')}`;
            } else if (allMin) {
                result += `\n💀 ${font.smallCaps('All minimum rolls!')}`;
            }
        }
        
        await reply(result);
    }
};
