# 🤖 Chisato MD - WhatsApp Bot

![Bot Status](https://img.shields.io/badge/Status-Active-brightgreen)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)
![Baileys](https://img.shields.io/badge/Baileys-6.7.18-blue)

A modern WhatsApp bot built with Baileys library, featuring a modular plugin system and local JSON database.

## 📑 Table of Contents

- [Features](#-features)
- [Requirements](#-requirements)
- [Quick Start](#-quick-start)
- [Configuration](#️-configuration)
- [Commands](#-commands)
- [Plugin System](#-plugin-system)
- [Database Structure](#-database-structure)
- [Plugin Development](#-plugin-development)
- [Security](#️-security)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

## 🌟 Features

- ✅ **Multi-device support** - Works with WhatsApp Web API
- 🔌 **Modular plugin system** - Easy to extend and customize
- 📁 **Organized plugin structure** - Plugins grouped by category
- 💾 **Local JSON database** - No external database required
- 👥 **Group management** - Admin commands and settings
- 👤 **User profiles & levels** - Experience and progression system
- 🎯 **Limit system** - Daily usage limits with premium support
- 🎫 **Premium user support** - Unlimited access for premium users
- 🔒 **Owner-only commands** - Secure administrative functions
- ⏰ **Command cooldowns** - Prevent spam and abuse
- 🎨 **Beautiful responses** - Well-formatted command outputs
- 🚀 **Auto-response system** - Automatic greetings and reactions
- 🛡️ **Security features** - Ban system, input validation, error handling

## 📋 Requirements

Before running the bot, make sure you have:

- ✅ **Node.js 18 or higher** installed
- ✅ **NPM or Yarn** package manager
- ✅ **WhatsApp account** for the bot
- ✅ **Basic terminal knowledge**

## 🚀 Quick Start

### 1. Installation

```bash
# Clone the repository
git clone <repository-url>
cd chisato-md

# Install dependencies
npm install
```

### 2. Start the Bot

```bash
npm start
```

### 3. Connect WhatsApp

1. **Open WhatsApp** on your phone
2. Go to **Settings > Linked Devices**
3. Tap **"Link a Device"**
4. **Scan the QR code** displayed in terminal

### 4. Configure Bot

After first run, edit `database/settings.json`:

```json
{
  "prefix": ".",
  "botName": "Chisato MD",
  "owner": "6281234567890",
  "timezone": "Asia/Jakarta"
}
```

**Important:** Replace the owner number with your WhatsApp number (without + or spaces)

## ⚙️ Configuration

### Setting Owner Number

1. After first run, check `database/settings.json`
2. Replace `""` in `owner` field with your WhatsApp number
3. Format: `"6281234567890"` (country code + number, no + or spaces)
4. Restart the bot

### Customizing Settings

- **Prefix**: Change command prefix (default: `.`)
- **Bot Name**: Customize bot name in responses
- **Timezone**: Set your local timezone

### Environment Variables (Optional)

Create `.env` file for sensitive data:

```env
OWNER_NUMBER=6281234567890
API_KEY=your-api-key
```

## 📱 Commands

### 🏠 General Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `.menu` | Show all commands | `.menu` |
| `.ping` | Check bot response time | `.ping` |
| `.info` | Show bot information | `.info` |
| `.owner` | Show owner contact | `.owner` |

### 👤 User Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `.profile` | Show your profile | `.profile` |
| `.register` | Register to bot | `.register name.age` |
| `.limit` | Check your daily limit | `.limit` |

### 👥 Group Commands (Admin Only)

| Command | Description | Usage |
|---------|-------------|-------|
| `.group` | Group settings menu | `.group` |
| `.kick` | Remove member | `.kick @user` |
| `.promote` | Make user admin | `.promote @user` |
| `.demote` | Remove admin | `.demote @user` |

### 🎲 Fun Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `.quote` | Random inspirational quote | `.quote` |
| `.truth` | Random truth question | `.truth` |
| `.dare` | Random dare challenge | `.dare` |

### 🔍 Search Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `.google` | Search on Google | `.google query` |

### 🛠️ Owner Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `.eval` | Execute JavaScript code | `.eval code` |
| `.ban` | Ban user from bot | `.ban @user` |
| `.unban` | Unban user | `.unban @user` |

## 🔌 Plugin System

### Plugin Structure

Plugins are organized in categorized folders:

```
plugins/
├── general/        # Basic commands (menu, ping, info)
├── user/          # User-related commands (profile, register)
├── group/         # Group management commands
├── fun/           # Entertainment commands
├── search/        # Search and utility commands
├── owner/         # Owner-only commands
└── custom/        # Your custom plugins
```

### Creating a Plugin

Create a new `.js` file in the appropriate category folder:

```javascript
export default {
    command: 'hello',
    aliases: ['hi'],
    description: 'Greet the user',
    category: 'general',
    usage: '.hello',
    cooldown: 3,
    async execute(context) {
        const { reply, pushName } = context
        await reply(`Hello ${pushName}! 👋`)
    }
}
```

### Plugin Properties

#### Required Properties
- **command** (string): Main command name
- **execute** (function): Function to run when command is called

#### Optional Properties
- **aliases** (array): Alternative command names
- **description** (string): Command description for help
- **category** (string): Command category (auto-detected from folder)
- **usage** (string): Usage example
- **cooldown** (number): Cooldown in seconds
- **limit** (number): Limit cost for non-premium users
- **premium** (boolean): Premium only command
- **ownerOnly** (boolean): Owner only command
- **groupOnly** (boolean): Group only command
- **privateOnly** (boolean): Private chat only command

### Context Object

The `context` object provides access to:

```javascript
{
    sock,           // Baileys socket instance
    msg,            // Original message object
    body,           // Message text
    messageType,    // Type of message
    isGroup,        // Boolean: is group chat
    sender,         // Sender JID
    groupMetadata,  // Group info (if group)
    pushName,       // Sender display name
    db,             // Database instance
    command,        // Used command
    args,           // Command arguments array
    text,           // Arguments as string
    prefix,         // Bot prefix
    reply,          // Function to reply
    react           // Function to react
}
```

## 💾 Database Structure

The bot uses JSON files for data storage:

### Files Created Automatically

- **`database/users.json`** - User profiles, levels, limits, registration data
- **`database/groups.json`** - Group settings, welcome messages, admin features
- **`database/settings.json`** - Bot configuration, prefix, owner info
- **`database/messages.json`** - Message cache for bot functionality

### User Data Structure

```json
{
  "6281234567890": {
    "jid": "6281234567890@s.whatsapp.net",
    "name": "John Doe",
    "level": 5,
    "exp": 250,
    "limit": 20,
    "premium": false,
    "banned": false,
    "warning": 0,
    "registered": true,
    "regTime": 1640995200000,
    "age": 25,
    "lastSeen": 1640995200000
  }
}
```

### Group Data Structure

```json
{
  "group-id@g.us": {
    "jid": "group-id@g.us",
    "name": "My Group",
    "welcome": true,
    "bye": true,
    "antilink": false,
    "antispam": false,
    "mute": false,
    "banned": false,
    "created": 1640995200000
  }
}
```

## 🔧 Plugin Development

### Advanced Examples

#### Command with Arguments

```javascript
export default {
    command: 'say',
    description: 'Make bot say something',
    category: 'fun',
    usage: '.say <text>',
    async execute(context) {
        const { reply, text } = context
        
        if (!text) {
            return await reply('❌ Please provide text to say!')
        }
        
        await reply(text)
    }
}
```

#### Database Integration

```javascript
export default {
    command: 'balance',
    description: 'Check your balance',
    category: 'economy',
    usage: '.balance',
    async execute(context) {
        const { reply, sender, db } = context
        const user = db.getUser(sender)
        
        // Add balance if doesn't exist
        if (!user.balance) {
            user.balance = 1000
            db.saveUsers()
        }
        
        await reply(`💰 Your balance: $${user.balance}`)
    }
}
```

#### API Integration

```javascript
import axios from 'axios'

export default {
    command: 'weather',
    description: 'Get weather information',
    category: 'utility',
    usage: '.weather <city>',
    limit: 2,
    cooldown: 30,
    async execute(context) {
        const { reply, text } = context
        
        if (!text) {
            return await reply('❌ Please provide city name!')
        }
        
        try {
            await reply('🌤️ Getting weather data...')
            
            const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${text}&appid=YOUR_API_KEY`)
            const weather = response.data
            
            const result = `
🌤️ *WEATHER INFO*
📍 Location: ${weather.name}
🌡️ Temperature: ${Math.round(weather.main.temp - 273.15)}°C
💧 Humidity: ${weather.main.humidity}%
☁️ Condition: ${weather.weather[0].description}
            `.trim()
            
            await reply(result)
        } catch (error) {
            await reply('❌ Failed to get weather data!')
        }
    }
}
```

### Best Practices

#### ✅ Do's
- Always validate user input
- Handle errors gracefully
- Use descriptive command names
- Add helpful usage examples
- Set appropriate cooldowns
- Use database efficiently
- Follow consistent formatting

#### ❌ Don'ts
- Don't block the event loop
- Don't ignore errors
- Don't spam users
- Don't use inappropriate limits
- Don't hardcode sensitive values
- Don't ignore security

## 🛡️ Security

### Built-in Security Features

- **Owner Verification** - Commands restricted to bot owner
- **User Ban System** - Ability to ban problematic users
- **Command Cooldowns** - Prevent command spam
- **Input Validation** - Sanitize user inputs
- **Error Handling** - Graceful error management
- **Rate Limiting** - Limit system for fair usage

### Security Best Practices

1. **Never share session files** - Keep your WhatsApp session private
2. **Set strong owner verification** - Use correct phone number format
3. **Regular monitoring** - Check logs for suspicious activity
4. **Update dependencies** - Keep packages up to date
5. **Validate inputs** - Always check user inputs in plugins

## 🔧 Troubleshooting

### Common Issues

#### Bot Won't Start

**Problem:** Bot crashes on startup

**Solutions:**
1. Check Node.js version: `node --version` (need 18+)
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check for syntax errors in plugins

#### QR Code Issues

**Problem:** QR code not scanning or connection fails

**Solutions:**
1. Clear session: delete `session/` folder
2. Restart bot completely
3. Make sure WhatsApp Web is logged out on browser
4. Try scanning with better lighting

#### Commands Not Working

**Problem:** Bot doesn't respond to commands

**Solutions:**
1. Check prefix in `database/settings.json`
2. Verify owner number format (no + or spaces)
3. Check if user is banned
4. Verify plugin syntax

#### Database Issues

**Problem:** Data not saving or corrupted

**Solutions:**
1. Check file permissions
2. Backup and delete `database/` folder
3. Restart bot to regenerate files
4. Check disk space

#### Memory Issues

**Problem:** Bot using too much memory

**Solutions:**
1. Restart bot daily
2. Clear old messages from database
3. Optimize plugins
4. Monitor plugin performance

### Getting Help

1. **Check Documentation** - Read this guide thoroughly
2. **Check Console Logs** - Look for error messages
3. **Test in Private Chat** - Isolate group-related issues
4. **Update Dependencies** - Ensure latest versions
5. **GitHub Issues** - Report bugs or ask questions

## 📊 Performance Optimization

### Tips for Better Performance

- ✅ **Restart regularly** - Restart bot daily for optimal performance
- ✅ **Clean database** - Remove old messages periodically
- ✅ **Optimize plugins** - Write efficient code
- ✅ **Monitor memory** - Check memory usage regularly
- ✅ **Use cooldowns** - Prevent rapid command execution

### Monitoring

```bash
# Check memory usage
node --expose-gc index.js

# Monitor with PM2 (recommended for production)
npm install -g pm2
pm2 start index.js --name "chisato-bot"
pm2 monitor
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Ways to Contribute

1. **Report Bugs** - Create detailed issue reports
2. **Suggest Features** - Propose new functionality
3. **Submit Plugins** - Share your custom plugins
4. **Improve Documentation** - Help make docs better
5. **Code Contributions** - Submit pull requests

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Plugin Contribution Guidelines

- Follow existing code style
- Add proper documentation
- Include error handling
- Test with different scenarios
- Use appropriate categories

## 📄 License

This project is licensed under the **ISC License**.

## ⚠️ Disclaimer

**Important:** This project is not affiliated with WhatsApp. Use responsibly and respect WhatsApp's Terms of Service.

- 🚫 Don't spam users
- 🚫 Don't use for harassment
- 🚫 Don't violate WhatsApp ToS
- 🚫 Don't share session files
- ✅ Use for legitimate purposes only

## 🙏 Credits

- **[Baileys](https://github.com/WhiskeySockets/Baileys)** - WhatsApp Web API library
- **[Kiznavierr](https://github.com/kiznavierr)** - Main developer
- **Contributors** - Everyone who helped improve this project

## 📞 Support

Need help? Here are your options:

- 📖 **Documentation** - Check this README first
- 🐛 **Bug Reports** - Open a GitHub issue
- 💡 **Feature Requests** - Suggest improvements
- 💬 **Community** - Join discussions

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made with ❤️ by [Kiznavierr](https://github.com/kiznavierr)

**Happy Botting! 🎉**

</div>
