const config = require('../config.js');

module.exports = {
  name: "ping",
  desc: "Balas dengan Pong!",
  async execute(sock, message) {
    await sock.sendMessage(message.key.remoteJid, { 
      text: `Pong! 🏓 (Bot: ${config.botName})` 
    });
  }
};