import kmeans from 'node-kmeans'

export async function runKmeans(similarity, k, runs) {
  const out = []
  for (let i = 0; i < runs; i++) {
    const res = await run(similarity, k)
    out.push(res.map((item) => item.clusterInd))
  }
  return out

  // helper
  async function run(similarity, k) {
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
}
