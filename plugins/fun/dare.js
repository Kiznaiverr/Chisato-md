import fetch from 'node-fetch';
import font from '../../lib/font.js';

export default {
    command: 'dare',
    description: 'Get a random dare',
    category: 'fun',
    usage: '',
    cooldown: 3,
    async execute(context) {
        const { reply } = context;
        try {
            const res = await fetch('https://api.nekoyama.my.id/api/kata-kata/dare');
            if (!res.ok) throw new Error(`${font.smallCaps('Gagal mengambil dare dari API')}!`);
            const json = await res.json();
            if (json.status !== 'success' || !json.data) throw new Error(`${font.smallCaps('Dare tidak ditemukan')}!`);
            const dare = json.data.dare;
            const dareText = `🔥 ${font.bold(font.smallCaps('DARE CHALLENGE'))}\n\n💪 ${dare}\n\n⚡ ${font.smallCaps('Are you brave enough to accept this challenge')}?`;
            await reply(dareText);
        } catch (e) {
            await reply(`${font.smallCaps('Gagal mengambil dare, coba lagi nanti')}.`);
        }
    }
};
