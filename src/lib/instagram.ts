import Configstore from 'configstore'

import app from './app'
import files from './files'
import inquirer from './inquirer'
import ICredentials from '../models/app/ICredentials'
import Posts from '../models/vendor/instagram/Posts'
import { sleep } from '../lib/utils'

const CLI = require('clui')
const Spinner = CLI.Spinner

const conf = new Configstore(app.getAppName())

const Client = require('instagram-private-api').V1

const USERNAME_KEY = 'instagram.username'
const PASSWORD_KEY = 'instagram.password'

const getAccountFeed = async (feed: any, posts: Posts, counter: any, count: number = 0): Promise<Posts> => {
    const results = await feed.get()        

    for (const result of results) {
        const raw = result._params
        posts.addRawPost(raw)

        counter.message(`${++count} posts found`)
    }

    if (!feed.isMoreAvailable()) {
        await sleep (1000)
        process.stdout.write(`\n`)
        counter.stop()
        return posts
    }

    return getAccountFeed(feed, posts, counter, count)
}

const getSavedMedia = async (feed: any, posts: Posts): Promise<Posts> => {
    const results = feed.get()

    for (const result of results) {
        const raw = result._params
        posts.addRawPost(raw)
    }

    if (!feed.isMoreAvailable()) {
        console.log('done')
        return posts
    }
    console.log('More')

    return await getSavedMedia(feed, posts)
}

export default class Instagram {
    /**
     * Returns the account ID for a given username
     * @param username An Instagram username
     * @returns        The account ID
     */
    public static async getAccountId(username: string): Promise<string> {
        const session = await this.getInstagramSession()
        const response = await Client.Account.searchForUser(session, username)
        return response.id
    }

    /**
     * Retrieves the account information for a given username as JSON
     * @param username An Instagram username
     */
    public static async getAccount(username: string): Promise<any> {
        const session = await this.getInstagramSession()
        const accountId = await this.getAccountId(username)
        const response = await Client.Account.getById(session, accountId)

        return response._params
    }

    /**
     * Retrieves all the posts from an Instagram account
     * @param username An Instagram username
     */
    public static async getAccountFeed(username: string): Promise<Posts> {
        const posts: Posts = new Posts()

        const session = await this.getInstagramSession()
        const accountId = await this.getAccountId(username)
        const counter = new Spinner(`0 posts found`, ['⣾','⣽','⣻','⢿','⡿','⣟','⣯','⣷'])

        const feed = new Client.Feed.UserMedia(session, accountId, 10)

        counter.start()
        return await getAccountFeed(feed, posts, counter)        
    }

    /**
     * Gets the username of the Instagram account
     */
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

    /**
     * Gets all the posts saved by the current Instagram user
     */
    public static async getSavedMedia(): Promise<Posts> {
        const posts: Posts = new Posts()

        const session = await this.getInstagramSession()
        const feed = new Client.Feed.SavedMedia(session, 10)
        
        await getSavedMedia(feed, posts)

        return posts
    }

    /**
     * Stores the credentials locally on the user's machine
     * @returns An object containing the credentials
     */
    public static async setInstagramCredentials(): Promise<ICredentials> {
        const credentials = await inquirer.askInstagramCredentials() as ICredentials
        conf.set('instagram.username', credentials.username)
        conf.set('instagram.password', credentials.password)
        return credentials
    }

    /**
     * Unsaves a post on Instagram
     * @param postId The ID of the post on Instagram
     */
    public static async unsavePost(postId: string): Promise<void> {
        const session = await this.getInstagramSession()

        await Client.Save.destroy(session, postId)
    }
}
