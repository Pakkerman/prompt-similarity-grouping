import fs from "fs";
import { getOpts } from "./opts";
import {
  moveFilesToRoot,
  getAllFiles,
  getComments,
  removeDir,
  createDir,
  moveFiles,
} from "./fileHelpers";
import { getSimilarity } from "./cosineSimilarity";
import { runKmeans } from "./k-means";
import type { Occurance, OccuranceMap } from "./types";

main();

async function main() {
  const { targetPath, clusters, type } = getOpts();
  moveFilesToRoot(targetPath, type);

  const files = getAllFiles(targetPath, type);
  const comments = await getComments(files);
  const similarityMatrix = getSimilarity(comments);

  const runs = 250;
  const kmeanResults = await runKmeans(similarityMatrix, clusters, runs);

  const occurrencesMap: OccuranceMap = new Map();
  kmeanResults.forEach((item) => {
    const key = item
      .map((item) => item.length)
      .sort((a, b) => a - b)
      .join("");
    const value = { idxes: item, occurance: 1 };
    if (!occurrencesMap.has(key)) {
      occurrencesMap.set(key, value);
    } else {
      occurrencesMap.set(key, {
        occurance: occurrencesMap.get(key)!.occurance + 1,
        idxes: occurrencesMap.get(key)!.idxes,
      });
    }
  });

  let mostOccurred: Occurance = { idxes: [], occurance: 0 };
  for (const key of occurrencesMap.keys()) {
    const entry = occurrencesMap.get(key)!;
    if (mostOccurred.occurance < entry.occurance) {
      mostOccurred = entry;
    }
  }

  let output: string[] = [];
  occurrencesMap.forEach((item) => {
    output.push({
      o: item.occurance,
      i: item.idxes.map((item) => item.length).sort((a, b) => a - b),
    });
  });

  output
    .sort((a, b) => a.o - b.o)
    .forEach((item) => console.log(item.o, "\t", item.i));

  removeDir(targetPath);
  const targetDirs = createDir(targetPath, clusters);

  moveFiles(targetDirs, files, mostOccurred);
}
