import crypto from 'crypto';
import font from '../../lib/font.js';

export default {
    command: 'rps',
    description: 'Play Rock Paper Scissors against the bot',
    category: 'fun',
    usage: '<rock/paper/scissors>',
    cooldown: 3,
    async execute(context) {
        const { args, reply, m } = context;
        
        if (!args[0]) {
            return reply(`${font.smallCaps('Pilih gerakan kamu!')}\n\n${font.bold('Contoh')}: .rps rock\n\n🪨 rock\n📄 paper\n✂️ scissors`);
        }
        
        const playerChoice = args[0].toLowerCase();
        const validChoices = ['rock', 'paper', 'scissors', 'batu', 'kertas', 'gunting'];
        
        // Map Indonesian to English
        const choiceMap = {
            'batu': 'rock',
            'kertas': 'paper', 
            'gunting': 'scissors'
        };
        
        let normalizedChoice = choiceMap[playerChoice] || playerChoice;
        
        if (!validChoices.includes(playerChoice)) {
            return reply(`${font.smallCaps('Pilihan tidak valid!')}\n\n${font.bold('Pilihan yang tersedia')}:\n🪨 rock/batu\n📄 paper/kertas\n✂️ scissors/gunting`);
        }
        
        // Bot choice
        const choices = ['rock', 'paper', 'scissors'];
        const botChoice = choices[crypto.randomInt(0, 3)];
        
        // Determine winner
        let result;
        let resultEmoji;
        let resultText;
        
        if (normalizedChoice === botChoice) {
            result = 'tie';
            resultEmoji = '🤝';
            resultText = 'Seri!';
        } else if (
            (normalizedChoice === 'rock' && botChoice === 'scissors') ||
            (normalizedChoice === 'paper' && botChoice === 'rock') ||
            (normalizedChoice === 'scissors' && botChoice === 'paper')
        ) {
            result = 'win';
            resultEmoji = '🎉';
            resultText = 'Kamu Menang!';
        } else {
            result = 'lose';
            resultEmoji = '😔';
            resultText = 'Kamu Kalah!';
        }
        
        // Choice emojis
        const emojis = {
            'rock': '🪨',
            'paper': '📄',
            'scissors': '✂️'
        };
        
        // Choice names in Indonesian
        const names = {
            'rock': 'Batu',
            'paper': 'Kertas',
            'scissors': 'Gunting'
        };
        
        // Battle explanation
        const explanations = {
            'rock-scissors': 'Batu menghancurkan Gunting',
            'paper-rock': 'Kertas membungkus Batu',
            'scissors-paper': 'Gunting memotong Kertas',
            'scissors-rock': 'Batu menghancurkan Gunting',
            'rock-paper': 'Kertas membungkus Batu',
            'paper-scissors': 'Gunting memotong Kertas'
        };
        
        let explanation = '';
        if (result !== 'tie') {
            const key = result === 'win' ? `${normalizedChoice}-${botChoice}` : `${botChoice}-${normalizedChoice}`;
            explanation = `\n💭 ${explanations[key]}`;
        }
        
        const resultMessage = `🎮 ${font.bold(font.smallCaps('Rock Paper Scissors'))}\n\n` +
                             `👤 ${font.smallCaps('Kamu')}: ${emojis[normalizedChoice]} ${names[normalizedChoice]}\n` +
                             `🤖 ${font.smallCaps('Bot')}: ${emojis[botChoice]} ${names[botChoice]}\n\n` +
                             `${resultEmoji} ${font.bold(resultText)}${explanation}\n\n` +
                             `🎯 ${font.smallCaps('Main lagi')}: .rps <pilihan>`;
        
        await reply(resultMessage);
    }
};
