import fs from 'fs/promises';
import path from 'path';
import font from '../../lib/font.js';

const GENSHIN_DATA_FILE = path.join(process.cwd(), 'lib', 'genshin.json');

// Fungsi untuk mengikuti redirect dan mendapatkan URL final gambar
async function resolveRedirectUrl(shortUrl) {
    try {
        const response = await fetch(shortUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        if (!response.ok) {
            console.log(`HTTP ${response.status} for ${shortUrl}`);
            return shortUrl; // Fallback ke URL asli
        }
        
        const contentType = response.headers.get('content-type');
        
        // Jika response adalah gambar langsung, return URL asli
        if (contentType && contentType.startsWith('image/')) {
            return shortUrl;
        }
        
        // Jika response adalah HTML, extract URL gambar
        if (contentType && contentType.includes('text/html')) {
            const html = await response.text();
            
            // Method 1: Cari URL dari meta refresh
            const refreshMatch = html.match(/meta\s+http-equiv=["']Refresh["']\s+content=["']0;\s*url=["']([^"']+)["']/i);
            if (refreshMatch) {
                const imageUrl = refreshMatch[1];
                
                // Verifikasi bahwa URL gambar valid
                try {
                    const imageResponse = await fetch(imageUrl, {
                        method: 'HEAD',
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        }
                    });
                    
                    if (imageResponse.ok) {
                        return imageUrl;
                    }
                } catch (error) {
                    console.log(`Error verifying extracted URL: ${error.message}`);
                }
            }
            
            // Method 2: Cari URL dari og:image (backup)
            const ogImageMatch = html.match(/meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
            if (ogImageMatch) {
                const imageUrl = ogImageMatch[1];
                
                try {
                    const imageResponse = await fetch(imageUrl, {
                        method: 'HEAD',
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        }
                    });
                    
                    if (imageResponse.ok) {
                        return imageUrl;
                    }
                } catch (error) {
                    console.log(`Error verifying og:image URL: ${error.message}`);
                }
            }
        }
        
        // Jika semua gagal, kembalikan URL asli
        return shortUrl;
        
    } catch (error) {
        console.log(`Error resolving redirect for ${shortUrl}: ${error.message}`);
        return shortUrl; // Fallback ke URL asli
    }
}

async function loadGenshinData() {
    try {
        const dataContent = await fs.readFile(GENSHIN_DATA_FILE, 'utf8');
        return JSON.parse(dataContent);
    } catch (error) {
        console.error('Error loading Genshin data:', error);
        throw error;
    }
}

function searchCharacterBuilds(characters, searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    
    if (characters[term]) {
        return { character: term, builds: characters[term] };
    }
    
    for (const [character, builds] of Object.entries(characters)) {
        if (character.includes(term) || term.includes(character)) {
            return { character, builds };
        }
    }
    
    return null;
}

function searchBuildType(builds, buildTerm) {
    const term = buildTerm.toLowerCase().trim();
    
    for (const build of builds) {
        const buildType = build.buildType.toLowerCase();
        if (buildType.includes(term) || term.includes(buildType.replace(/\s+/g, ''))) {
            return build;
        }
    }
    
    const termMap = {
        'melt': ['melt', 'reverse melt', 'c4 melt', 'c6 melt'],
        'freeze': ['freeze', 'mono cryo', 'c4 freeze', 'c6 freeze'],
        'support': ['support', 'off-field', 'shielder'],
        'dps': ['dps', 'on-field dps', 'driver'],
        'hyperbloom': ['hyperbloom', 'bloom'],
        'aggravate': ['aggravate', 'quicken', 'c4 aggravate', 'c6 aggravate'],
        'physical': ['physical'],
        'electro': ['electro'],
        'pyro': ['pyro'],
        'cryo': ['cryo'],
        'hydro': ['hydro'],
        'anemo': ['anemo'],
        'geo': ['geo'],
        'dendro': ['dendro'],
        'teams': ['teams', 'team'],
        'c4': ['c4', 'c4 melt', 'c4 freeze', 'c4 aggravate'],
        'c6': ['c6', 'c6 melt', 'c6 freeze', 'c6 aggravate'],
        'c2': ['c2'],
        'c1': ['c1'],
        'burgeon': ['burgeon'],
        'sunfire': ['sunfire'],
        'transformative': ['transformative'],
        'reverse': ['reverse melt'],
        'mono': ['mono'],
        'driver': ['driver'],
        'shielder': ['shielder'],
        'quickswap': ['quickswap']
    };
    
    for (const [key, variations] of Object.entries(termMap)) {
        if (variations.some(variation => term.includes(variation))) {
            for (const build of builds) {
                const buildType = build.buildType.toLowerCase();
                if (variations.some(variation => buildType.includes(variation))) {
                    return build;
                }
            }
        }
    }
    
    return null;
}

