export type Opts = {
  targetPath: string
  clusters: number
  type: string
  verbose: boolean
}

export type Occurance = {
  idxes: number[][]
  occurance: number
}

export type OccuranceMap = Map<string, Occurance>
export type Output = {
  id: string
  count: number
  groups: number[]
  diffDist: number
}
