import fetch from 'node-fetch';
import font from '../../lib/font.js';

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
            if (!res.ok) throw new Error(`${font.smallCaps('Gagal mengambil truth dari API')}!`)
            const json = await res.json()
            if (json.status !== 'success' || !json.data) throw new Error(`${font.smallCaps('Truth tidak ditemukan')}!`)
            const truth = json.data.truth || json.data.dare || '-'
            const truthText = `
🎯 ${font.bold(font.smallCaps('TRUTH QUESTION'))}

❓ ${truth}

💭 ${font.smallCaps('Answer honestly and have fun')}!
            `.trim()
            
            await reply(truthText)
        } catch (e) {
            await reply(`${font.smallCaps('Gagal mengambil truth, coba lagi nanti')}.`)
        }
    }
}
