import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import { fileURLToPath } from 'url'

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

    console.log(chalk.cyan('┌─ 📂 Loading Plugins ─┐'))
    
    // Function to recursively load plugins from directories
    async function loadFromDirectory(directory, category = '') {
        const items = fs.readdirSync(directory)

        for (const item of items) {
            const itemPath = path.join(directory, item)
            const stat = fs.statSync(itemPath)

            if (stat.isDirectory()) {
                // Recursively load plugins from subdirectories
                await loadFromDirectory(itemPath, item)
            } else if (item.endsWith('.js')) {
                try {
                    const plugin = await import(`file://${itemPath}`)
                    
                    if (plugin.default && typeof plugin.default === 'object') {
                        // Set category based on folder name if not already set
                        if (category && !plugin.default.category) {
                            plugin.default.category = category
                        }                        plugins.push(plugin.default)
                        
                        // Colored plugin loading log with better formatting
                        const categoryColor = category ? getCategoryColor(category) : chalk.white
                        const pluginName = category ? `${category}/${item}` : item
                        const paddedName = pluginName.padEnd(25)
                        console.log(chalk.green('│ ✅') + chalk.gray(' Loading: ') + categoryColor(paddedName) + chalk.green(' ✓'))}                } catch (error) {
                    const pluginName = category ? `${category}/${item}` : item
                    const paddedName = pluginName.padEnd(25)
                    console.log(chalk.red('│ ❌') + chalk.gray(' Failed: ') + chalk.white(paddedName) + chalk.red(' ✗'))
                }
            }
        }
    }    await loadFromDirectory(pluginsDir)

    console.log(chalk.cyan('└────────────────────────┘'))
    console.log(chalk.green(`✨ Successfully loaded ${plugins.length} plugins\n`))
    return plugins
}
