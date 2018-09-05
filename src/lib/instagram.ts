import path from 'path'

import Configstore from 'configstore'
import _ from 'lodash'
import inquirer from './inquirer'

import ICredentials from '../models/app/ICredentials'
import app from './app'
import files from './files'

const CLI = require('clui')
const Spinner = CLI.Spinner

const pkg = require('../../package.json')
const conf = new Configstore(pkg.name)

const Client = require('instagram-private-api').V1

const USERNAME_KEY = 'instagram.username'
const PASSWORD_KEY = 'instagram.password'

export default class Instagram {
    public static getUsername(): string {
        return conf.get(USERNAME_KEY) as string
    }

    /**
     * Check if an Instagram cookie exists. If yes, returns an existing session. If no, creates a new cookie and returns a new session.
     * 
     * @returns An Instagram session
     */
    public static async getInstagramSession(): Promise<any> {
        const device = new Client.Device(`${app.getAppName()}-${app.getAppVersion()}`)
        
        let username = conf.get(USERNAME_KEY)
        let password = conf.get(PASSWORD_KEY)

        if (!username || !password) {
            const credentials = await this.setInstagramCredentials()
            username = credentials.username
            password = credentials.password
        }        

        const cookiePath = files.getCookiePath(username)
        const storage = new Client.CookieFileStorage(cookiePath)
        
        const status = new Spinner('Retrieving Instagram session. Please wait...')
        status.start()

        let session;

        if (files.directoryExists(cookiePath)) {
            session = new Client.Session(device, storage) 
        } else {
            session = await Client.Session.create(device, storage, username, password)
        }
        
        status.stop()
        return session
    }

    public static async setInstagramCredentials(): Promise<ICredentials> {
        const credentials = await inquirer.askInstagramCredentials() as ICredentials
        conf.set('instagram.username', credentials.username)
        conf.set('instagram.password', credentials.password)
        return credentials
    }

    public static async unsavePost(postId: string): Promise<void> {
        const session = await this.getInstagramSession()

        await Client.Save.destroy(session, postId)
    }
}
