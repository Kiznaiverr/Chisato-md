import crypto from 'crypto';
import font from '../../lib/font.js';

export default {
    command: 'color',
    description: 'Generate random colors or convert color formats',
    category: 'tools',
    usage: '[hex_color]',
    cooldown: 2,
    async execute(context) {
        const { args, reply } = context;
        
        if (!args[0]) {
            // Generate random colors
            const colors = [];
            for (let i = 0; i < 5; i++) {
                const hex = '#' + crypto.randomBytes(3).toString('hex');
                const rgb = hexToRgb(hex);
                const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                
                colors.push({
                    hex,
                    rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
                    hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
                });
            }
            
            let result = `🎨 ${font.bold(font.smallCaps('Random Color Palette'))}\n\n`;
            colors.forEach((color, index) => {
                result += `${index + 1}. ${font.bold(color.hex.toUpperCase())}\n`;
                result += `   RGB: ${color.rgb}\n`;
                result += `   HSL: ${color.hsl}\n\n`;
            });
            
            result += `💡 ${font.smallCaps('Gunakan .color #hex untuk konversi format tertentu')}`;
            
            return reply(result);
        }
        
        let hex = args[0];
        
        // Validate and format hex color
        if (!hex.startsWith('#')) {
            hex = '#' + hex;
        }
        
        if (!/^#[0-9A-F]{6}$/i.test(hex)) {
            return reply(`${font.smallCaps('Format hex tidak valid. Gunakan format #RRGGBB')}\n\n${font.bold('Contoh')}: .color #FF5733`);
        }
        
        try {
            const rgb = hexToRgb(hex);
            const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
            
            // Generate complementary color
            const complementaryHex = '#' + ((parseInt(hex.slice(1), 16) ^ 0xFFFFFF).toString(16).padStart(6, '0'));
            
            // Generate analogous colors
            const analogous1 = adjustHue(hsl.h + 30, hsl.s, hsl.l);
            const analogous2 = adjustHue(hsl.h - 30, hsl.s, hsl.l);
            
            const result = `🎨 ${font.bold(font.smallCaps('Color Converter'))}\n\n` +
                          `🔷 ${font.bold('Original')}: ${hex.toUpperCase()}\n` +
                          `📊 RGB: rgb(${rgb.r}, ${rgb.g}, ${rgb.b})\n` +
                          `🌈 HSL: hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)\n\n` +
                          `🔄 ${font.bold('Complementary')}: ${complementaryHex.toUpperCase()}\n` +
                          `🔀 ${font.bold('Analogous 1')}: ${analogous1}\n` +
                          `🔀 ${font.bold('Analogous 2')}: ${analogous2}\n\n` +
                          `💡 ${font.smallCaps('Gunakan .color tanpa parameter untuk palette random')}`;
            
            await reply(result);
        } catch (e) {
            await reply(`${font.smallCaps('Gagal mengkonversi warna')}.`);
        }
    }
};

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

function adjustHue(h, s, l) {
    h = ((h % 360) + 360) % 360;
    const hsl = `hsl(${h}, ${s}%, ${l}%)`;
    
    // Convert back to hex for display
    const c = (1 - Math.abs(2 * l/100 - 1)) * s/100;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l/100 - c/2;
    
    let r, g, b;
    if (h >= 0 && h < 60) {
        r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
        r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
        r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
        r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
        r = x; g = 0; b = c;
    } else {
        r = c; g = 0; b = x;
    }
    
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
    
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}
