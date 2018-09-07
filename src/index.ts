#!/usr/bin/env node

import chalk from 'chalk'
import clear from 'clear'
import figlet from 'figlet'

import inquirer from './lib/inquirer'
import Instagram from './lib/instagram'

const run = async () => {
    clear()
    console.log(
        chalk.yellow(
            figlet.textSync('Instavous', { horizontalLayout: 'full' })
        )
    )

    const result: string = (await inquirer.askTask()).task

    let answers: any
    let temp: any
    let posts: any

    switch (result) {
        case 'accountfeed':
            answers = await inquirer.askAccountFeedQuestions()
            process.stdout.write(`\n`)

            const username = answers.username
            temp = answers.temp

            posts = await Instagram.getAccountFeed(username)
            await posts.downloadImages(temp)

            break
        case 'savedmedia':
            answers = await inquirer.askSavedMedia()
            process.stdout.write(`\n`)

            temp = answers.temp
            posts = await Instagram.getSavedMedia()
            await posts.downloadImages(temp)

            break
        default:
            break
    }
}

run()
