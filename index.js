const { makeWASocket, useSingleFileAuthState } = require('@whiskeysockets/baileys');
const { botName } = require('./config.js');
const path = require('path');

// Load session dari folder `session/creds.json`
const { state, saveState } = useSingleFileAuthState(
  path.join(__dirname, 'session', 'creds.json')
);

// Buat koneksi WhatsApp
const sock = makeWASocket({
  auth: state,
  printQRInTerminal: true,
  browser: [botName, "Chrome", "1.0.0"]
});

// Simpan session saat update
sock.ev.on('creds.update', saveState);

// Pindahkan logic handling pesan ke main.js (optional)
require('./main.js')(sock); 

console.log(`Bot ${botName} berjalan!`);