export default {
    command: 'dare',
    description: 'Get a random dare challenge',
    category: 'fun',
    usage: '.dare',
    cooldown: 3,
    async execute(context) {
        const { reply } = context
        
        const dareChallenges = [
            "Sing your favorite song out loud",
            "Do 10 push-ups right now",
            "Call a random contact and say 'I love you'",
            "Post an embarrassing photo on your social media",
            "Eat a spoonful of a condiment",
            "Do your best impression of a celebrity",
            "Dance for 30 seconds without music",
            "Text your crush and tell them how you feel",
            "Let someone else post a status on your social media",
            "Do a cartwheel (or attempt one)",
            "Speak in an accent for the next 10 minutes",
            "Go outside and yell 'I'm awesome!' 5 times",
            "Eat something without using your hands",
            "Do the chicken dance",
            "Call your mom and tell her you love her",
            "Take a selfie making a funny face and send it to your friends",
            "Do 20 jumping jacks",
            "Pretend to be a robot for 2 minutes",
            "Let someone draw on your face with a washable marker",
            "Do your best animal impression"
        ]
        
        const randomDare = dareChallenges[Math.floor(Math.random() * dareChallenges.length)]
        
        const dareText = `
🔥 *DARE CHALLENGE*

💪 ${randomDare}

⚡ Are you brave enough to accept this challenge?
        `.trim()
        
        await reply(dareText)
    }
}
