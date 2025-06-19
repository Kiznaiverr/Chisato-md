import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import logSymbols from 'log-symbols'
import chokidar from 'chokidar'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Global variables for plugin management
let globalPlugins = []
let watcher = null
let reloadCallback = null

// Cache for tracking loaded modules
const moduleCache = new Map()

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
    
    // Store plugins globally for auto-reload
    globalPlugins.length = 0
    globalPlugins.push(...plugins)
    
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
                    await loadSinglePlugin(itemPath, category, item, plugins)
                } catch (error) {
                    const pluginName = category ? `${category}/${item}` : item
                    logError(`Failed`, pluginName, category ? `[${category}]` : '', '|', error.message)
                }
            }
        }
    }
}

// Function to load a single plugin
async function loadSinglePlugin(itemPath, category, fileName, plugins) {
    const logSuccess = (...args) => console.log(logSymbols.success, ...args)
    
    // Clear module cache to ensure fresh import
    const cacheKey = `file://${itemPath}`
    if (moduleCache.has(cacheKey)) {
        delete moduleCache.get(cacheKey)
    }
    
    // Add timestamp to force module reload
    const plugin = await import(`${cacheKey}?t=${Date.now()}`)
    
    if (plugin.default && typeof plugin.default === 'object') {
        if (category && !plugin.default.category) {
            plugin.default.category = category
        }
        
        // Store in cache
        moduleCache.set(cacheKey, plugin.default)
        
        plugins.push(plugin.default)
        const pluginName = category ? `${category}/${fileName}` : fileName
        logSuccess(`Loaded`, pluginName, category ? `[${category}]` : '')
    }
}

// Function to start auto-reload watcher
export function startAutoReload(callback) {
    const pluginsDir = path.join(__dirname, '..', 'plugins')
    
    if (watcher) {
        watcher.close()
    }
    
    reloadCallback = callback
    
    watcher = chokidar.watch(pluginsDir, {
        ignored: /node_modules/,
        persistent: true,
        ignoreInitial: true
    })
    
    console.log(chalk.cyan('🔄 Auto-reload watcher started for plugins directory'))
    
    watcher
        .on('change', handleFileChange)
        .on('add', handleFileAdd)
        .on('unlink', handleFileDelete)
        .on('error', error => {
            console.error(chalk.red('❌ Watcher error:'), error)
        })
}

// Function to stop auto-reload watcher
export function stopAutoReload() {
    if (watcher) {
        watcher.close()
        watcher = null
        console.log(chalk.yellow('🛑 Auto-reload watcher stopped'))
    }
}

// Handle file changes
async function handleFileChange(filePath) {
    if (!filePath.endsWith('.js')) return
    
    const fileName = path.basename(filePath)
    const category = getPluginCategory(filePath)
    
    console.log(chalk.blue('\n┌─────────────────────────────────────┐'))
    console.log(chalk.blue('│') + chalk.bold.yellow('   🔄 AUTO-RELOAD TRIGGERED        ') + chalk.blue('│'))
    console.log(chalk.blue('│') + chalk.white(`   📝 File: ${category ? `${category}/` : ''}${fileName}`) + ' '.repeat(Math.max(0, 37 - 9 - (category ? `${category}/` : '').length - fileName.length)) + chalk.blue('│'))
    console.log(chalk.blue('│') + chalk.cyan('   ⚡ Status: Reloading...          ') + chalk.blue('│'))
    console.log(chalk.blue('└─────────────────────────────────────┘'))
    
    try {
        await reloadSinglePlugin(filePath, category, fileName)
        
        console.log(chalk.green('┌─────────────────────────────────────┐'))
        console.log(chalk.green('│') + chalk.bold.white('   ✅ RELOAD SUCCESSFUL            ') + chalk.green('│'))
        console.log(chalk.green('│') + chalk.white(`   📦 Plugin: ${category ? `${category}/` : ''}${fileName}`) + ' '.repeat(Math.max(0, 37 - 12 - (category ? `${category}/` : '').length - fileName.length)) + chalk.green('│'))
        console.log(chalk.green('│') + chalk.magenta('   🚀 Ready to use new version     ') + chalk.green('│'))
        console.log(chalk.green('└─────────────────────────────────────┘\n'))
        
        if (reloadCallback) {
            reloadCallback(globalPlugins)
        }
    } catch (error) {
        console.log(chalk.red('┌─────────────────────────────────────┐'))
        console.log(chalk.red('│') + chalk.bold.white('   ❌ RELOAD FAILED                ') + chalk.red('│'))
        console.log(chalk.red('│') + chalk.white(`   📦 Plugin: ${category ? `${category}/` : ''}${fileName}`) + ' '.repeat(Math.max(0, 37 - 12 - (category ? `${category}/` : '').length - fileName.length)) + chalk.red('│'))
        console.log(chalk.red('│') + chalk.yellow(`   ⚠️  Error: ${error.message.substring(0, 20)}...`) + ' '.repeat(Math.max(0, 37 - 11 - error.message.substring(0, 20).length)) + chalk.red('│'))
        console.log(chalk.red('└─────────────────────────────────────┘\n'))
    }
}

