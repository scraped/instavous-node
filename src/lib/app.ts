
export default class App {
    public static getAppName(): string {
        return process.env.npm_package_name as string
    }

    public static getAppVersion(): string {
        return process.env.npm_package_version as string
    }
}
