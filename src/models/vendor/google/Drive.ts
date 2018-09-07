import fs from 'fs'
import readline from 'readline'

import {google, drive_v3} from 'googleapis'
import mime from 'mime-types'

import Image from '../instagram/Image'
import { sleep } from '../../../lib/utils'

const FOLDER_MIME_TYPE = 'application/vnd.google-apps.folder'

const INSTAGRAM_FOLDER_ID = process.env.INSTAGRAM_FOLDER_ID as string

export default class Drive {
    private static drive: drive_v3.Drive = google.drive('v3')

    private static async buildAuth() {
        // set scopes
        const scopes = 'https://www.googleapis.com/auth/drive'

        // Create JWT Auth Client
        const auth = await google.auth.getClient({
            scopes: scopes,
        })

        return auth
    }

    public static async checkIfFolderExists(folderName: string, parentFolderId: string): Promise<boolean> {
        const response = await this.drive.files.list({
            auth: await this.buildAuth(),
            pageSize: 1,
            q: `mimeType = 'application/vnd.google-apps.folder'`
                + `and name = '${folderName}'`
                + ` and '${parentFolderId}' in parents`,
        })
        const files = response.data.files!

        return files.length > 0;
    }

    public static async getFolderId(folderName: string, parentFolderId: string): Promise<string | null> {
        const exists = await this.checkIfFolderExists(folderName, parentFolderId)

        if (!exists) {
            console.error(`Folder '${folderName}' was not found in Google Drive` )
            return null
        }

        const response = await this.drive.files.list({
            auth: await this.buildAuth(),
            pageSize: 1,
            q: `mimeType = 'application/vnd.google-apps.folder'`
                + ` and name = '${folderName}'`
                + ` and '${parentFolderId}' in parents`,
        })
        const files = response.data.files!

        return files.length === 0 ? '' : files[0].id!
    }

    public static async createNewFolder(folderName: string, parentFolderId: string): Promise<string> {
        const fileMetadata = {
            name: `${folderName}`,
            mimeType: FOLDER_MIME_TYPE,
            parents: [parentFolderId],
        }

        const response = await this.drive.files.create({
            auth: await this.buildAuth(),
            requestBody: fileMetadata,
        })

        return response.data.id as string
    }

    public static async createNewFolders(filePath: string): Promise<string> {
        const split = filePath.split('/')

        return await this.createNewFoldersRecursive(split, INSTAGRAM_FOLDER_ID)
    }

    private static async createNewFoldersRecursive(newFolders: string[], parentFolderId: string): Promise<string> {
        const folder = newFolders.shift()!

        const exists = await this.checkIfFolderExists(folder, parentFolderId)
        if (exists) {
            parentFolderId = await this.getFolderId(folder, parentFolderId) as string
        } else {
            parentFolderId = await this.createNewFolder(folder, parentFolderId)
        }

        if (!newFolders.length) return parentFolderId

        return await this.createNewFoldersRecursive(newFolders, parentFolderId)
    }

    private static async buildAlphabetizedFolders(): Promise<void> {
        const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
                          'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

        for (const letter of alphabet) {
            // First check if folder already exists
            const exists = await this.checkIfFolderExists(letter, INSTAGRAM_FOLDER_ID)
            if (exists) continue

            console.log(`Creating folder for "${letter}"...`)

            const id = await this.createNewFolder(letter, INSTAGRAM_FOLDER_ID)
            console.log(id)

            // Wait half-second second...
            await sleep(500)
        }
    }

    public static async uploadFiles(images: Image[]): Promise<string[]> {
        await sleep(1000)

        const newImageIds: string[] = []

        for (const i of images) {
            const id = await this.uploadFile(i)
            newImageIds.push(id)
        }

        return newImageIds
    }

    public static async uploadFile(image: Image): Promise<string> {
        // Get file size
        const fileSize = fs.statSync(image.TempPath).size

        // Create folders if they do not already exist
        const parentFolderId = await this.createNewFolders(image.FilePath)

        const fileMetadata = {
            name: image.FileName,
            parents: [parentFolderId],
        }

        const media = {
            mimeType: mime.lookup(image.FileName),
            body: fs.createReadStream(image.TempPath)
        }

        console.log(`Uploading "${image.FileName}"...`)

        const res = await this.drive.files.create({
            auth: await this.buildAuth(),
            requestBody: fileMetadata,
            media: media,
        }, {
            onUploadProgress: (evt) => {
                const progress = (evt.bytesRead / fileSize) * 100;
                readline.clearLine(process.stdout, 0)
                readline.cursorTo(process.stdout, 0)
                process.stdout.write(`${Math.round(progress)}% complete\n`)
            }
        })

        console.log(`"${image.FileName}" Uploaded!\n`)
        await sleep(500)

        return res.data.id!
    }
}
