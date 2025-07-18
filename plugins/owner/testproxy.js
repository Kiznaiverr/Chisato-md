import axios from 'axios'
import proxyManager from '../../lib/proxyManager.js'
import font from '../../lib/font.js'

export default {
    command: 'testproxy',
    aliases: ['tproxy'],
    category: 'owner',
    description: 'Test proxy functionality with external API',
    usage: '[url]',
    ownerOnly: true,
    cooldown: 10,
    
    async execute({ msg, sock, reply, react, args }) {
        try {
            await react('🕔')
            
            const testUrl = args[0] || 'https://httpbin.org/ip'
            
            await reply(`🔄 ${font.smallCaps('Testing proxy connection')}...\n\n${font.smallCaps('Target URL')}: ${testUrl}`)
            
            // Test without proxy first
            let directResult
            try {
                delete axios.defaults.proxy
                axios.defaults.timeout = 10000
                
                const directResponse = await axios.get(testUrl)
                directResult = {
                    success: true,
                    data: typeof directResponse.data === 'object' ? JSON.stringify(directResponse.data) : directResponse.data.substring(0, 200),
                    status: directResponse.status
                }
            } catch (error) {
                directResult = {
                    success: false,
                    error: error.message.substring(0, 100)
                }
            }
            
            // Test with proxy
            let proxyResult
            try {
                const proxyConfigured = await proxyManager.configureGlobalProxy()
                
                if (proxyConfigured) {
                    const proxyResponse = await axios.get(testUrl)
                    proxyResult = {
                        success: true,
                        data: typeof proxyResponse.data === 'object' ? JSON.stringify(proxyResponse.data) : proxyResponse.data.substring(0, 200),
                        status: proxyResponse.status,
                        proxy: proxyManager.getStatus().current_proxy
                    }
                } else {
                    proxyResult = {
                        success: false,
                        error: 'No proxy available'
                    }
                }
            } catch (error) {
                // Mark proxy as failed if it doesn't work
                proxyManager.markProxyAsFailed()
                proxyResult = {
                    success: false,
                    error: error.message.substring(0, 100),
                    proxy: proxyManager.getStatus().current_proxy
                }
            }
            
            // Format results
            let resultText = `📊 *${font.smallCaps('Proxy Test Results')}*\n\n`
            
            // Direct connection result
            resultText += `🔗 *${font.smallCaps('Direct Connection')}:*\n`
            if (directResult.success) {
                resultText += `✅ ${font.smallCaps('Status')}: ${directResult.status}\n`
                resultText += `📄 ${font.smallCaps('Response')}: ${directResult.data.substring(0, 100)}...\n\n`
            } else {
                resultText += `❌ ${font.smallCaps('Error')}: ${directResult.error}\n\n`
            }
            
            // Proxy connection result
            resultText += `🌐 *${font.smallCaps('Proxy Connection')}:*\n`
            if (proxyResult.success) {
                resultText += `✅ ${font.smallCaps('Status')}: ${proxyResult.status}\n`
                if (proxyResult.proxy) {
                    resultText += `🔗 ${font.smallCaps('Proxy')}: ${proxyResult.proxy.protocol}://${proxyResult.proxy.host}:${proxyResult.proxy.port}\n`
                }
                resultText += `📄 ${font.smallCaps('Response')}: ${proxyResult.data.substring(0, 100)}...\n`
            } else {
                resultText += `❌ ${font.smallCaps('Error')}: ${proxyResult.error}\n`
                if (proxyResult.proxy) {
                    resultText += `🔗 ${font.smallCaps('Failed Proxy')}: ${proxyResult.proxy.protocol}://${proxyResult.proxy.host}:${proxyResult.proxy.port}\n`
                }
            }
            
            // Status summary
            const status = proxyManager.getStatus()
            resultText += `\n📈 ${font.smallCaps('Proxy Stats')}: ${status.working_proxies}/${status.total_proxies} working`
            
            await react('✅')
            await reply(resultText)
            
        } catch (error) {
            console.error('Test proxy error:', error)
            await react('❌')
            await reply(`❌ ${font.smallCaps('Failed to test proxy')}!\n\n${font.smallCaps('Error')}: ${error.message}`)
        }
    }
}
