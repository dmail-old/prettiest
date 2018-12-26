const close = "\x1b[0m"
const green = "\x1b[32m"
const red = "\x1b[31m"
const blue = "\x1b[34m"

export const prettyStyle = (string) => `${green}${string}${close}`
export const prettyStyleWithIcon = (string) => prettyStyle(`${prettyIcon} ${string}`)
const prettyIcon = "\u2714" // checkmark ✔

export const uglyStyle = (string) => `${red}${string}${close}`
export const uglyStyleWithIcon = (string) => uglyStyle(`${uglyIcon} ${string}`)
const uglyIcon = "\u2613" // cross ☓

export const ignoredStyle = (string) => `${blue}${string}${close}`
export const ignoredStyleWithIcon = (string) => ignoredStyle(`${ignoredIcon} ${string}`)
const ignoredIcon = "\u003F" // question mark ?
