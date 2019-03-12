const close = "\x1b[0m"
const green = "\x1b[32m"
const red = "\x1b[31m"
const blue = "\x1b[34m"
const yellow = "\x1b[33m"

export const erroredStyle = (string) => `${red}${string}${close}`
export const erroredStyleWithIcon = (string) => erroredStyle(`${erroredIcon} ${string}`)
const erroredIcon = "\u003F" // question mark ?

export const ignoredStyle = (string) => `${blue}${string}${close}`
export const ignoredStyleWithIcon = (string) => ignoredStyle(`${ignoredIcon} ${string}`)
const ignoredIcon = "\u003F" // question mark ?

export const uglyStyle = (string) => `${yellow}${string}${close}`
export const uglyStyleWithIcon = (string) => uglyStyle(`${uglyIcon} ${string}`)
const uglyIcon = "\u2613" // cross ☓

export const prettyStyle = (string) => `${green}${string}${close}`
export const prettyStyleWithIcon = (string) => prettyStyle(`${prettyIcon} ${string}`)
const prettyIcon = "\u2714" // checkmark ✔
