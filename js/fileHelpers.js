import fs from 'fs'
import path from 'path'

const ExifImage = require('exif').ExifImage

export function moveFiles(dir, filepaths, newDirname) {
  const dirname = path.dirname(dir + 'test.jpg')
  for (const filepath of filepaths) {
    const basename = path.basename(filepath)
    const from = `${dirname}/${basename}`
    const to = `${newDirname}/${basename}`
    fs.renameSync(from, to)
  }
}

/**
 * This function will return all filepaths of jpgs in the input dir
 * @async
 * @function
 * @param {string} dir - target directory.
 * @returns {Promise<[[string], [string]]>} returns an array of 2, [ userComments, filepaths ].
 */

export async function getFileComments(dir) {
  const filepaths = fs
    .readdirSync(dir)
    .filter((item) => item.includes('.jpg'))
    .map((item) => dir + item)

  const userComments = []
  for (const filepath of filepaths) {
    const userComment = await getExifUserComment(filepath)
    userComments.push(
      userComment
        .slice(8)
        .replace(/[\n_:]/g, ' ')
        .replace(/[\(\),\d\.<>-]/g, '')
        .replace(')')
        .split('Steps')[0]
    )
  }

  return [userComments, filepaths]
}

async function getExifUserComment(path) {
  const file = fs.readFileSync(path)
  return new Promise((reslove, reject) => {
    new ExifImage({ image: file }, (error, exifData) => {
      if (error) {
        reject(error)
      } else {
        const buffer = exifData.exif.UserComment
        const userComment = buffer.toString('utf-8')
        reslove(userComment)
      }
    })
  })
}
