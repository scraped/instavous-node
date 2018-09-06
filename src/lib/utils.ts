
export const sleep = async (ms: number): Promise<{}> => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}

/**
 * SOURCE: https://gist.github.com/Integralist/749153aa53fea7168e7e#gistcomment-1457123
 * @param array 
 */
export const flattenArray = (array: Array<any>): Array<any> => {
    const flattenedArray: Array<any> = [].concat(...array)
    return flattenedArray.some(Array.isArray) 
        ? flattenArray(flattenedArray) 
        : flattenedArray
}

export const range = (start: number = 0, end: number = 1) => {
    const length = end - start
    return Array.from({ length }, (_, i) => start + i)
}