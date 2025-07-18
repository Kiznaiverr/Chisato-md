import proxyManager from '../../lib/proxyManager.js'
import font from '../../lib/font.js'

export default {
    command: 'proxy',
    aliases: ['prx', 'proxies'],
    category: 'owner',
    description: 'Manage proxy settings',
    usage: '<status|refresh|config|cleanup>',
    ownerOnly: true,
    cooldown: 5,
    
    async execute({ msg, sock, reply, react, args }) {
        try {
            await react('🕔')
            
            const action = args[0]?.toLowerCase()
            
            if (!action) {
                return await reply(`🔧 *${font.smallCaps('Proxy Manager')}*\n\n${font.smallCaps('Available commands')}:\n• ${font.smallCaps('.proxy status - Show proxy status')}\n• ${font.smallCaps('.proxy refresh - Refresh proxy list')}\n• ${font.smallCaps('.proxy config - Configure global proxy')}\n• ${font.smallCaps('.proxy cleanup - Manual cache cleanup')}`)
            }
            
            switch (action) {
                case 'status':
                case 'info':
                    await handleStatus(reply, react)
                    break
                    
                case 'refresh':
                case 'fetch':
                    await handleRefresh(reply, react)
                    break
                    
                case 'config':
                case 'configure':
                    await handleConfig(reply, react)
                    break
                    
                case 'cleanup':
                case 'clean':
                    await handleCleanup(reply, react)
                    break
                    
                default:
                    await react('❌')
                    await reply(`❌ ${font.smallCaps('Unknown action')}!\n\n${font.smallCaps('Available actions')}: status, refresh, config, cleanup`)
            }
            
        } catch (error) {
            console.error('Proxy command error:', error)
            await react('❌')
            await reply(`❌ ${font.smallCaps('Failed to execute proxy command')}!`)
        }
    }
}

async function handleStatus(reply, react) {
    try {
        const status = proxyManager.getStatus()
        
        let statusText = `📊 *${font.smallCaps('Proxy Manager Status')}*\n\n`
        statusText += `📈 ${font.smallCaps('Total Proxies')}: ${status.total_proxies}\n`
        statusText += `✅ ${font.smallCaps('Working Proxies')}: ${status.working_proxies}\n`
        statusText += `❌ ${font.smallCaps('Failed Proxies')}: ${status.failed_proxies}\n`
        statusText += `🔄 ${font.smallCaps('Current Index')}: ${status.current_index}\n`
        statusText += `⏰ ${font.smallCaps('Last Fetch')}: ${status.last_fetch || 'Never'}\n`
        statusText += `📝 ${font.smallCaps('Cache Expiry')}: ${status.cache_expiry}\n`
        statusText += `🔄 ${font.smallCaps('Should Refresh')}: ${status.should_refresh ? 'Yes' : 'No'}\n\n`
        
        statusText += `🤖 ${font.smallCaps('Cron Jobs')}:\n`
        statusText += `• ${font.smallCaps('Cache Cleanup')}: ${status.cron_jobs.cache_cleanup}\n`
        statusText += `• ${font.smallCaps('Backup Cleanup')}: ${status.cron_jobs.backup_cleanup}\n\n`
        
        if (status.current_proxy) {
            statusText += `🌐 ${font.smallCaps('Current Proxy')}: ${status.current_proxy.protocol}://${status.current_proxy.host}:${status.current_proxy.port}\n`
        } else {
            statusText += `🌐 ${font.smallCaps('Current Proxy')}: ${font.smallCaps('Direct connection')}\n`
        }
        
        statusText += `📅 ${font.smallCaps('Next Refresh')}: ${status.next_refresh}`
        
        await react('✅')
        await reply(statusText)
        
    } catch (error) {
        console.error('Status error:', error)
        await react('❌')
        await reply(`❌ ${font.smallCaps('Failed to get proxy status')}!`)
    }
}

async function handleRefresh(reply, react) {
    try {
        await reply(`🔄 ${font.smallCaps('Refreshing proxy list')}...`)
        
        const success = await proxyManager.fetchProxiesWithRetry()
        
        if (success) {
            const status = proxyManager.getStatus()
            await react('✅')
            await reply(`✅ ${font.smallCaps('Proxy list refreshed successfully')}!\n\n📈 ${font.smallCaps('Total proxies')}: ${status.total_proxies}\n✅ ${font.smallCaps('Working proxies')}: ${status.working_proxies}`)
        } else {
            await react('❌')
            await reply(`❌ ${font.smallCaps('Failed to refresh proxy list')}!`)
        }
        
    } catch (error) {
        console.error('Refresh error:', error)
        await react('❌')
        await reply(`❌ ${font.smallCaps('Failed to refresh proxy list')}!`)
    }
}

async function handleConfig(reply, react) {
    try {
        await reply(`⚙️ ${font.smallCaps('Configuring global proxy')}...`)
        
        const success = await proxyManager.configureGlobalProxy()
        
        if (success) {
            const status = proxyManager.getStatus()
            await react('✅')
            let responseText = `✅ ${font.smallCaps('Global proxy configured successfully')}!\n\n`
            if (status.current_proxy) {
                responseText += `🌐 ${font.smallCaps('Active proxy')}: ${status.current_proxy.protocol}://${status.current_proxy.host}:${status.current_proxy.port}`
            }
            await reply(responseText)
        } else {
            await react('⚠️')
            await reply(`⚠️ ${font.smallCaps('No proxy available, using direct connection')}!`)
        }
        
    } catch (error) {
        console.error('Config error:', error)
        await react('❌')
        await reply(`❌ ${font.smallCaps('Failed to configure proxy')}!`)
    }
}

async function handleCleanup(reply, react) {
    try {
        await reply(`🧹 ${font.smallCaps('Starting manual cache cleanup')}...`)
        
        await proxyManager.manualCleanup()
        const status = proxyManager.getStatus()
        
        await react('✅')
        await reply(`✅ ${font.smallCaps('Cache cleanup completed')}!\n\n📈 ${font.smallCaps('Fresh proxies loaded')}: ${status.total_proxies}\n✅ ${font.smallCaps('Working proxies')}: ${status.working_proxies}`)
        
    } catch (error) {
        console.error('Cleanup error:', error)
        await react('❌')
        await reply(`❌ ${font.smallCaps('Failed to cleanup cache')}!`)
    }
}
