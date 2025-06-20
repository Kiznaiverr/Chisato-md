import { convertToSmallCaps } from '../../lib/font.js';
import fs from 'fs';
import path from 'path';

export default {
    command: 'dbmanage',
    aliases: ['db', 'database'],
    category: 'owner',
    description: 'Manage database operations (backup, restore, clean)',
    usage: '<backup|restore|clean|stats>',
    ownerOnly: true,
    cooldown: 30,
      async execute(sock, m, args) {
        try {
            if (!args[0]) {
                return await sock.sendMessage(m.key.remoteJid, {
                    text: convertToSmallCaps('❌ Please specify an operation.\n\nAvailable operations:\n• backup - Create database backup\n• restore - Restore from backup\n• clean - Clean old data\n• stats - Show database statistics\n\nExample: .dbmanage backup')
                });
            }

            const operation = args[0].toLowerCase();
            const dbPath = './database/';
            
            switch (operation) {
                case 'backup':
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    const backupDir = `./backups/db-${timestamp}/`;
                    
                    if (!fs.existsSync('./backups')) {
                        fs.mkdirSync('./backups');
                    }
                    fs.mkdirSync(backupDir);

                    // Copy all database files
                    const dbFiles = fs.readdirSync(dbPath);
                    let backedUp = 0;
                    
                    for (const file of dbFiles) {
                        if (file.endsWith('.json')) {
                            fs.copyFileSync(path.join(dbPath, file), path.join(backupDir, file));
                            backedUp++;
                        }
                    }

                    await sock.sendMessage(m.key.remoteJid, {
                        text: convertToSmallCaps(`✅ Database backup completed!\n\n• Backup location: ${backupDir}\n• Files backed up: ${backedUp}\n• Timestamp: ${timestamp}`)
                    });
                    break;

                case 'stats':
                    let totalUsers = 0;
                    let totalGroups = 0;
                    let dbSize = 0;

                    try {
                        // Users stats
                        if (fs.existsSync('./database/users.json')) {
                            const users = JSON.parse(fs.readFileSync('./database/users.json', 'utf8'));
                            totalUsers = Object.keys(users).length;
                            dbSize += fs.statSync('./database/users.json').size;
                        }

                        // Groups stats
                        if (fs.existsSync('./database/groups.json')) {
                            const groups = JSON.parse(fs.readFileSync('./database/groups.json', 'utf8'));
                            totalGroups = Object.keys(groups).length;
                            dbSize += fs.statSync('./database/groups.json').size;
                        }

                        // Get all db files
                        const dbFiles = fs.readdirSync(dbPath).filter(f => f.endsWith('.json'));
                        
                        await sock.sendMessage(m.key.remoteJid, {
                            text: convertToSmallCaps(`📊 DATABASE STATISTICS\n`) +
                                convertToSmallCaps(`━━━━━━━━━━━━━━━\n\n`) +
                                convertToSmallCaps(`👥 USERS: ${totalUsers}\n`) +
                                convertToSmallCaps(`🏷️ GROUPS: ${totalGroups}\n`) +
                                convertToSmallCaps(`📁 DB FILES: ${dbFiles.length}\n`) +
                                convertToSmallCaps(`💾 TOTAL SIZE: ${(dbSize / 1024).toFixed(2)} KB\n\n`) +
                                convertToSmallCaps(`📋 FILES:\n`) +
                                dbFiles.map(file => convertToSmallCaps(`• ${file}`)).join('\n')
                        });
                    } catch (error) {
                        await sock.sendMessage(m.key.remoteJid, {
                            text: convertToSmallCaps('❌ Error reading database statistics.')
                        });
                    }
                    break;

                case 'clean':
                    // Clean old data (older than 30 days)
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    
                    let cleaned = 0;
                    
                    // Clean users database
                    if (fs.existsSync('./database/users.json')) {
                        const users = JSON.parse(fs.readFileSync('./database/users.json', 'utf8'));
                        for (const userId in users) {
                            if (users[userId].lastSeen && new Date(users[userId].lastSeen) < thirtyDaysAgo) {
                                delete users[userId];
                                cleaned++;
                            }
                        }
                        fs.writeFileSync('./database/users.json', JSON.stringify(users, null, 2));
                    }

                    await sock.sendMessage(m.key.remoteJid, {
                        text: convertToSmallCaps(`🧹 Database cleanup completed!\n\n• Cleaned entries: ${cleaned}\n• Cutoff date: ${thirtyDaysAgo.toDateString()}`)
                    });
                    break;

                default:
                    await sock.sendMessage(m.key.remoteJid, {
                        text: convertToSmallCaps('❌ Invalid operation. Use: backup, restore, clean, or stats')
                    });
            }        } catch (error) {
            console.error('Database manage error:', error);
            await sock.sendMessage(m.key.remoteJid, {
                text: convertToSmallCaps('❌ Error occurred during database operation.')
            });
        }
    }
};
