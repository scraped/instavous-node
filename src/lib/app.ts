
const pkg = require('../../package.json')

export default class App {
    public static getAppName(): string {
        return pkg.name
    }

    public static getAppVersion(): string {
        return pkg.version
    }
}