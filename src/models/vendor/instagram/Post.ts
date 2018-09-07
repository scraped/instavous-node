import moment, { Moment } from 'moment'

import Image from './Image'

export default class Post {
    private _images: Image[]
    private _timestamp: Moment

    /**
     * All of the images included in the post
     *
     * @returns An array of Images
     */
    public get Images(): Image[] {
        return this._images
    }

    /**
     * The timestamp of the post as a JavaScript Date object
     */
    public get Timestamp(): Date {
        return this._timestamp.toDate()
    }

    constructor(public PostId: string,
                public Username: string,
                images: Image[],
                timestamp: number) {
        this._images = images
        this._timestamp = moment(timestamp)
    }

    /**
     * Outputs certain properties to the console
     */
    public ToString(): void {
        let output =  `Post ID: ${this.PostId}\n`
            output += `Account: ${this.Username}\n`
            output += `Images:`

        console.log(output)

        for (const image of this.Images) {
            image.ToString()
        }
    }
}
