import os from 'os'
import fs from 'fs'
import path from 'path'
import { getFileComments, moveFiles } from './fileHelpers'
import { getSimilarity } from './cosineSimilarity'
import { runKmeans } from './K-means'

const dir = os.homedir() + '/Documents/.generation/testing/'

export default async function main() {
  function moveJpgToDir() {
    const dirContent = fs
      .readdirSync(dir)
      .filter(
        (item) =>
          item.startsWith(path.basename(dir)) &&
          fs.statSync(path.join(dir, item)).isDirectory()
      )
      .map((item) => path.join(dir, item))

    dirContent.forEach((dir) => {
      const jpgs = fs.readdirSync(dir)
      jpgs.forEach((item) => {
        const jpgpath = path.join(dir, item)
        const to = path.join(path.dirname(dir), path.basename(jpgpath))
        fs.renameSync(jpgpath, to)
      })
      fs.rmdirSync(dir)
    })
  }

  // moveJpgToDir()

  const [data, filepaths] = await getFileComments(dir)
  // console.log(data)

  const similarity = getSimilarity(data)

  const runs = 250
  const k = 5
  const kmeanResults = await runKmeans(similarity, k, runs)

  const occurrencesMap = new Map()
  kmeanResults.forEach((item) => {
    const key = item
      .map((item) => item.length)
      .sort((a, b) => a - b)
      .join('')
    const value = { idxes: item, occurance: 1 }
    if (!occurrencesMap.has(key)) {
      occurrencesMap.set(key, value)
    } else {
      occurrencesMap.set(key, {
        idxes: occurrencesMap.get(key).idxes,
        occurance: occurrencesMap.get(key).occurance + 1,
      })
    }
  })

  console.log('Distinct results in occurrenceMap', occurrencesMap.size)
  let mostOccurredGroup = {}
  let maxOccurance = -Infinity
  console.log(`groupings has 5% or more occurance: `)
  for (const { idxes, occurance } of occurrencesMap.values()) {
    const percentage = ((occurance / runs) * 100).toFixed(2)
    if (5 <= percentage)
      console.log(
        percentage,
        idxes.map((item) => item.length).sort((a, b) => a - b)
      )

    if (occurance < maxOccurance) continue

    maxOccurance = Math.max(maxOccurance, occurance)
    mostOccurredGroup = {
      groupSizes: idxes.map((item) => item.length),
      occurance,
      idxes,
      filepathGroups: idxes.map((item) => item.map((item) => filepaths[item])),
    }
  }

  console.log(
    `
    Sorted ${similarity.length} files.
    most occurred group: [${mostOccurredGroup.groupSizes.sort(
      (a, b) => a - b
    )}]`
  )

  // make new dir
  const newDirnames = mostOccurredGroup.filepathGroups.map(
    (_, idx) => `${dir}${path.basename(dir)}-0${idx + 1}`
  )
  for (const newDirname of newDirnames) {
    if (fs.existsSync(newDirname)) continue
    fs.mkdirSync(newDirname)
  }

  for (let i = 0; i < mostOccurredGroup.filepathGroups.length; i++) {
    moveFiles(dir, mostOccurredGroup.filepathGroups[i], newDirnames[i])
  }
}
