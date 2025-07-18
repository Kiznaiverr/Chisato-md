import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import chokidar from 'chokidar'
import logger from './logger.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let globalPlugins = []
let watcher = null
let reloadCallback = null
const moduleCache = new Map()

export async function loadPlugins() {
    const pluginsDir = path.join(__dirname, '..', 'plugins')
    const plugins = []

    if (!fs.existsSync(pluginsDir)) {
        fs.mkdirSync(pluginsDir, { recursive: true })
        logger.system('Created plugins directory')
        return plugins
    }

    logger.plugin('Loading plugins...')
    await loadFromDirectory(pluginsDir)
    
    globalPlugins.length = 0
    globalPlugins.push(...plugins)
    
    logger.plugin(`Successfully loaded ${plugins.length} plugins`)
    return plugins

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
                    logger.error(`Failed to load ${pluginName}: ${error.message}`)
                }
            }
        }
    }
}

async function loadSinglePlugin(itemPath, category, fileName, plugins) {
    const cacheKey = `file://${itemPath}`
    if (moduleCache.has(cacheKey)) {
        delete moduleCache.get(cacheKey)
    }
    
    const plugin = await import(`${cacheKey}?t=${Date.now()}`)
    
    if (plugin.default && typeof plugin.default === 'object') {
        if (category && !plugin.default.category) {
            plugin.default.category = category
        }
        
        moduleCache.set(cacheKey, plugin.default)
        plugins.push(plugin.default)
    }
}

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
    
    logger.system('Auto-reload watcher started')
    
    watcher
        .on('change', handleFileChange)
        .on('add', handleFileAdd)
        .on('unlink', handleFileDelete)
        .on('error', error => {
            logger.error('Watcher error:', error)
        })
}

export function stopAutoReload() {
    if (watcher) {
        watcher.close()
        watcher = null
        logger.system('Auto-reload watcher stopped')
    }
}

async function handleFileChange(filePath) {
    if (!filePath.endsWith('.js')) return
    
    const fileName = path.basename(filePath)
    const category = getPluginCategory(filePath)
    const pluginName = category ? `${category}/${fileName}` : fileName
    
    logger.plugin(`Reloading ${pluginName}...`)
    
    try {
        await reloadSinglePlugin(filePath, category, fileName)
        
        if (reloadCallback) {
            reloadCallback(globalPlugins)
        }
        
        logger.plugin(`Successfully reloaded ${pluginName}`)
    } catch (error) {
        logger.plugin(`Failed to reload ${pluginName}: ${error?.message || error}`, 'ERROR')
    }
}

async function handleFileAdd(filePath) {
    if (!filePath.endsWith('.js')) return
    
    const fileName = path.basename(filePath)
    const category = getPluginCategory(filePath)
    const pluginName = category ? `${category}/${fileName}` : fileName
    
    logger.plugin(`Loading new plugin ${pluginName}...`)
    
    try {
        await reloadSinglePlugin(filePath, category, fileName)
        
        if (reloadCallback) {
            reloadCallback(globalPlugins)
        }
        
        logger.plugin(`Successfully loaded new plugin ${pluginName}`)
    } catch (error) {
        logger.plugin(`Failed to load ${pluginName}: ${error?.message || error}`, 'ERROR')
    }
}

function handleFileDelete(filePath) {
    if (!filePath.endsWith('.js')) return
    
    const fileName = path.basename(filePath)
    const category = getPluginCategory(filePath)
    const pluginName = category ? `${category}/${fileName}` : fileName
    
    logger.plugin(`Plugin deleted: ${pluginName}`)
    
    const commandName = fileName.replace('.js', '')
    const index = globalPlugins.findIndex(p => 
        p.command === commandName || 
        (p.aliases && p.aliases.includes(commandName)) ||
        (category && p.category === category && p.command === commandName)
    )
    
    if (index !== -1) {
        globalPlugins.splice(index, 1)
        logger.plugin(`Plugin removed from memory: ${pluginName}`)
        
        if (reloadCallback) {
            reloadCallback(globalPlugins)
        }
    }
}

async function reloadSinglePlugin(filePath, category, fileName) {
    const pluginName = fileName.replace('.js', '')
    const existingIndex = globalPlugins.findIndex(p => 
        (p.command === pluginName && (!category || p.category === category)) ||
        (p.aliases && p.aliases.includes(pluginName) && (!category || p.category === category))
    )
    
    if (existingIndex !== -1) {
        globalPlugins.splice(existingIndex, 1)
    }
    
    const tempPlugins = []
    
    try {
        await loadSinglePlugin(filePath, category, fileName, tempPlugins)
        
        if (tempPlugins.length > 0) {
            globalPlugins.push(...tempPlugins)
        }
    } catch (error) {
        if (existingIndex !== -1) {
        }
        throw error // Re-throw to be caught by caller
    }
}

function getPluginCategory(filePath) {
    const pluginsDir = path.join(__dirname, '..', 'plugins')
    const relativePath = path.relative(pluginsDir, filePath)
    const pathParts = relativePath.split(path.sep)
    
    if (pathParts.length > 1) {
        return pathParts[0]
    }
    return null
}

export function getLoadedPlugins() {
    return globalPlugins
}
