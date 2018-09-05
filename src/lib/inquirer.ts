import inquirer from 'inquirer'

const INSTAGRAM_USERNAME_REGEX = /^([A-Za-z0-9_](?:(?:[A-Za-z0-9_]|(?:\.(?!\.))){0,28}(?:[A-Za-z0-9_]))?)$/

const usernameQuestion = {
    name: 'username',
    type: 'input',
    message: 'Enter the Instagram username:',
    validate: (value: string): boolean | string => {
        if (value.length && INSTAGRAM_USERNAME_REGEX.test(value)) {
            return true
        }        
        return 'Please enter a valid Instagram username.'
    }
}

const tempQuestion = {
    name: 'temp',
    type: 'confirm',
    message: 'Would you like to save the images temporarily?',
    default: false
}

export default class Inquirer {
    public static askTask(): Promise<any> {
        const questions: inquirer.Questions = [
            {
                name: 'task',
                type: 'list',
                message: 'What would you like to do?',
                choices: [
                    { value: 'accountfeed', name: 'Download feed for specific account'},
                    { value: 'savedmedia', name: 'Download media saved by your account'}
                ]
            }
        ]
        return inquirer.prompt(questions)
    }

    public static askAccountFeedQuestions(): Promise<any> {
        const questions: inquirer.Questions = [
            usernameQuestion,
            tempQuestion,
        ]

        return inquirer.prompt(questions)
    }

    public static askSavedMedia(): Promise<any> {
        const questions: inquirer.Questions = [
            tempQuestion,
        ]

        return inquirer.prompt(questions)
    }

    public static askInstagramCredentials(): Promise<any> {
        const questions: inquirer.Questions = [
            {
                name: 'username',
                type: 'input',
                message: 'Enter your Instagram username:',
                validate: (value: string): boolean | string => {
                    if (value.length && INSTAGRAM_USERNAME_REGEX.test(value)) {
                        return true
                    }
                    return 'Please enter a valid Instagram username.'
                }
            },
            {
                name: 'password',
                type: 'password',
                message: 'Enter your password',
                validate: (value: string): boolean | string => {
                    return value.length ? true : 'Please enter your password'
                }
            }
        ]
        return inquirer.prompt(questions)
    }
}