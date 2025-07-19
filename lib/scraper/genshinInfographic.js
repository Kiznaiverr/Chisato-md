import fetch from 'node-fetch';
import yaml from 'js-yaml';
import fs from 'fs/promises';
import path from 'path';
import cron from 'node-cron';

const CACHE_FILE = './cache/genshin-infographics.json';
const CACHE_DURATION = 24 * 60 * 60 * 1000;

let cachedData = null;
let cacheTimestamp = null;

export async function initializeGenshinCache() {
    try {
        await fs.mkdir('./cache', { recursive: true });
        
        await loadCache();
        
        cron.schedule('0 0 * * *', async () => {
            console.log('🕛 Refreshing Genshin infographics cache at 00:00...');
            try {
                await refreshCache();
                console.log('✅ Genshin infographics cache refreshed successfully');
            } catch (error) {
                console.error('❌ Failed to refresh Genshin infographics cache:', error);
            }
        }, {
            timezone: 'Asia/Jakarta'
        });
        
        console.log('🎮 Genshin infographics cache system initialized');
    } catch (error) {
        console.error('Failed to initialize Genshin cache:', error);
    }
}

async function loadCache() {
    try {
        const cacheExists = await fs.access(CACHE_FILE).then(() => true).catch(() => false);
        if (!cacheExists) return;
        
        const cacheContent = await fs.readFile(CACHE_FILE, 'utf8');
        const cache = JSON.parse(cacheContent);
        
        if (cache.timestamp && cache.data) {
            cacheTimestamp = cache.timestamp;
            cachedData = cache.data;
            
            const age = Date.now() - cacheTimestamp;
            console.log(`📊 Loaded Genshin infographics cache (${Math.round(age / (1000 * 60 * 60))} hours old)`);
        }
    } catch (error) {
        console.error('Error loading Genshin cache:', error);
    }
}

async function saveCache(data) {
    try {
        const cache = {
            timestamp: Date.now(),
            data: data
        };
        
        await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
        cachedData = data;
        cacheTimestamp = cache.timestamp;
        
        console.log('💾 Genshin infographics cache saved');
    } catch (error) {
        console.error('Error saving Genshin cache:', error);
    }
}

function isCacheValid() {
    if (!cachedData || !cacheTimestamp) return false;
    
    const age = Date.now() - cacheTimestamp;
    return age < CACHE_DURATION;
}

export async function refreshCache() {
    console.log('🔄 Fetching fresh Genshin infographics data...');
    const data = await fetchFromGitHub();
    await saveCache(data);
    return data;
}

export async function fetchGenshinInfographics() {
    if (isCacheValid()) {
        console.log('📋 Using cached Genshin infographics data');
        return cachedData;
    }
    
    console.log('🌐 Cache expired or invalid, fetching fresh data...');
    try {
        const data = await fetchFromGitHub();
        await saveCache(data);
        return data;
    } catch (error) {
        if (cachedData) {
            console.log('⚠️ Fetch failed, using stale cache as fallback');
            return cachedData;
        }
        throw error;
    }
}

async function fetchFromGitHub() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/KQM-git/keqing-lite-interactions/main/constants.yaml', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Node.js Chisato Bot)'
            },
            timeout: 10000
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const yamlContent = await response.text();
        const data = yaml.load(yamlContent);
        
        if (!data.INFOGRAPHICS) {
            throw new Error('INFOGRAPHICS section not found in YAML');
        }

        return parseInfographics(data.INFOGRAPHICS);
    } catch (error) {
        console.error('Error fetching Genshin infographics:', error);
        throw error;
    }
}

