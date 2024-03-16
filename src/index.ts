import fs from "fs";
import { getOpts } from "./opts";
import { moveFilesToRoot, getAllFiles, getComments } from "./fileHelpers";
import { getSimilarity } from "./cosineSimilarity";
import { runKmeans } from "./k-means";
import path from "path";

main();

async function main() {
  const { targetPath, clusters, type } = getOpts();
  moveFilesToRoot(targetPath, type);

  const files = getAllFiles(targetPath, type);
  const comments = await getComments(files);
  const similarityMatrix = getSimilarity(comments);

  const runs = 250;
  const kmeanResults = await runKmeans(similarityMatrix, clusters, runs);

  const occurrencesMap: Map<string, { idxes: number[][]; occurance: number }> =
    new Map();
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

  fs.readdirSync(targetPath, { withFileTypes: true }).forEach((item) => {
    if (!item.isDirectory()) return;

    const r = new RegExp(`${path.basename(targetPath)}-[0-9]{2}`);
    if (!r.test(item.name)) return;

    fs.rmdirSync(path.join(targetPath, item.name));
  });
  // create new dirs
  for (let i = 0; i < clusters; i++) {
    fs.mkdirSync(
      `${targetPath}${path.basename(targetPath)}-${(i + 1).toString().padStart(2, "0")}`,
    );
  }
}
