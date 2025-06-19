# 🤖 Chisato MD - Advanced WhatsApp Bot

**Powered by Chisato API — https://api.nekoyama.my.id**

![Bot Status](https://img.shields.io/badge/Status-Active-brightgreen)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)
![Bailey| `.profile` | User profile & premium status | `profile [@user]` |
| `.limit` | Check daily usage limit | `limit` |
| `.register` | Register as bot user | `register <name> <age>` |
| `.rank` | View user rank & level | `rank [@user]` |https://img.shields.io/badge/Baileys-6.7.18-blue)
![License](https://img.shields.io/badge/License-ISC-yellow)

A modern, feature-rich WhatsApp bot with dynamic menu system, premium user management, and comprehensive admin tools. Built with Baileys library for reliable WhatsApp Web API integration.

## 📑 Table of Contents

- [✨ Features](#-features)
- [🚀 Quick Start](#-quick-start)
- [⚙️ Configuration](#️-configuration)
- [💎 Premium System](#-premium-system)
- [🔌 Plugin Development](#-plugin-development)
- [🔧 Troubleshooting](#-troubleshooting)
- [⚡ Quick Reference](#-quick-reference)

## ✨ Features

### 🎯 **Core Capabilities**
- 🔌 **Modular Plugin System** - Organized by permission levels
- 🎯 **Dynamic Menu** - Auto-generated, searchable command interface
- ⚙️ **Centralized Config** - JSON-based configuration management
- 💎 **Premium System** - Advanced user tier management
- 🔐 **3-Tier Permissions** - Owner → Admin → User hierarchy
- 🎨 **Smart UI** - Color-coded logging and beautiful responses

### 🛡️ **Security & Performance**
- ⚡ **Optimized Performance** - No message storage, smart caching
- 🛡️ **Anti-Spam Protection** - Rate limiting and cooldowns
- 🚫 **Anti Self-Reply** - Bot ignores its own messages
- 📍 **Prefix-Only Response** - Commands require prefix
- 🔒 **Input Validation** - Secure command processing

## 🚀 Quick Start

### 1. Installation
```bash
# Clone repository
git clone <repository-url>
cd chisato-md

# Install dependencies
npm install
```

### 2. Configuration
Edit `config.json`:
```json
{
  "ownerSettings": {
    "owners": ["YOUR_NUMBER@s.whatsapp.net"]
  },
  "botSettings": {
    "prefix": ".",
    "botName": "Your Bot Name"
  }
}
```

### 3. Start Bot
```bash
npm start
```

### 4. Connect WhatsApp
1. Open WhatsApp → Settings → Linked Devices
2. Scan QR code from terminal
3. Send `.menu` to test

## ⚙️ Configuration

### 📁 Config Structure
All bot settings are in `config.json`:
```json
{
  "botSettings": {
    "botName": "Chisato-MD",
    "prefix": ".",
    "timezone": "Asia/Jakarta"
  },
  "ownerSettings": {
    "owners": ["YOUR_NUMBER@s.whatsapp.net"],
    "ownerName": "Your Name",
    "ownerNumber": "YOUR_NUMBER"
  },
  "adminSettings": {
    "admins": [],
    "autoPromoteOwner": true
  },
  "limitSettings": {
    "dailyLimit": 50,
    "premiumLimit": 999
  }
}
```

### ⚙️ Config Commands
```bash
.config get botSettings.prefix      # Get prefix
.config set botSettings.prefix !    # Change prefix
.config list                        # View all settings
.config backup                      # Backup configuration
```

📖 **Complete Configuration Guide**: See `CONFIG_GUIDE.md` for detailed explanations of all settings.

## 💎 Premium System

### 🎯 **User Tiers**
| Tier | Icon | Daily Limit | Features |
|------|------|-------------|----------|
| Owner | 👑 | ∞ Unlimited | Full bot control, config access |
| Premium | 💎 | ∞ Unlimited | No daily limits, priority support |
| Regular | 🆓 | 50 commands | Basic features, daily reset |

### 🔧 **Premium Management (Owner Only)**
```bash
# Add Premium Users
.addpremium @user 30d    # Add 30 days premium
.addpremium @user 7h     # Add 7 hours premium
.addpremium @user 120m   # Add 120 minutes premium
.addpremium @user        # Add lifetime premium (no expiry)

# Manage Premium Status
.delpremium @user        # Remove premium status
.listpremium            # View all premium users with expiry info

# User Status Commands
.limit                  # Check daily usage & premium status
.profile [@user]        # View user profile with premium info
```

### ⏰ **Duration Formats**
- `30d` - 30 days
- `24h` - 24 hours  
- `60m` - 60 minutes
- No duration = Lifetime premium

### 🎁 **Premium Benefits**
**Owner Benefits:**
- 👑 Unlimited daily commands
- 👑 Full configuration access
- 👑 Admin & premium management
- 👑 All plugin access

**Premium Benefits:**
- 💎 Unlimited daily commands
- 💎 Priority support & features
- 💎 Premium status display
- 💎 Bypass cooldown restrictions

**Regular User:**
- 🆓 50 commands per day (configurable)
- 🆓 Basic feature access
- 🆓 Clear upgrade path information

### ⚙️ **Auto-Expiry System**
- ✅ Automatic expiry checking on every command
- ✅ Graceful downgrade to regular user
- ✅ Premium duration tracking
- ✅ Expiry notifications in profile/limit commands

### 🔧 **Configuration Options**
```json
{
  "limitSettings": {
    "dailyLimit": 50,        
    "premiumLimit": 999,     
    "limitResetHour": 0,     
    "limitResetMinute": 0    
  }
}
```

### 🔧 **Plugin Template**
```javascript
export default {
    command: 'example',
    aliases: ['ex'],
    category: 'general',
    description: 'Example command',
    usage: 'example <arg>',
    cooldown: 5,
    limit: 1,
    ownerOnly: false,
    
    async execute({ reply, args, react, db, sender }) {
        await react('🕔')
        
        // Command logic here
        await reply('Success!')
        
        await react('✅')
    }
}
```

### 🎯 **Permission Flags**
- `ownerOnly: true` - Owner only
- `adminOnly: true` - Admin and owner only
- `groupOnly: true` - Group chats only
- `limit: 2` - Uses 2 daily limit
- `premium: true` - Premium users only


---

**Made with ❤️ by [Kiznavierr](https://github.com/kiznavierr)**

⭐ **Star this repository if you find it helpful!**

---

**Powered by Chisato API — https://api.nekoyama.my.id**
