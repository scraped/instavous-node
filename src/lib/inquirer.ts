import inquirer from 'inquirer'
import * as files from './files'

export default class Inquirer {
    public static askInstagramCredentials(): Promise<inquirer.Questions> {
        const questions: inquirer.Questions = [
            {
                name: 'username',
                type: 'input',
                message: 'Enter your Instagram username:',
                validate: (value: string): boolean | string => {
                    return value.length ? true : 'Please enter your Instagram username'
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