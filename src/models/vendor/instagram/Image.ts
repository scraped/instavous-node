import fs from 'fs-extra'
import os from 'os'
import path from 'path'
import url from 'url'

import axios from 'axios'
import moment, { Moment } from 'moment'

import files from '../../../lib/files'

const getFirstCharacter = (str: string) => {
    const index = str.search(/[A-Za-z\d]/)
    const firstAlphanumeric = str.charAt(index)
    const startsWithNumber = /^\d/.test(firstAlphanumeric)

    return startsWithNumber ? '0-9' : firstAlphanumeric.toUpperCase()
}

export default class Image {
    private _index: number
    private _media: string
    private _timestamp: Moment

    /**
     * The name of the file once it has been downloaded from Instagram.
     * Combines the username, the timestamp of the photo, the index, and the original file name.
     *
     * @returns The file name
     */
    public get FileName(): string {
        const parsed = url.parse(this._media)
        const original = path.basename(parsed.pathname!)

        return `${this.AccountName}-`
                + `${this._timestamp.format('YYYYMMDD')}-`
                + `${this._index}-`
                + `${original}`
    }

    /**
     * The path where the file will be stored locally.
     *
     * @returns The file path
     */
    public get FilePath(): string {
        const firstCharacter = getFirstCharacter(this.AccountName)
        // Acount name
        const year = this._timestamp.format('YYYY')
        const month = this._timestamp.format('MM-MMM')
        const day = this._timestamp.format('DD')

        const filePath = path.join(firstCharacter, this.AccountName, year, month, day, 'Misc')

        return filePath
    }

    /**
     * Constructs the local file path
     *
     * @returns The local file path
     */
    public get LocalPath(): string {
        const localPath = path.join(files.getUsersDirectory(), this.FilePath)
        files.createDirectory(localPath)
        return path.join(localPath, this.FileName)
    }

    /**
     * The original URL of the photo on Instagram
     */
    public get Url(): string {
        return this._media
    }

    /**
     * The path where the file will be stored temporarily on the local drive
     */
    public get TempPath(): string {
        return path.join(os.tmpdir(), this.FileName)
    }

    /**
     * The timestamp of the image as a Date object
     *
     * @returns A JavaScript date
     */
    public get TimeStamp(): Date {
        return this._timestamp.toDate()
    }

    constructor(public InstagramPostId: string,
                public AccountName: string,
                media: string,
                timestamp: number,
                index: number = 1) {
        this._index = index
        this._media = media.indexOf('?') === -1 ? media : media.substring(0, media.indexOf('?'))
        this._timestamp = moment(timestamp)
    }

    /**
     * Outputs certain properties to the console
     */
    public ToString(): void {
        let output =  `\tURL:       ${this.Url}\n`
            output += `\tFile Name: ${this.FileName}\n`
            output += `\tFile Path: ${this.FilePath}\n`

        console.log(output)
    }

    /**
     * Builds an Image object
     *
     * @param instagramPostId The ID of the post from which the Image came
     * @param accountName     The name of the account
     * @param media           The image URL
     * @param timestamp       The post timestamp
     *
     * @returns An image object
     */
    public static buildImage(instagramPostId: string,
                             accountName: string,
                             media: string,
                             timestamp: number): Image {
        const image = new Image(instagramPostId,
                accountName,
                media,
                timestamp)

        return image
    }

    /**
     * SOURCE: https://futurestud.io/tutorials/download-files-images-with-axios-in-node-js
     */
    public async downloadImage(destPath: string): Promise<any> {
        if (files.fileExists(destPath)) {
            return new Promise((resolve, reject) => {
                resolve()
            })
        }

        await axios({
            method: 'GET',
            url: this._media,
            responseType: 'stream'
        }).then((response: any) => {
            response.data.pipe(fs.createWriteStream(destPath))

            return new Promise((resolve, reject) => {
                response.data.on('end', () => {
                  resolve()
                })
    
                response.data.on('error', () => {
                  reject()
                })
              })
        }).catch((error: any) => {
            // console.log(error.response)
        })
    }
}
