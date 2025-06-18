# 🤖 Chisato MD - Advanced WhatsApp Bot

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
- [📱 Commands](#-commands)
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

## 📱 Commands

### 🌟 **General Commands**
| Command | Description | Usage |
|---------|-------------|-------|
| `.menu` | Dynamic interactive menu with categories | `menu [category\|search keyword]` |
| `.ping` | Response time & system info | `ping` |
| `.listcmd` | Quick command list by category | `listcmd [category]` |
| `.cmdinfo` | Detailed command information | `cmdinfo <command>` |
| `.sysinfo` | Complete system information | `sysinfo` |
| `.info` | Bot information & features | `info` |

### 👤 **User Commands**
| Command | Description | Usage |
|---------|-------------|-------|
| `.profile` | User profile & stats | `profile [@user]` |
| `.limit` | Check daily limit | `limit` |
| `.register` | Register as user | `register <name> <age>` |

### 👨‍💼 **Admin Commands**
| Command | Description | Usage |
|---------|-------------|-------|
| `.kick` | Remove group member | `kick @user [reason]` |
| `.ban` | Ban user from bot usage | `ban @user [reason]` |
| `.unban` | Unban user from bot | `unban @user` |
| `.promote` | Make user group admin | `promote @user` |
| `.demote` | Remove user admin status | `demote @user` |
| `.mute` | Mute bot in group | `mute [duration]` |
| `.unmute` | Unmute bot in group | `unmute` |

### 👑 **Owner Commands**
| Command | Description | Usage |
|---------|-------------|-------|
| `.addadmin` | Add bot administrator | `addadmin @user` |
| `.deladmin` | Remove bot administrator | `deladmin @user` |
| `.addpremium` | Add premium user | `addpremium @user [duration]` |
| `.delpremium` | Remove premium status | `delpremium @user` |
| `.listpremium` | List all premium users | `listpremium` |
| `.config` | Manage bot configuration | `config [get\|set\|list] [key] [value]` |
| `.eval` | Execute JavaScript code | `eval <code>` ⚠️ Use carefully |

### 📁 **Media Commands**
| Command | Description | Usage |
|---------|-------------|-------|
| `.sticker` / `.s` | Convert media to sticker | Reply to image/video or send with caption `.s` |

## 🔌 Plugin Development

### 📁 **Plugin Structure**
```
plugins/
├── admin/     # Admin-only commands
├── user/      # User commands  
├── owner/     # Owner-only commands
├── general/   # Public commands
├── media/     # Media processing
└── fun/       # Entertainment
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

## 🔧 Troubleshooting

### 🚨 **Common Issues**

**Bot not responding:**
```bash
# Check connection and prefix
.ping                    # Test bot response
.config get botSettings  # Check settings
```

**Permission errors:**
```bash
.config list adminSettings   # Check admin list
.config list ownerSettings   # Check owner list
```

**Plugin errors:**
```bash
# Check console for error messages
# Verify plugin syntax and structure
# Ensure proper file permissions
```

### 📊 **Debug Commands**
```bash
.sysinfo                # System information
.ping                   # Response time test
.listcmd               # Loaded plugins
```

### 📝 **Log Analysis**
**Console Colors:**
- 🟡 **Yellow** - Valid command execution
- 🔴 **Red** - Errors and permission denied
- ⚪ **White** - Non-command messages
- 🟢 **Green** - System events

---

## 🎉 **Ready to Deploy!**

### ⭐ **Key Highlights**
- 🎯 **Dynamic Menu System** - Auto-generated from loaded plugins
- 💎 **Premium Management** - Complete user tier system
- ⚙️ **Easy Configuration** - JSON-based settings with live reload
- 🔐 **Secure Architecture** - Permission-based access control
- 🎨 **Beautiful Interface** - Colorful logging and formatted responses
- 🚀 **High Performance** - Optimized for speed and reliability

### 📞 **Support**
- 📖 **Documentation** - This README covers all features
- 🐛 **Issues** - Report bugs via GitHub issues
- 💡 **Features** - Suggest improvements
- 💬 **Community** - Join discussions

---

**Made with ❤️ by [Kiznavierr](https://github.com/kiznavierr)**

⭐ **Star this repository if you find it helpful!**

---

## ⚡ Quick Reference

### 🔧 **Instant Setup**
1. Clone repo → `npm install` → Edit `config.json` (set owner number)
2. Run `npm start` → Scan QR → Test with `.menu`

### 🎯 **Essential Commands**
```bash
# Navigation & Info
.menu                   # Interactive menu system
.menu admin            # View admin commands
.menu search keyword   # Search commands
.listcmd               # Quick command list
.ping                  # Response time & system info

# Configuration Management
.config get botSettings.prefix    # View current prefix
.config set botSettings.prefix !  # Change prefix to !
.config list                      # View all settings
.config backup                    # Backup configuration

# Premium Management (Owner Only)
.addpremium @user 30d   # Add 30 days premium
.addpremium @user       # Add lifetime premium  
.delpremium @user       # Remove premium status
.listpremium           # View all premium users

# Admin Management (Owner Only)
.addadmin @user        # Add bot administrator
.deladmin @user        # Remove bot administrator

# Group Management (Admin+)
.kick @user            # Remove group member
.ban @user             # Ban user from bot
.promote @user         # Make group admin
.mute                  # Stop bot responses

# Media Processing
.sticker              # Convert image/video to sticker (reply)
.s                    # Send media with caption .s
```

### 🎯 **User Tiers & Limits**
| Tier | Icon | Daily Limit | Access Level |
|------|------|-------------|--------------|
| 👑 **Owner** | 👑 | ∞ Unlimited | Full bot control, config access |
| 💎 **Premium** | 💎 | ∞ Unlimited | No limits, priority features |
| 🆓 **Regular** | 🆓 | 50 commands | Basic features, daily reset |

### ⏰ **Duration Formats**
- `30d` = 30 days, `24h` = 24 hours, `60m` = 60 minutes
- No duration = Lifetime premium

### 📁 **Project Structure**
```
config.json         # Main configuration file
lib/
├── config.js       # Configuration manager
├── handler.js      # Message handler & command processor
├── database.js     # User & group data management
└── loader.js       # Plugin loader system
plugins/
├── admin/          # Admin-only commands
├── user/           # User commands  
├── owner/          # Owner-only commands
├── general/        # Public commands
└── media/          # Media processing commands
database/
├── users.json      # User data & premium status
└── groups.json     # Group settings & data
```

### 🚨 **Quick Troubleshooting**
**Bot not responding?** → Check `.ping` and verify prefix in config
**Permission errors?** → Verify owner/admin status with `.config list`
**Plugin issues?** → Check console for errors, verify file structure

### 🎨 **Console Status Colors**
- 🟡 **Yellow** - Valid command execution
- 🔴 **Red** - Errors/permission denied  
- ⚪ **White** - Non-command messages
- 🟢 **Green** - System events & connection

### 💡 **Pro Tips**
- All commands require the configured prefix (default: `.`)
- Premium users bypass daily limits automatically
- Use `.cmdinfo <command>` for detailed command help
- Backup config regularly with `.config backup`
- Check `.sysinfo` for detailed system performance

---
