export default {
    command: 'truth',
    description: 'Get a random truth',
    category: 'fun',
    usage: '.truth',
    cooldown: 3,
    async execute(context) {
        const { reply } = context
        
        const truthQuestions = [
            "What's the most embarrassing thing you've ever done?",
            "Have you ever lied to your best friend?",
            "What's your biggest fear?",
            "What's the weirdest dream you've ever had?",
            "Have you ever had a crush on a teacher?",
            "What's the most childish thing you still do?",
            "What's your most embarrassing moment in public?",
            "Have you ever pretended to be sick to avoid something?",
            "What's the worst thing you've ever said to someone?",
            "What's your biggest secret?",
            "Have you ever cheated on a test?",
            "What's the most trouble you've ever gotten into?",
            "What's your biggest regret?",
            "Have you ever stolen anything?",
            "What's the meanest thing you've ever done?",
            "What's your most embarrassing habit?",
            "Have you ever had a paranormal experience?",
            "What's the worst lie you've ever told?",
            "What's your biggest weakness?",
            "Have you ever broken someone's heart?"
        ]
        
        const randomTruth = truthQuestions[Math.floor(Math.random() * truthQuestions.length)]
        
        const truthText = `
🎯 *TRUTH QUESTION*

❓ ${randomTruth}

💭 Answer honestly and have fun!
        `.trim()
        
        await reply(truthText)
    }
}
