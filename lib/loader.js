import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import logSymbols from 'log-symbols'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Helper function to get category colors
function getCategoryColor(category) {
    const colors = {
        'admin': chalk.red,
        'owner': chalk.magenta,
        'user': chalk.blue,
        'general': chalk.green,
        'group': chalk.cyan,
        'fun': chalk.yellow,
        'media': chalk.blue,
        'search': chalk.white
    }
    return colors[category] || chalk.white
}

export async function loadPlugins() {
    const pluginsDir = path.join(__dirname, '..', 'plugins')
    const plugins = []

    if (!fs.existsSync(pluginsDir)) {
        fs.mkdirSync(pluginsDir, { recursive: true })
        console.log(chalk.yellow('📁 Created plugins directory'))
        return plugins
    }

    const logInfo = (...args) => console.log(logSymbols.info, ...args)
    const logSuccess = (...args) => console.log(logSymbols.success, ...args)
    const logWarn = (...args) => console.log(logSymbols.warning, ...args)
    const logError = (...args) => console.log(logSymbols.error, ...args)

    logInfo('Plugin Loader Start')
    await loadFromDirectory(pluginsDir)
    logSuccess(`Loaded: ${plugins.length} plugins`)

    console.log(chalk.cyan('└────────────────────────┘'))
    console.log(chalk.green(`✨ Successfully loaded ${plugins.length} plugins\n`))
    return plugins

    // Function to recursively load plugins from directories
    async function loadFromDirectory(directory, category = '') {
        const items = fs.readdirSync(directory)
        for (const item of items) {
            const itemPath = path.join(directory, item)
            const stat = fs.statSync(itemPath)
            if (stat.isDirectory()) {
                await loadFromDirectory(itemPath, item)
            } else if (item.endsWith('.js')) {
                try {
                    const plugin = await import(`file://${itemPath}`)
                    if (plugin.default && typeof plugin.default === 'object') {
                        if (category && !plugin.default.category) {
                            plugin.default.category = category
                        }
                        plugins.push(plugin.default)
                        // Log sukses
                        const pluginName = category ? `${category}/${item}` : item
                        logSuccess(`Loaded`, pluginName, category ? `[${category}]` : '')
                    }
                } catch (error) {
                    const pluginName = category ? `${category}/${item}` : item
                    // Log gagal
                    logError(`Failed`, pluginName, category ? `[${category}]` : '', '|', error.message)
                }
            }
        }
    }
}
