import kmeans, { type ClusteringOutput } from "node-kmeans";

export async function runKmeans(
  similarityMatrix: number[][],
  k: number,
  runs: number,
) {
  const out = [];
  for (let i = 0; i < runs; i++) {
    const res = await run(similarityMatrix, k);
    out.push(res.map((item) => item.clusterInd));
  }
  return out;

  // helper
  async function run(
    similarityMatrix: number[][],
    k: number,
  ): Promise<ClusteringOutput[]> {
    return new Promise((resolve, reject) => {
      kmeans.clusterize(similarityMatrix, { k }, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res!);
        }
      });
    });
  }
}
