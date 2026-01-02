import fs from 'fs'
import path from 'path'

const LOG_FILE = path.join(process.cwd(), 'orchestration.log')

export function log(message: string, type: 'INFO' | 'ERROR' | 'WARN' = 'INFO') {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] [${type}] ${message}\n`

    try {
        fs.appendFileSync(LOG_FILE, logMessage)
        console.log(logMessage.trim())
    } catch (err) {
        console.error('Failed to write to log file:', err)
    }
}

export const logger = {
    info: (msg: string) => log(msg, 'INFO'),
    error: (msg: string) => log(msg, 'ERROR'),
    warn: (msg: string) => log(msg, 'WARN')
}