// Handle new file additions
async function handleFileAdd(filePath) {
    if (!filePath.endsWith('.js')) return
    
    const fileName = path.basename(filePath)
    const category = getPluginCategory(filePath)
    
    console.log(chalk.green(`\n➕ New plugin detected: ${category ? `${category}/` : ''}${fileName}`))
    
    try {
        await reloadSinglePlugin(filePath, category, fileName)
        console.log(chalk.green(`✅ New plugin loaded: ${category ? `${category}/` : ''}${fileName}\n`))
        
        if (reloadCallback) {
            reloadCallback(globalPlugins)
        }
    } catch (error) {
        console.error(chalk.red(`❌ Failed to load new plugin: ${fileName}`), error.message)
    }
}

// Handle file deletions
function handleFileDelete(filePath) {
    if (!filePath.endsWith('.js')) return
    
    const fileName = path.basename(filePath)
    const category = getPluginCategory(filePath)
    
    console.log(chalk.red(`\n🗑️  Plugin deleted: ${category ? `${category}/` : ''}${fileName}`))
    
    // Remove from global plugins array
    const pluginName = fileName.replace('.js', '')
    const index = globalPlugins.findIndex(p => 
        p.command === pluginName || 
        (p.aliases && p.aliases.includes(pluginName)) ||
        (category && p.category === category && p.command === pluginName)
    )
    
    if (index !== -1) {
        globalPlugins.splice(index, 1)
        console.log(chalk.yellow(`🔄 Plugin removed from memory: ${category ? `${category}/` : ''}${fileName}\n`))
        
        if (reloadCallback) {
            reloadCallback(globalPlugins)
        }
    }
}

// Reload a single plugin
async function reloadSinglePlugin(filePath, category, fileName) {
    // Remove existing plugin from global array
    const pluginName = fileName.replace('.js', '')
    const existingIndex = globalPlugins.findIndex(p => 
        (p.command === pluginName && (!category || p.category === category)) ||
        (p.aliases && p.aliases.includes(pluginName) && (!category || p.category === category))
    )
    
    if (existingIndex !== -1) {
        globalPlugins.splice(existingIndex, 1)
    }
    
    // Load the plugin
    const tempPlugins = []
    await loadSinglePlugin(filePath, category, fileName, tempPlugins)
    
    // Add to global plugins
    if (tempPlugins.length > 0) {
        globalPlugins.push(...tempPlugins)
    }
}

// Get plugin category from file path
function getPluginCategory(filePath) {
    const pluginsDir = path.join(__dirname, '..', 'plugins')
    const relativePath = path.relative(pluginsDir, filePath)
    const pathParts = relativePath.split(path.sep)
    
    if (pathParts.length > 1) {
        return pathParts[0]
    }
    return null
}

// Export global plugins for external access
export function getLoadedPlugins() {
    return globalPlugins
}
