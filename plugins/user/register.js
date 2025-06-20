import font from '../../lib/font.js'

export default {
    command: 'register',
    aliases: ['reg', 'daftar'],
    category: 'user',
    description: 'Register as bot user',
    usage: '<name> <age>',
    cooldown: 5,
    
    async execute({ reply, args, db, sender, react }) {
        const user = db.getUser(sender)
        
        if (user.registered) {
            return reply(`❌ ${font.smallCaps('You are already registered')}!\n\n📋 ${font.smallCaps('Your Info')}:\n• ${font.smallCaps('Name')}: ${font.smallCaps(user.name)}\n• ${font.smallCaps('Age')}: ${user.age} ${font.smallCaps('years')}\n• ${font.smallCaps('Registered')}: ${new Date(user.regTime).toLocaleDateString('id-ID')}\n\n💡 ${font.smallCaps('Use .profile to see full profile')}`)
        }
        
        if (!args[0] || !args[1]) {
            return reply(`❌ ${font.smallCaps('Please provide your name and age')}!\n\n💡 ${font.smallCaps('Usage')}:\n.register <${font.smallCaps('name')}> <${font.smallCaps('age')}>\n\n${font.smallCaps('Example')}: .register ${font.smallCaps('John')} 20`)
        }
        
        const name = args[0]
        const age = parseInt(args[1])
        
        if (isNaN(age) || age < 10 || age > 100) {
            return reply(`❌ ${font.smallCaps('Please enter a valid age between 10 and 100')}!`)
        }
        
        if (name.length < 2 || name.length > 25) {
            return reply(`❌ ${font.smallCaps('Name must be between 2 and 25 characters')}!`)
        }
        
        try {
            await react('📝')
            
            // Register user
            user.registered = true
            user.name = name
            user.age = age
            user.regTime = Date.now()
            user.exp = user.exp || 0
            user.level = user.level || 1
            user.limit = user.limit || db.getSetting('dailyLimit') || 10
            
            db.saveUsers()
            
            await react('✅')
            await reply(`🎉 ${font.bold(font.smallCaps('REGISTRATION SUCCESSFUL'))}!

╭─「 📋 ${font.smallCaps('Your Profile')} 」
├ 👤 ${font.smallCaps('Name')}: ${font.smallCaps(name)}
├ 🎂 ${font.smallCaps('Age')}: ${age} ${font.smallCaps('years')}
├ 📱 ${font.smallCaps('Number')}: ${sender.split('@')[0]}
├ 📅 ${font.smallCaps('Registered')}: ${new Date().toLocaleDateString('id-ID')}
├ ⭐ ${font.smallCaps('Level')}: ${user.level}
├ 🎫 ${font.smallCaps('Daily Limit')}: ${user.limit}
╰───────────────

🎁 ${font.bold(font.smallCaps('Welcome Benefits'))}:
• ${font.smallCaps('Access to all user commands')}
• ${font.smallCaps('Daily usage limits')}
• ${font.smallCaps('Experience point system')}
• ${font.smallCaps('Profile tracking')}

💡 ${font.smallCaps('Use .profile to view your complete profile anytime')}!

🌟 ${font.smallCaps('Welcome to')} ${db.getSetting('botName') || 'Chisato-MD'}!`)
            
        } catch (error) {
            console.error('Registration error:', error)
            await react('❌')
            await reply(`❌ ${font.smallCaps('Registration failed. Please try again')}.`)
        }
    }
}
