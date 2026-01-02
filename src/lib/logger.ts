import fs from 'fs'
import path from 'path'

const LOG_FILE = path.join(process.cwd(), 'orchestration.log')

export function log(message: string, type: 'INFO' | 'ERROR' | 'WARN' = 'INFO') {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] [${type}] ${message}`

    // Always log to console
    if (type === 'ERROR') {
        console.error(logMessage)
    } else if (type === 'WARN') {
        console.warn(logMessage)
    } else {
        console.log(logMessage)
    }

    // Try to write to file (will fail on Vercel/EROFS)
    try {
        fs.appendFileSync(LOG_FILE, logMessage + '\n')
    } catch (err: any) {
        // Only log write errors if they aren't Read-only Filesystem errors (common on Vercel)
        if (err.code !== 'EROFS') {
            console.error('Failed to write to log file:', err.message)
        }
    }
}

export const logger = {
    info: (msg: string) => log(msg, 'INFO'),
    error: (msg: string) => log(msg, 'ERROR'),
    warn: (msg: string) => log(msg, 'WARN')
}
