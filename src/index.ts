#!/usr/bin/env node

import chalk from 'chalk'
import figlet from 'figlet'

import inquirer from './lib/inquirer'
import Instagram from './lib/instagram';

const clear = require('clear')

const run = async () => {
    clear()
    console.log(
        chalk.yellow(
            figlet.textSync('Instavous', { horizontalLayout: 'full' })
        )
    )

    const result = (await inquirer.askTask()).task
   
    switch (result) {
        case 'accountfeed':
            var answers = await inquirer.askAccountFeedQuestions()
            process.stdout.write(`\n`)

            const username = answers.username
            var temp = answers.temp

            var posts = await Instagram.getAccountFeed(username)
            await posts.downloadImages(temp)

            break
        case 'savedmedia':
            var answers = await inquirer.askSavedMedia()
            process.stdout.write(`\n`)
            
            var temp = answers.temp
            var posts = await Instagram.getSavedMedia()
            await posts.downloadImages(temp)

            break
        default:
            break
    }
}

run()