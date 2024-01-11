import kmeans from 'node-kmeans'
import os from 'os'
import fs from 'fs'
import path from 'path'
import { getFileComments } from './getFileComments'
import { moveFiles } from './fileHelpers'

const dir = os.homedir() + '/Documents/.generation/testing/'
// const dir = os.homedir() + '/coding/text-similarity/'

// take file paths, and new directory name to put them in

export default async function main() {
  console.log('Directory: ', dir)
  const [data, filepaths] = await getFileComments(dir)

  const similarity = []
  for (let i = 0; i < data.length; i++) {
    let row = []
    for (let k = 0; k < data.length; k++) {
      if (i === k) continue

      row.push(+calculateSimilarity(data[i], data[k]).toFixed(2))
    }

    similarity.push(row)
  }

  // TODO take the top percent and if exceed 20 items or 18, add K and rerun.
  let runs = 250
  let K = 3
  const results = []
  for (let i = 0; i < runs; i++) {
    const res = await runKmeans(similarity, K)
    results.push(res.map((item) => item.clusterInd))
  }

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

  let groupedIdxes = {}
  let maxOccurance = -Infinity
  for (const { idxes, occurance } of map.values()) {
    const percentage = ((occurance / runs) * 100).toFixed(2)
    if (occurance < maxOccurance) continue

    maxOccurance = Math.max(maxOccurance, occurance)
    groupedIdxes = {
      groupSizes: idxes.map((item) => item.length),
      occurance,
      idxes,
      filepathGroups: idxes.map((item) => item.map((item) => filepaths[item])),
    }

    // console.log('occur: ', percentage, '% of the times')
    // console.log(
    //   'length of the each clusters: ',
    //   idxes.map((item) => item.length).sort((a, b) => a - b)
    // )
    // console.log(
    //   idxes.sort((a, b) => a[0] - b[0]).map((item) => item.map((item) => item))
    // )
  }

  // console.log('totalSize: ', map.size)
  console.log(`groupedIdxes: `, groupedIdxes)

  // make new dir
  const newDirnames = groupedIdxes.filepathGroups.map(
    (_, idx) => `${dir}${path.basename(dir)}-0${idx + 1}`
  )
  for (const newDirname of newDirnames) {
    if (fs.existsSync(newDirname)) continue
    fs.mkdirSync(newDirname)
  }

  for (let i = 0; i < groupedIdxes.filepathGroups.length; i++) {
    moveFiles(dir, groupedIdxes.filepathGroups[i], newDirnames[i])
  }
  // for (const key of map.keys()) {
  //   if (map.get(key) >= runs * 0.08) console.log(key, map.get(key))
  // }
  // console.log(map.size)

  // const averages = Array.from({ length: results[0].length }, (_, idx) => {
  //   const sum = results.reduce((acc, curr) => {}, 0)
  //   return sum / results.length
  // })

  // Find the best result (lowest average cluster index)
  // const bestIndex = averages.indexOf(Math.min(...averages))
  // const bestResult = results.map((res) => res[bestIndex])

  // console.log('Averages:', averages)
  // console.log('Best Result:', bestResult)
}

function calculateSimilarity(a, b) {
  // Tokenize input strings
  const tokenize = (str) => str.toLowerCase().match(/\w+/g) || []

  // Convert strings to token arrays
  const tokensA = tokenize(a)
  const tokensB = tokenize(b)

  // Create a set of unique tokens from both arrays
  const uniqueTokens = new Set([...tokensA, ...tokensB])

  // Create vectors for both input strings
  const vectorA = Array.from(uniqueTokens).map((token) =>
    tokensA.includes(token) ? 1 : 0
  )
  const vectorB = Array.from(uniqueTokens).map((token) =>
    tokensB.includes(token) ? 1 : 0
  )

  // Calculate dot product
  const dotProduct = vectorA.reduce((acc, val, i) => acc + val * vectorB[i], 0)

  // Calculate magnitudes
  const magnitudeA = Math.sqrt(vectorA.reduce((acc, val) => acc + val * val, 0))
  const magnitudeB = Math.sqrt(vectorB.reduce((acc, val) => acc + val * val, 0))

  // Calculate cosine similarity
  const similarity = dotProduct / (magnitudeA * magnitudeB)

  return similarity
}

function runKmeans(similarity, k) {
  return new Promise((resolve, reject) => {
    kmeans.clusterize(
      similarity,
      { k, maxIterations: 1000, tolerance: 0.0001 },
      (err, res) => {
        if (err) reject(err)
        else resolve(res)
      }
    )
  })
}
