import font from '../../lib/font.js';

export default {
    command: 'textcount',
    description: 'Count characters, words, and paragraphs in text',
    category: 'tools',
    usage: '<text>',
    cooldown: 2,
    async execute(context) {
        const { args, reply } = context;
        
        if (!args[0]) {
            return reply(`${font.smallCaps('Masukkan text yang ingin dihitung')}\n\n${font.bold('Contoh')}: .textcount Hello world, how are you today?`);
        }
        
        const text = args.join(' ');
        
        // Count characters
        const totalChars = text.length;
        const charsNoSpaces = text.replace(/\s/g, '').length;
        
        // Count words
        const words = text.trim().split(/\s+/).filter(word => word.length > 0);
        const wordCount = words.length;
        
        // Count sentences (basic - split by . ! ?)
        const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
        const sentenceCount = sentences.length;
        
        // Count paragraphs (split by double newline)
        const paragraphs = text.split(/\n\s*\n/).filter(para => para.trim().length > 0);
        const paragraphCount = paragraphs.length;
        
        // Count lines
        const lines = text.split('\n');
        const lineCount = lines.length;
        
        // Average word length
        const avgWordLength = wordCount > 0 ? (charsNoSpaces / wordCount).toFixed(1) : 0;
        
        // Reading time estimate (average 200 words per minute)
        const readingTimeMinutes = Math.ceil(wordCount / 200);
        const readingTime = readingTimeMinutes === 1 ? '1 menit' : `${readingTimeMinutes} menit`;
        
        const result = `📊 ${font.bold(font.smallCaps('Text Counter'))}\n\n` +
                      `📝 ${font.smallCaps('Sample')}: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}\n\n` +
                      `🔤 ${font.bold('Characters')}: ${totalChars.toLocaleString()}\n` +
                      `📋 ${font.bold('Characters (no spaces)')}: ${charsNoSpaces.toLocaleString()}\n` +
                      `📝 ${font.bold('Words')}: ${wordCount.toLocaleString()}\n` +
                      `📄 ${font.bold('Sentences')}: ${sentenceCount.toLocaleString()}\n` +
                      `📑 ${font.bold('Paragraphs')}: ${paragraphCount.toLocaleString()}\n` +
                      `📏 ${font.bold('Lines')}: ${lineCount.toLocaleString()}\n` +
                      `📐 ${font.bold('Avg word length')}: ${avgWordLength} chars\n` +
                      `⏱️ ${font.bold('Reading time')}: ~${readingTime}`;
        
        await reply(result);
    }
};
