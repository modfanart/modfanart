export const getStringPosition = (
    string: string,
    subString: string,
    index: number,
): number => {
    return string.split(subString, index).join(' ').length
}

export const getCurrentNodeOverflow = (
    arr: number[],
    pos: number,
): [number, number] => {
    let acc = 0
    let index = 0
    for (let i = 0; i < arr.length; i++) {
        if (acc + arr[i] > pos) {
            break
        }

        index++

        acc += arr[i]
    }

    return [index, pos - acc]
}
