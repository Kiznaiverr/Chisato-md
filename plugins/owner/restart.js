import font from '../../lib/font.js'
import { spawn } from 'child_process'

export default {
    command: 'restart',
    aliases: ['reboot', 'reboot-bot'],
    description: 'Restart the Node.js bot process',
    category: 'owner',
    usage: '',
    ownerOnly: true,
    cooldown: 0,
    
    async execute(context) {
        const { reply, react } = context
        
        try {
            await react('🔄')
            await reply(`🔄 ${font.smallCaps('Restarting Node.js process')}...\n\n⏳ ${font.smallCaps('Bot will be back online shortly')}...\n\n💡 ${font.smallCaps('This may take 10-30 seconds')}`)
            
            // Give time for the message to be sent
            setTimeout(() => {
                // Get the current process arguments
                const args = process.argv.slice(1);
                const executable = process.execPath;
                
                console.log('🔄 Restarting Node.js process...');
                console.log('📂 Executable:', executable);
                console.log('📋 Arguments:', args);
                
                // Spawn a new process with the same arguments
                const child = spawn(executable, args, {
                    detached: true,
                    stdio: 'inherit',
                    cwd: process.cwd(),
                    env: process.env
                });
                
                // Detach the child process so it can continue running
                child.unref();
                
                // Exit the current process
                process.exit(0);
            }, 3000);
            
        } catch (error) {
            console.error('Restart error:', error);
            await react('❌')
            await reply(`❌ ${font.smallCaps('Failed to restart Node.js process')}\n\n🐛 ${font.smallCaps('Error:')} ${error.message}`);
        }
    }
}
