import commandLineArgs from "command-line-args";

export type Opts = { targetPath: string; clusters: number; type: string };
export function getOpts(): Opts {
  const config = [
    { name: "targetPath", alias: "p", type: String },
    { name: "clusters", alias: "c", type: Number, defaultValue: 3 },
    { name: "type", alias: "t", type: String, defaultValue: "jpg" },
  ];
  const opts = commandLineArgs(config);
  const parsedOpts: Opts = {
    targetPath: opts.targetPath,
    clusters: opts.clusters,
    type: `.${opts.type}`,
  };
  return parsedOpts;
}
