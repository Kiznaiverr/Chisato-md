import font from '../../lib/font.js';

export default {
    command: 'json',
    description: 'Format and validate JSON',
    category: 'tools',
    usage: '<json_string>',
    cooldown: 2,
    async execute(context) {
        const { args, reply } = context;
        
        if (!args[0]) {
            return reply(`${font.smallCaps('Masukkan JSON string yang ingin diformat')}\n\n${font.bold('Contoh')}: .json {"name":"John","age":30}`);
        }
        
        const jsonString = args.join(' ');
        
        try {
            // Parse JSON to validate
            const parsed = JSON.parse(jsonString);
            
            // Format with proper indentation
            const formatted = JSON.stringify(parsed, null, 2);
            
            // Count properties if it's an object
            let propertyCount = 0;
            if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
                propertyCount = Object.keys(parsed).length;
            }
            
            // Count array items if it's an array
            let arrayLength = 0;
            if (Array.isArray(parsed)) {
                arrayLength = parsed.length;
            }
            
            // Determine type
            let type = typeof parsed;
            if (Array.isArray(parsed)) type = 'array';
            if (parsed === null) type = 'null';
            
            let stats = '';
            if (type === 'object') {
                stats = `📊 ${font.smallCaps('Properties')}: ${propertyCount}\n`;
            } else if (type === 'array') {
                stats = `📊 ${font.smallCaps('Items')}: ${arrayLength}\n`;
            }
            
            const result = `✅ ${font.bold(font.smallCaps('JSON Formatter'))}\n\n` +
                          `🔧 ${font.smallCaps('Type')}: ${type}\n` +
                          stats +
                          `📏 ${font.smallCaps('Size')}: ${formatted.length} characters\n\n` +
                          `📋 ${font.bold('Formatted JSON')}:\n\`\`\`json\n${formatted}\n\`\`\``;
            
            await reply(result);
        } catch (e) {
            const errorMessage = e.message;
            const result = `❌ ${font.bold(font.smallCaps('JSON Validation Failed'))}\n\n` +
                          `🚫 ${font.smallCaps('Error')}: ${errorMessage}\n\n` +
                          `💡 ${font.smallCaps('Tips')}:\n` +
                          `• Pastikan menggunakan double quotes (")\n` +
                          `• Pastikan tidak ada trailing comma\n` +
                          `• Pastikan bracket/brace tertutup dengan benar`;
            
            await reply(result);
        }
    }
};
