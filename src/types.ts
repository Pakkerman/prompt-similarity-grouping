export type Opts = {
  targetPath: string;
  clusters: number;
  type: string;
  verbose: boolean;
};

export type Occurance = {
  idxes: number[][];
  occurance: number;
};

export type OccuranceMap = Map<string, Occurance>;
