import { fetchGenshinInfographics, searchCharacterBuilds, searchBuildType } from '../../lib/scraper/genshinInfographic.js';
import font from '../../lib/font.js';

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
                
                const characters = await fetchGenshinInfographics();
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
            
            const characters = await fetchGenshinInfographics();
            
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
                
                await sock.sendMessage(msg.key.remoteJid, {
                    image: { url: specificBuild.url },
                    caption: caption
                }, { quoted: msg });
                
                await react('✅');
                return;
            }
            
            if (builds.length === 1) {
                const build = builds[0];
                const caption = `${font.smallCaps('character')}: ${font.smallCaps(character)}\n\n${font.bold(font.smallCaps('genshin impact guide'))}\n${font.smallCaps('source: keqing mains')}`;
                
                await sock.sendMessage(msg.key.remoteJid, {
                    image: { url: build.url },
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
            
            if (error.message.includes('HTTP')) {
                return reply(`${font.bold(font.smallCaps('network error'))}\n\n${font.smallCaps('failed to fetch build data from github. please try again later.')}`);
            }
            
            if (error.message.includes('timeout')) {
                return reply(`${font.bold(font.smallCaps('request timeout'))}\n\n${font.smallCaps('github is taking too long to respond. please try again later.')}`);
            }
            
            return reply(`${font.bold(font.smallCaps('error occurred'))}\n\n${font.smallCaps('failed to fetch build data. please try again later.')}`);
        }
    }
};