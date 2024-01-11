import fs from 'fs'
import path from 'path'

export function moveFiles(dir, filepaths, newDirname) {
  const dirname = path.dirname(dir + 'test.jpg')
  for (const filepath of filepaths) {
    const basename = path.basename(filepath)
    const from = `${dirname}/${basename}`
    const to = `${newDirname}/${basename}`
    fs.copyFileSync(from, to)
  }
}
