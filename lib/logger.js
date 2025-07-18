import chalk from 'chalk'

class Logger {
    constructor() {
        this.timezone = 'Asia/Jakarta'
    }

    getTimestamp() {
        return new Date().toLocaleString('id-ID', {
            timeZone: this.timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        })
    }

    formatMessage(level, module, message) {
        const timestamp = chalk.gray(`[${this.getTimestamp()}]`)
        const levelFormatted = this.formatLevel(level)
        const moduleFormatted = module ? chalk.magenta(`[${module}]`) : ''
        
        return `${timestamp} ${levelFormatted} ${moduleFormatted} ${message}`
    }

    formatLevel(level) {
        switch (level.toUpperCase()) {
            case 'ERROR': return chalk.red('[ERROR]')
            case 'WARN': return chalk.yellow('[WARN]')
            case 'INFO': return chalk.blue('[INFO]')
            case 'SUCCESS': return chalk.green('[SUCCESS]')
            case 'DEBUG': return chalk.gray('[DEBUG]')
            case 'SYSTEM': return chalk.cyan('[SYSTEM]')
            default: return chalk.white(`[${level}]`)
        }
    }

    system(message) {
        console.log(this.formatMessage('SYSTEM', null, message))
    }

    connection(status, details = '') {
        const level = status === 'connected' ? 'SUCCESS' : status === 'disconnected' ? 'WARN' : 'INFO'
        const message = `WhatsApp ${status} ${details}`.trim()
        console.log(this.formatMessage(level, 'CONNECTION', message))
    }

    /**
     * Command Detection & Execution Logging
     * 
     * This method logs all command-related activities:
     * - Command detection (found/not found)
     * - Command execution (success/error)
     * - User and chat context
     * 
     * Status types:
     * - 'detected': Command found and ready to execute [SUCCESS]
     * - 'not_found': Command not recognized [WARN] 
     * - 'executed': Command completed successfully [SUCCESS]
     * - 'error': Command execution failed [ERROR]
     * 
     * Example logs:
     * [SUCCESS] [COMMAND] Command "help" detected by John in GROUP
     * [WARN] [COMMAND] Command "invalidcmd" not found by John in PRIVATE
     * [SUCCESS] [COMMAND] Command "ping" executed by John in GROUP
     * [ERROR] [COMMAND] Command "test" failed by John in PRIVATE
     */
    command(command, status, chatType, user) {
        let level = 'INFO'
        let statusText = status
        
        switch(status) {
            case 'detected':
                level = 'SUCCESS'
                statusText = 'executed'
                break
            case 'not_found':
                level = 'WARN'
                statusText = 'not found'
                break
            case 'executed':
                level = 'SUCCESS'
                statusText = 'executed'
                break
            case 'error':
                level = 'ERROR'
                statusText = 'failed'
                break
            default:
                statusText = status
        }
        
        const chat = chatType === 'group' ? 'GROUP' : 'PRIVATE'
        const message = `Command "${command}" ${statusText} by ${user} in ${chat}`
        console.log(this.formatMessage(level, 'COMMAND', message))
    }

    commandSummary(message) {
        console.log(this.formatMessage('INFO', 'CMD-DETECT', message))
    }

    plugin(message, status = 'INFO') {
        const level = status === 'ERROR' ? 'ERROR' : 'INFO'
        console.log(this.formatMessage(level, 'PLUGIN', message))
    }

    database(operation, status = 'success', details = '') {
        const level = status === 'error' ? 'ERROR' : 'INFO'
        const message = `Database ${operation} ${status} ${details}`.trim()
        console.log(this.formatMessage(level, 'DATABASE', message))
    }

    group(groupName, action, user = null) {
        const message = user 
            ? `Group "${groupName}" - ${action} by ${user}`
            : `Group "${groupName}" - ${action}`
        console.log(this.formatMessage('INFO', 'GROUP', message))
    }

    security(event, user, action = '') {
        const message = `Security event: ${event} by ${user} ${action}`.trim()
        console.log(this.formatMessage('WARN', 'SECURITY', message))
    }

    error(module, error, context = '') {
        const errorMessage = error?.message || error?.toString() || 'Unknown error'
        const message = `${module}: ${errorMessage} ${context}`.trim()
        console.log(this.formatMessage('ERROR', 'ERROR', message))
        if (error?.stack && process.env.NODE_ENV === 'development') {
            console.log(chalk.gray(error.stack))
        }
    }

    warn(message, module = null) {
        console.log(this.formatMessage('WARN', module, message))
    }

    success(message, module = null) {
        console.log(this.formatMessage('SUCCESS', module, message))
    }

    info(message, module = null) {
        console.log(this.formatMessage('INFO', module, message))
    }

    debug(message, module = null) {
        if (process.env.NODE_ENV === 'development') {
            console.log(this.formatMessage('DEBUG', module, message))
        }
    }

    banner() {
        const banner = `
${chalk.cyan('┌──────────────────────────────────────────────┐')}
${chalk.cyan('│')}                                              ${chalk.cyan('│')}
${chalk.cyan('│')}                 ${chalk.bold('CHISATO-MD')}                 ${chalk.cyan('│')}
${chalk.cyan('│')}            ${chalk.gray('WhatsApp Bot System')}            ${chalk.cyan('│')}
${chalk.cyan('│')}                                              ${chalk.cyan('│')}
${chalk.cyan('│')}  ${chalk.gray('Version:')} ${chalk.white('2.0.0')}                             ${chalk.cyan('│')}
${chalk.cyan('│')}  ${chalk.gray('Developer:')} ${chalk.white('Kiznavierr')}                      ${chalk.cyan('│')}
${chalk.cyan('│')}                                              ${chalk.cyan('│')}
${chalk.cyan('└──────────────────────────────────────────────┘')}`
        
        console.log(banner)
        console.log(chalk.gray(`Starting at ${this.getTimestamp()}`))
        console.log()
    }

    separator(title = null) {
        if (title) {
            const line = '─'.repeat(Math.max(0, 40 - title.length))
            console.log(chalk.gray(`\n${line} ${chalk.bold(title)} ${line}`))
        } else {
            console.log(chalk.gray('─'.repeat(80)))
        }
    }

    commandStats(totalCommands, successCount, errorCount) {
        const successRate = totalCommands > 0 ? ((successCount / totalCommands) * 100).toFixed(1) : 0
        const message = `Commands: ${totalCommands} total | ${successCount} success | ${errorCount} errors | ${successRate}% success rate`
        console.log(this.formatMessage('INFO', 'STATS', message))
    }
}

export default new Logger()
