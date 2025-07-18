<div align="center">

# ✨ Chisato MD

*A modern & elegant WhatsApp bot with premium features*

<br>

[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-Bot-brightgreen?style=for-the-badge&logo=whatsapp)](https://whatsapp.com)
[![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/Kiznaiverr/Chisato-md?style=for-the-badge&logo=github)](https://github.com/Kiznaiverr/Chisato-md)

<br>

*Built with ❤️ by [Kiznavierr](https://github.com/kiznaiverr)*

</div>

<br>

## � Table of Contents

- [🚀 Quick Setup](#-quick-setup)
- [✨ Key Features](#-key-features)
- [💎 User Tiers](#-user-tiers)
- [📁 Project Structure](#-project-structure)
- [🔧 Configuration](#-configuration)
- [🔌 Plugin Development](#-plugin-development)
- [📊 Stats & Monitoring](#-stats--monitoring)
- [🎭 Miscellaneous Features](#-miscellaneous-features)
- [🤝 Contributing](#-contributing)
- [📞 Support & Contact](#-support--contact)

<br>

## �🚀 Quick Setup

Get started in just **3 simple steps**:

```bash
# 1. Clone & Install
git clone <your-repository-url>
cd chisato-md && npm install

# 2. Start the bot
npm start

# 3. Scan QR code and test with: .menu
```

> **Note:** Edit `config.json` to customize your bot settings

<br>

## ✨ Key Features

<table>
<tr>
<td width="50%">

### 🎯 **Core Features**
- 🧩 **Modular Plugin System**
- 💎 **Premium User Management** 
- 📋 **Dynamic Menu Interface**
- ⚙️ **JSON Configuration**
- 🛡️ **3-Tier Permissions**

</td>
<td width="50%">

### 🛡️ **Security & Performance**
- ⚡ **Optimized Performance**
- 🚫 **Anti-Spam Protection**
- 🔒 **Input Validation**
- ✅ **Prefix-Only Commands**
- 🏃‍♂️ **Smart Caching**

</td>
</tr>
</table>

<br>

## 💎 User Tiers

| **Tier** | **Icon** | **Daily Limit** | **Access Level** |
|:--------:|:--------:|:---------------:|:----------------:|
| **Owner** | 👑 | ∞ Unlimited | Full Control |
| **Premium** | 💎 | ∞ Unlimited | Premium Features |
| **User** | 🆓 | 50 commands | Basic Features |

### Premium Commands
```bash
.addpremium @user 30d    # Add 30 days premium
.delpremium @user        # Remove premium
.listpremium            # View premium users
.limit                  # Check usage stats
```

<br>

## 📁 Project Structure

```
chisato-md/
├── 📄 config.json          # Bot configuration
├── 📄 index.js             # Main entry point
├── 📁 lib/                 # Core libraries
├── 📁 plugins/             # Feature plugins
│   ├── 📁 admin/           # Admin commands
│   ├── 📁 general/         # General commands
│   ├── 📁 media/           # Media processing
│   └── 📁 tools/           # Utility tools
├── 📁 database/            # Data storage
└── 📁 session/             # WhatsApp session
```

<br>

## 🔧 Configuration

### Basic Settings
```json
{
  "botSettings": {
    "botName": "Chisato-MD",
    "prefix": ".",
    "timezone": "Asia/Jakarta"
  },
  "ownerSettings": {
    "owners": ["YOUR_NUMBER@s.whatsapp.net"]
  }
}
```

### Config Commands
```bash
.config get botSettings.prefix      # Get current prefix
.config set botSettings.prefix !    # Change prefix to !
.config list                        # View all settings
```

<br>

## 🔌 Plugin Development

### Creating a Plugin
```javascript
export default {
    command: 'example',
    category: 'general',
    description: 'Example command',
    usage: 'example <text>',
    cooldown: 5,
    
    async execute({ reply, args, react }) {
        await react('✨')
        await reply(`Hello! You said: ${args.join(' ')}`)
        await react('✅')
    }
}
```

### Permission Levels
- `ownerOnly: true` - Owner exclusive
- `adminOnly: true` - Admin & owner only  
- `premium: true` - Premium users only
- `groupOnly: true` - Groups only

<br>

## 📊 Stats & Monitoring

```bash
.runtime     # Bot uptime & stats
.ping        # Response time
.profile     # User profile & limits
.system      # System information
```

<br>

## 🎭 Miscellaneous Features

<table>
<tr>
<td width="50%">

### 🎮 **Entertainment**
- 🎲 Random generators
- 🎯 Fun commands
- 🎪 Interactive games
- 🎨 Creative tools
- 🎭 Roleplay features

</td>
<td width="50%">

### 🛠️ **Utilities**
- 📊 Statistics tracking
- 📝 Text processing
- 🔍 Search engines
- 💾 Data management
- 🔧 System tools

</td>
</tr>
</table>

### Additional Features
- **📱 Media Processing** - Image, video, and audio manipulation
- **🌐 Web Integration** - Social media downloaders and web scraping
- **🤖 AI Integration** - Smart responses and automation
- **📅 Scheduling** - Automated tasks and reminders
- **🔐 Security** - Rate limiting and user verification
- **📈 Analytics** - Usage statistics and performance monitoring

<br>

## 🤝 Contributing

1. **Fork** this repository
2. **Create** your feature branch
3. **Commit** your changes
4. **Push** to the branch
5. **Open** a Pull Request

<br>

---

<div align="center">

### 🌟 Show Your Support

**If you like this project, please consider giving it a ⭐**

<br>

*Made with ❤️ by [Kiznavierr](https://github.com/kiznaiverr)*

</div>

<br>

## 📞 Support & Contact

<div align="center">

### Need Help? Get in Touch!

[![GitHub Issues](https://img.shields.io/badge/Issues-GitHub-red?style=for-the-badge&logo=github)](https://github.com/Kiznaiverr/Chisato-md/issues)
[![Discussions](https://img.shields.io/badge/Discussions-GitHub-blue?style=for-the-badge&logo=github)](https://github.com/Kiznaiverr/Chisato-md/discussions)

**Found a bug?** [Report it here](https://github.com/Kiznaiverr/Chisato-md/issues/new)  
**Have a suggestion?** [Start a discussion](https://github.com/Kiznaiverr/Chisato-md/discussions)  
**Need support?** Check our [documentation](https://github.com/Kiznaiverr/Chisato-md/wiki) first

</div>
