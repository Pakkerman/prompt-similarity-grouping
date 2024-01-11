import os from 'os'
import fs from 'fs'
import path from 'path'
import { getFileComments, moveFiles } from './fileHelpers'
import { getSimilarity } from './cosineSimilarity'
import { runKmeans } from './K-means'

const dir = os.homedir() + '/Documents/.generation/testing/'

export default async function main() {
  // console.log('Directory: ', dir)
  const [data, filepaths] = await getFileComments(dir)

  const similarity = getSimilarity(data)
  const runs = 250
  const k = 4
  const results = await runKmeans(similarity, k, runs)

  const map = new Map()
  results.forEach((item) => {
    const key = item
      .map((item) => item.length)
      .sort((a, b) => a - b)
      .join('')
    const value = {
      idxes: item,
      occurance: 1,
    }
    if (!map.has(key)) map.set(key, value)
    else
      map.set(key, {
        idxes: map.get(key).idxes,
        occurance: map.get(key).occurance + 1,
      })
  })

  console.log('distinct results: ', map.size)

  let groupedIdxes = {}
  let maxOccurance = -Infinity
  console.log(`groupings has 5% or more occurance: `)
  for (const { idxes, occurance } of map.values()) {
    const percentage = ((occurance / runs) * 100).toFixed(2)
    if (5 <= percentage)
      console.log(
        percentage,
        idxes.map((item) => item.length).sort((a, b) => a - b)
      )
    if (occurance < maxOccurance) continue

    maxOccurance = Math.max(maxOccurance, occurance)
    groupedIdxes = {
      groupSizes: idxes.map((item) => item.length),
      occurance,
      idxes,
      filepathGroups: idxes.map((item) => item.map((item) => filepaths[item])),
    }
  }

  console.log(
    `groupedIdxes: `,
    groupedIdxes.groupSizes.sort((a, b) => a - b)
  )

  // make new dir
  const newDirnames = groupedIdxes.filepathGroups.map(
    (_, idx) => `${dir}${path.basename(dir)}-0${idx + 1}`
  )
  for (const newDirname of newDirnames) {
    if (fs.existsSync(newDirname)) continue
    fs.mkdirSync(newDirname)
  }

  for (let i = 0; i < groupedIdxes.filepathGroups.length; i++) {
    // moveFiles(dir, groupedIdxes.filepathGroups[i], newDirnames[i])
  }
}
