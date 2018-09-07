import CLI from 'clui'

import config from './config'
import files from './files'
import inquirer from './inquirer'
import ICredentials from '../models/app/ICredentials'
import Posts from '../models/vendor/instagram/Posts'

const Spinner = CLI.Spinner

// tslint:disable-next-line:no-var-requires
const Client = require('instagram-private-api').V1

// const INSTAGRAM_PAGE_SIZE: number = 18

const getMedia = async (feed: any, posts: Posts): Promise<Posts> => {
    const results = await feed.get()

    for (const result of results) {
        posts.addRawPost(result._params)
    }

    if (!feed.isMoreAvailable()) {
        return posts
    }

    return await getMedia(feed, posts)
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

    public static async getAccountNumOfPosts(username: string): Promise<number> {
        const account = await this.getAccount(username)

        return +account.mediaCount
    }

    /**
     * Retrieves all the posts from an Instagram account
     * @param username An Instagram username
     */
    public static async getAccountFeed(username: string): Promise<Posts> {
        const posts: Posts = new Posts()

        const session = await this.getInstagramSession()
        const accountId = await this.getAccountId(username)
        const feed = new Client.Feed.UserMedia(session, accountId)

        await getMedia(feed, posts)

        return posts
    }

    /**
     * Gets the username of the Instagram account
     */
    public static getUsername(): string {
        return config.getInstagramUsername()!
    }

    /**
     * Check if an Instagram cookie exists. If yes, returns an existing session.
     * If no, creates a new cookie and returns a new session.
     *
     * @returns An Instagram session
     */
    public static async getInstagramSession(): Promise<any> {
        let username = config.getInstagramUsername()
        let password = config.getInstagramPassword()

        if (!username || !password) {
            const credentials = await this.setInstagramCredentials()
            username = credentials.username
            password = credentials.password
        }

        const cookiePath = files.getCookiePath(username)
        const storage = new Client.CookieFileStorage(cookiePath)

        const status = new Spinner('Retrieving Instagram session. Please wait...')
        status.start()

        let session: any;
        const device = new Client.Device(`${config.getInstagramUsername()}`)

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

        await getMedia(feed, posts)

        return posts
    }

    /**
     * Stores the credentials locally on the user's machine
     * @returns An object containing the credentials
     */
    public static async setInstagramCredentials(): Promise<ICredentials> {
        const credentials = await inquirer.askInstagramCredentials() as ICredentials
        config.setInstagramCredentials(credentials)
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
