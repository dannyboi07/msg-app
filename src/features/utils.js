export function parseInitials(name) {
    const splitName = name.split(" ");
    let nameInitials = "";
    const limit = splitName.length > 2 ? 2 : splitName.length
    for (let i = 0; i < limit; i++) {
        // if (i === 2) {
        //     break;
        // }
        // console.log(splitName, splitName[i], splitName.length, limit, i);
        nameInitials += splitName[i][0]
    }
    return nameInitials
}