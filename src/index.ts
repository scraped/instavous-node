import chalk from 'chalk'
import figlet from 'figlet'

const clear = require('clear')

const run = async () => {
    clear()
    console.log(
        chalk.yellow(
            figlet.textSync('Instavous', { horizontalLayout: 'full' })
        )
    )
}

run()