function parseInfographics(infographics) {
    const characters = {};
    
    for (const [key, url] of Object.entries(infographics)) {
        if (key.includes('DENDRO_') || key.includes('MATERIALS_') || key.includes('PITY_') || 
            key.includes('WOOD_') || key === 'REACTIONS') {
            continue;
        }
        
        const parts = key.split('_');
        if (parts.length < 2) continue;
        
        const buildNumber = parts.pop();
        const characterName = parts.join('_').toLowerCase();
        
        if (!characters[characterName]) {
            characters[characterName] = [];
        }
        
        let buildType = `${buildNumber}`;
        
        const urlLower = url.toLowerCase();
        const keyLower = key.toLowerCase();
        
        if (keyLower.includes('c6')) {
            if (urlLower.includes('melt') || keyLower.includes('melt')) {
                buildType = 'C6 Melt';
            } else if (urlLower.includes('freeze') || keyLower.includes('freeze')) {
                buildType = 'C6 Freeze';
            } else if (urlLower.includes('aggravate') || keyLower.includes('aggravate')) {
                buildType = 'C6 Aggravate';
            } else {
                buildType = 'C6';
            }
        } else if (keyLower.includes('c4')) {
            if (urlLower.includes('melt') || keyLower.includes('melt')) {
                buildType = 'C4 Melt';
            } else if (urlLower.includes('freeze') || keyLower.includes('freeze')) {
                buildType = 'C4 Freeze';
            } else if (urlLower.includes('aggravate') || keyLower.includes('aggravate')) {
                buildType = 'C4 Aggravate';
            } else {
                buildType = 'C4';
            }
        } else if (keyLower.includes('c2')) {
            buildType = 'C2';
        } else if (keyLower.includes('c1')) {
            buildType = 'C1';
        }
        else if (urlLower.includes('reverse') && urlLower.includes('melt')) {
            buildType = 'Reverse Melt';
        } else if (urlLower.includes('melt') || keyLower.includes('melt')) {
            buildType = 'Melt';
        } else if (urlLower.includes('freeze') || keyLower.includes('freeze')) {
            buildType = 'Freeze';
        } else if (urlLower.includes('hyperbloom') || keyLower.includes('hyperbloom')) {
            buildType = 'Hyperbloom';
        } else if (urlLower.includes('burgeon') || keyLower.includes('burgeon')) {
            buildType = 'Burgeon';
        } else if (urlLower.includes('aggravate') || keyLower.includes('aggravate')) {
            buildType = 'Aggravate';
        } else if (urlLower.includes('quicken') || keyLower.includes('quicken')) {
            buildType = 'Quicken';
        } else if (urlLower.includes('bloom') || keyLower.includes('bloom')) {
            buildType = 'Bloom';
        } else if (urlLower.includes('sunfire') || keyLower.includes('sunfire')) {
            buildType = 'Sunfire';
        } else if (urlLower.includes('transformative')) {
            buildType = 'Transformative';
        }
        else if (urlLower.includes('on-field') || urlLower.includes('onfield')) {
            buildType = 'On-Field DPS';
        } else if (urlLower.includes('off-field') || urlLower.includes('offfield')) {
            buildType = 'Off-Field';
        } else if (urlLower.includes('support') || keyLower.includes('support')) {
            buildType = 'Support';
        } else if (urlLower.includes('driver') || keyLower.includes('driver')) {
            buildType = 'Driver';
        } else if (urlLower.includes('shielder') || keyLower.includes('shielder')) {
            buildType = 'Shielder';
        }
        else if (urlLower.includes('physical') || keyLower.includes('physical')) {
            buildType = 'Physical';
        }
        else if (urlLower.includes('electro')) {
            buildType = 'Electro';
        } else if (urlLower.includes('pyro')) {
            buildType = 'Pyro';
        } else if (urlLower.includes('cryo')) {
            buildType = 'Cryo';
        } else if (urlLower.includes('hydro')) {
            buildType = 'Hydro';
        } else if (urlLower.includes('anemo')) {
            buildType = 'Anemo';
        } else if (urlLower.includes('geo')) {
            buildType = 'Geo';
        } else if (urlLower.includes('dendro')) {
            buildType = 'Dendro';
        }
        else if (urlLower.includes('teams') || keyLower.includes('teams')) {
            buildType = 'Teams';
        } else if (urlLower.includes('mono') || keyLower.includes('mono')) {
            buildType = 'Mono';
        }
        else if (urlLower.includes('dps') || keyLower.includes('dps')) {
            buildType = 'DPS';
        }
        
        characters[characterName].push({
            key: key,
            url: url,
            buildType: buildType,
            buildNumber: parseInt(buildNumber)
        });
    }
    
    for (const character in characters) {
        characters[character].sort((a, b) => a.buildNumber - b.buildNumber);
    }
    
    return characters;
}

export function searchCharacterBuilds(characters, searchTerm) {
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

export function searchBuildType(builds, buildTerm) {
    const term = buildTerm.toLowerCase().trim();
    
    // Direct match first
    for (const build of builds) {
        const buildType = build.buildType.toLowerCase();
        if (buildType.includes(term) || term.includes(buildType.replace(/\s+/g, ''))) {
            return build;
        }
    }
    
    // More flexible matching for common terms
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
        'shielder': ['shielder']
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
