import fs from 'fs'
import { v4 } from 'uuid'

export async function saveFile(base64Data: string, extension: string) {
    const buf = Buffer.from(base64Data, 'base64')
    const filename = `${v4()}.${extension}`
    fs.writeFileSync(`src/Files/${filename}`, buf)
    return filename
}

export async function deleteFile(filename: string) {
    fs.unlinkSync(`src/Files/${filename}`)
}

export async function getFile(filename: string) {
    return fs.readFileSync(`src/Files/${filename}`)
}