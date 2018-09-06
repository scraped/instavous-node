import fs from 'fs-extra'
import os from 'os'
import path from 'path'
import uuidv4 from 'uuid/v4'

import app from './app'

export default class Files {
    public static createDirectory(dir: string): void {
        if (!fs.existsSync(dir)) {
            fs.ensureDirSync(dir)
        }
    }

    public static directoryExists(filePath: string): boolean {
        try {
            return fs.statSync(filePath).isDirectory()
        } catch (err) {
            return false
        }
    }

    public static fileExists(filePath: string): boolean {
        try {
            return fs.statSync(filePath).isFile()
        } catch (err) {
            return false
        }
    }

    public static getAppDirectory(): string {
        const dir = path.join(os.homedir(), `.${app.getAppName()}`)
        return this.getDirectory(dir)
    }

    public static getCookieDirectory(): string {
        const dir = path.join(this.getAppDirectory(), 'cookies')
        return this.getDirectory(dir)
    }

    public static getCookiePath(username: string): string {
        const filePath = path.join(this.getCookieDirectory(), `${username}.json`)
        return filePath
    }

    public static getCurrentDirectoryBase(): string {
        return path.basename(process.cwd())
    }

    public static getTemporaryCookie(): string {
        const dir = os.tmpdir()
        const fileName = `${uuidv4()}.json`

        return path.join(dir, fileName)
    }

    public static getUsersDirectory(): string {
        const dir = path.join(this.getCurrentDirectoryBase(), 'users')
        return this.getDirectory(dir)
    }

    private static getDirectory(dir: string): string {
        this.createDirectory(dir)
        return dir
    }
}