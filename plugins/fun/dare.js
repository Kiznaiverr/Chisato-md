import fetch from 'node-fetch';

export default {
    command: 'dare',
    description: 'Get a random dare',
    category: 'fun',
    usage: '.dare',
    cooldown: 3,
    async execute(context) {
        const { reply } = context;
        try {
            const res = await fetch('https://api.nekoyama.my.id/api/kata-kata/dare');
            if (!res.ok) throw new Error('Gagal mengambil dare dari API!');
            const json = await res.json();
            if (json.status !== 'success' || !json.data) throw new Error('Dare tidak ditemukan!');
            const dare = json.data.dare;
            const dareText = `🔥 *DARE CHALLENGE*\n\n💪 ${dare}\n\n⚡ Are you brave enough to accept this challenge?`;
            await reply(dareText);
        } catch (e) {
            await reply('Gagal mengambil dare, coba lagi nanti.');
        }
    }
};
