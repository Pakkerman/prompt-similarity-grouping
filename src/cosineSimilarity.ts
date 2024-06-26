export function getSimilarity(data: string[]) {
  const out = [];
  for (let i = 0; i < data.length; i++) {
    let row = [];
    for (let k = 0; k < data.length; k++) {
      if (i === k) continue;

      const result = +calculateSimilarity(data[i], data[k]);

      if (Number.isNaN(result)) {
        row.push(0.5);
      } else {
        row.push(result);
      }
    }

    out.push(row);
  }
  return out;
}

function calculateSimilarity(a: string, b: string) {
  // Tokenize input strings
  function tokenize(str: string): string[] {
    return str.toLowerCase().match(/\w+/g) || [];
  }

  // Convert strings to token arrays
  const tokensA = tokenize(a);
  const tokensB = tokenize(b);

  // Create a set of unique tokens from both arrays
  const uniqueTokens = new Set([...tokensA, ...tokensB]);

  // Create vectors for both input strings
  const vectorA: number[] = Array.from(uniqueTokens).map((token) =>
    tokensA.includes(token) ? 1 : 0,
  );
  const vectorB: number[] = Array.from(uniqueTokens).map((token) =>
    tokensB.includes(token) ? 1 : 0,
  );

  // Calculate dot product
  const dotProduct = vectorA.reduce((acc, val, i) => acc + val * vectorB[i], 0);

  // Calculate magnitudes
  const magnitudeA = Math.sqrt(
    vectorA.reduce((acc, val) => acc + val * val, 0),
  );
  const magnitudeB = Math.sqrt(
    vectorB.reduce((acc, val) => acc + val * val, 0),
  );

  // Calculate cosine similarity
  const similarity = dotProduct / (magnitudeA * magnitudeB);

  return similarity;
}
