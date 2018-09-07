
export const sleep = async (ms: number): Promise<{}> => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}
