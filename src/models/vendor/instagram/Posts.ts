import CLI from 'clui'
import { flattenDeep, uniq } from 'lodash'

import Image from './Image'
import Post from './Post'
import Instagram from '../../../lib/instagram'
import { sleep } from '../../../lib/utils'

const Spinner = CLI.Spinner

export default class Posts {
    private _posts: Post[]

    public get NumOfImages(): number {
        return this.getImagesFromPosts().length
    }

    public get NumOfPosts(): number {
        return this._posts.length
    }

    constructor() {
        this._posts = []
    }

    /**
     * Adds a Post to the collection
     *
     * @param post The post to add to the collection
     * @returns    The post that was added to the collection
     */
    public addPost(post: Post): Post {
        this._posts.push(post)
        return post
    }

    /**
     * Creates a post from raw JSON and adds it to the collection
     * @param raw The original JSON that represents the post
     * @returns   A Post object
     */
    public addRawPost(raw: any): Post {
        const id = raw.id
        const timestamp = +raw.takenAt

        const user = raw.user
        const username = user.username

        const hasMultipleImages = raw.carouselMedia.length > 0
        let images: Image[] = []

        if (hasMultipleImages) {
            images =
                raw.carouselMedia.map((i: any, x: number) => {
                    return new Image(id, username, i._params.images[0].url, timestamp, x + 1)
                })
        } else {
            images = [new Image(id, username, raw.images[0].url, timestamp)]
        }

        const post = new Post(id, username, images, timestamp)

        return this.addPost(post)
    }

    /**
     * Retrieves a specific post from the collection
     * @param postId The ID of the post
     * @returns      The post
     */
    public getPost(postId: string): Post {
        return this._posts.find((post) => post.PostId === postId)!
    }

    /**
     * Downloads all images to the hard disk
     * @param temp If true, save images to their temporary directory
     */
    public async downloadImages(temp: boolean): Promise<void> {
        const images = this.getImagesFromPosts()
        const total = this.NumOfImages

        const counter = new Spinner(`0/${total} images downloaded`)

        let index = 1
        counter.start()
        await Promise.all(images.map(async (image) => {
            const destPath = temp ? image.TempPath : image.LocalPath
            image.downloadImage(destPath)
            counter.message(`${index++}/${total} images downloaded`)
        }))
        await sleep(1000)
        process.stdout.write(`\n`)
        counter.stop()
    }

    /**
     * Extracts individual images from multiple posts in a single array
     */
    public getImagesFromPosts(): Image[] {
        return flattenDeep(this._posts.map((post) => post.Images.map((image) => image))) as Image[]
    }

    /**
     * Outputs select properties to the console
     */
    public toString() {
        let output =  `Total posts:  ${this.NumOfPosts}\n`
            output += `Total images: ${this.NumOfImages}\n`

        console.log(output)
    }

    /**
     * Unsaves all posts in the collection on Instagram
     */
    public async unsaveMedia(): Promise<void> {
        const postIds = uniq(this._posts.map((post) => post.PostId))

        await Promise.all(postIds.map(async (id) =>  Instagram.unsavePost(id)))
    }
}
