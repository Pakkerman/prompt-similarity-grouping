const fs = require('fs')
const ExifImage = require('exif').ExifImage

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
    userComments.push(userComment.split('<')[0])
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
