import crypto from 'crypto';
import font from '../../lib/font.js';

export default {
    command: 'password',
    description: 'Generate secure password',
    category: 'tools',
    usage: '[length] [options: simple/complex]',
    cooldown: 2,
    async execute(context) {
        const { args, reply } = context;
        
        let length = parseInt(args[0]) || 12;
        const type = args[1]?.toLowerCase() || 'complex';
        
        // Limit password length
        if (length < 4) length = 4;
        if (length > 50) length = 50;
        
        let charset = '';
        let description = '';
        
        if (type === 'simple') {
            charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            description = 'Simple (Letters + Numbers)';
        } else {
            charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
            description = 'Complex (Letters + Numbers + Symbols)';
        }
        
        let password = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = crypto.randomInt(0, charset.length);
            password += charset[randomIndex];
        }
        
        // Calculate password strength
        let strength = 'Weak';
        if (length >= 8 && type === 'complex') strength = 'Very Strong';
        else if (length >= 8 && type === 'simple') strength = 'Strong';
        else if (length >= 6) strength = 'Medium';
        
        const strengthEmoji = {
            'Weak': '🔴',
            'Medium': '🟡', 
            'Strong': '🟢',
            'Very Strong': '🔥'
        };
        
        const result = `🔐 ${font.bold(font.smallCaps('Password Generator'))}\n\n` +
                      `🔑 ${font.bold('Password')}: \`${password}\`\n` +
                      `📏 ${font.smallCaps('Length')}: ${length} characters\n` +
                      `🛡️ ${font.smallCaps('Type')}: ${description}\n` +
                      `💪 ${font.smallCaps('Strength')}: ${strengthEmoji[strength]} ${strength}\n\n` +
                      `⚠️ ${font.smallCaps('Simpan password dengan aman dan jangan bagikan ke orang lain')}!`;
        
        await reply(result);
    }
};
