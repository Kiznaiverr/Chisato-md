import fetch from 'node-fetch';

export default {
    command: 'truth',
    description: 'Get a random truth',
    category: 'fun',
    usage: '',
    cooldown: 3,
    async execute(context) {
        const { reply } = context
        try {
            const res = await fetch('https://api.nekoyama.my.id/api/kata-kata/truth')
            if (!res.ok) throw new Error('Gagal mengambil truth dari API!')
            const json = await res.json()
            if (json.status !== 'success' || !json.data) throw new Error('Truth tidak ditemukan!')
            const truth = json.data.truth || json.data.dare || '-'
            const truthText = `
🎯 *TRUTH QUESTION*

❓ ${truth}

💭 Answer honestly and have fun!
            `.trim()
            
            await reply(truthText)
        } catch (e) {
            await reply('Gagal mengambil truth, coba lagi nanti.')
        }
    }
}
