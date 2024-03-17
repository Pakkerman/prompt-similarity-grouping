import fs from 'fs'
import { getOpts } from './opts'
import {
  moveFilesToRoot,
  getAllFiles,
  getComments,
  removeDir,
  createDir,
  moveFiles,
} from './fileHelpers'
import { getSimilarity } from './cosineSimilarity'
import { runKmeans } from './k-means'
import type { Occurance, OccuranceMap, Output } from './types'
import readline from 'readline'

main()

async function main() {
  const { targetPath, clusters, type } = getOpts()
  moveFilesToRoot(targetPath, type)

  const files = getAllFiles(targetPath, type)
  const comments = await getComments(files)
  const similarityMatrix = getSimilarity(comments)

  const runs = 250
  const kmeanResults = await runKmeans(similarityMatrix, clusters, runs)

  const occurrencesMap: OccuranceMap = new Map()
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
        occurance: occurrencesMap.get(key)!.occurance + 1,
        idxes: occurrencesMap.get(key)!.idxes,
      })
    }
  })

  let mostOccurred: Occurance = { idxes: [], occurance: 0 }
  for (const key of occurrencesMap.keys()) {
    const entry = occurrencesMap.get(key)!
    if (mostOccurred.occurance < entry.occurance) {
      mostOccurred = entry
    }
  }

  const threshold = 5 // don't show less than 5 counts
  const average = Math.floor(files.length / clusters)
  let minDiffDist = average

  let output: Output[] = []
  for (const key of occurrencesMap.keys()) {
    const item = occurrencesMap.get(key)!
    if (item.occurance <= threshold) continue

    const groups = item.idxes.map((item) => item.length).sort((a, b) => a - b)
    const diffDist = groups
      .map((i) => Math.abs(average - i))
      .reduce((acc, curr) => acc + curr, 0)
    minDiffDist = Math.min(minDiffDist, diffDist)

    output.push({
      id: key,
      count: item.occurance,
      groups,
      diffDist,
    })
  }
  output = output.sort((a, b) => b.count - a.count)

  const groupOptions: string[] = [`|  id\toccured\tgrouping`]
  output.forEach((item, idx) => {
    let str = `|${pad(idx + 1, 3)}): \t${pad(
      item.count,
      3
    )} => [${item.groups.map((n) => `${pad(n, 2)}`)}]`

    if (idx === 0) str += ` (most occured)`
    if (item.diffDist === minDiffDist) str += ` (min diff dist)`

    groupOptions.push(str)
  })

  const selected = await promptInput(
    `\n${groupOptions.join('\n')}\nSelect grouping: `
  )
  console.log(`Select id: ${selected}`)
  const selectedMap: Occurance = occurrencesMap.get(output[+selected - 1].id)!

  removeDir(targetPath)
  const targetDirs = createDir(targetPath, clusters)

  moveFiles(targetDirs, files, selectedMap)
}

// Function to prompt user for input
function promptInput(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  return new Promise((resolve) => {
    rl.question(question, (answer: string) => {
      resolve(answer)
      rl.close()
    })
  })
}

function pad(
  input: string | number,
  amount: number,
  padChar: string = ' '
): string {
  return input.toString().padStart(amount, padChar)
}