export default {
    command: 'buildgi',
    description: 'Get Genshin Impact character build infographics',
    category: 'fun',
    usage: '<character|list> [build_type]',
    cooldown: 5,
    async execute(context) {
        const { args, reply, sock, msg, react } = context;
        
        if (!args[0]) {
            return reply(`${font.smallCaps('siapa karakternya?')}\n\n${font.bold(font.smallCaps('usage'))}: ${font.smallCaps('buildgi')} <${font.smallCaps('character')}> <${font.smallCaps('build_type')}>\n\n${font.smallCaps('gunakan')} ${font.smallCaps('buildgi list')} ${font.smallCaps('untuk lihat character')}`);
        }
        
        if (args[0].toLowerCase() === 'list') {
            try {
                await react('🕔');
                
                const characters = await loadGenshinData();
                const characterList = Object.keys(characters).sort();
                
                if (characterList.length === 0) {
                    await react('❌');
                    return reply(`${font.bold(font.smallCaps('no data found'))}\n\n${font.smallCaps('no character data available')}`);
                }
                
                await react('✅');
                
                const characterNames = characterList.map(char => `${font.smallCaps(char)}`).join('\n');
                
                let response = `${font.bold(font.smallCaps('genshin impact characters'))}\n\n${characterNames}\n\n`;
                response += `${font.smallCaps(`total: ${characterList.length} characters`)}\n`;
                response += `${font.smallCaps('usage')}: ${font.smallCaps('buildgi')} <${font.smallCaps('character')}> [${font.smallCaps('build_type')}]`;
                
                await reply(response);
                return;
            } catch (error) {
                console.error('BuildGI List Error:', error);
                await react('❌');
                return reply(`${font.bold(font.smallCaps('error occurred'))}\n\n${font.smallCaps('failed to fetch character list')}`);
            }
        }
        
        const characterName = args[0].toLowerCase();
        const buildType = args.slice(1).join(' ').toLowerCase();
        
        try {
            await react('🕔');
            
            const characters = await loadGenshinData();
            
            const result = searchCharacterBuilds(characters, characterName);
            
            if (!result) {
                await react('❌');
                return reply(`${font.bold(font.smallCaps('character not found'))}\n\n${font.smallCaps('available characters')}:\n${Object.keys(characters).map(char => `${font.smallCaps(char)}`).slice(0, 10).join('\n')}\n${Object.keys(characters).length > 10 ? `\n...${font.smallCaps(`and ${Object.keys(characters).length - 10} more`)}\n\n${font.smallCaps('use')} ${font.smallCaps('buildgi list')} ${font.smallCaps('to see all characters')}` : ''}`);
            }
            
            const { character, builds } = result;
            
            if (buildType) {
                const specificBuild = searchBuildType(builds, buildType);
                
                if (!specificBuild) {
                    await react('❌');
                    const availableBuilds = builds.map((build, index) => `${index + 1}. ${font.smallCaps(build.buildType)}`).join('\n');
                    return reply(`${font.bold(font.smallCaps('build type not found'))}\n\n${font.smallCaps('available builds for')} ${font.bold(font.smallCaps(character))}:\n${availableBuilds}`);
                }
                
                const caption = `${font.smallCaps('character')}: ${font.smallCaps(character)}\n\n${font.bold(font.smallCaps('genshin impact guide'))}\n${font.smallCaps('source: keqing mains')}`;
                
                // Resolve redirect URL sebelum mengirim gambar
                const resolvedUrl = await resolveRedirectUrl(specificBuild.url);
                
                await sock.sendMessage(msg.key.remoteJid, {
                    image: { url: resolvedUrl },
                    caption: caption
                }, { quoted: msg });
                
                await react('✅');
                return;
            }
            
            if (builds.length === 1) {
                const build = builds[0];
                const caption = `${font.smallCaps('character')}: ${font.smallCaps(character)}\n\n${font.bold(font.smallCaps('genshin impact guide'))}\n${font.smallCaps('source: keqing mains')}`;
                
                // Resolve redirect URL sebelum mengirim gambar
                const resolvedUrl = await resolveRedirectUrl(build.url);
                
                await sock.sendMessage(msg.key.remoteJid, {
                    image: { url: resolvedUrl },
                    caption: caption
                }, { quoted: msg });
                
                await react('✅');
                return;
            }
            
            await react('✅');
            const buildList = builds.map((build, index) => `${index + 1}. ${font.smallCaps(build.buildType)}`).join('\n');
            
            return reply(`${font.bold(font.smallCaps('multiple builds available'))}\n\n${font.smallCaps('character')}: ${font.smallCaps(character)}\n\n${font.smallCaps('available builds')}:\n${buildList}\n\n${font.smallCaps('usage')}: ${font.smallCaps('buildgi')} ${font.smallCaps(character)} <${font.smallCaps('build_type')}>\n${font.smallCaps('example')}: ${font.smallCaps('buildgi')} ${font.smallCaps(character)} ${font.smallCaps(builds[0].buildType.toLowerCase())}`);
            
        } catch (error) {
            console.error('BuildGI Error:', error); 
            await react('❌');
            
            return reply(`${font.bold(font.smallCaps('error occurred'))}\n\n${font.smallCaps('failed to load character data. please try again later.')}`);
        }
    }
};