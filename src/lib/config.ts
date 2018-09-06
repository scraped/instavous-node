import Configstore from 'configstore'

import app from './app'
import ICredentials from '../models/app/ICredentials';

const conf = new Configstore(app.getAppName())

const INSTAGRAM_USERNAME_KEY = 'instagram.username'
const INSTAGRAM_PASSWORD_KEY = 'instagram.password'

export default class Config {
    public static getInstagramUsername(): string | null {
        try {
           const username = conf.get(INSTAGRAM_USERNAME_KEY)
           return username
        } catch (err) {
            return null
        }
    }
    
    public static getInstagramPassword(): string | null {
        try {
            const password = conf.get(INSTAGRAM_PASSWORD_KEY)
            return password
        } catch (err) {
            return null
        }
    }

    public static setInstagramCredentials(credentials: ICredentials): void {
        conf.set(INSTAGRAM_USERNAME_KEY, credentials.username)
        conf.set(INSTAGRAM_PASSWORD_KEY, credentials.password)
    }
}