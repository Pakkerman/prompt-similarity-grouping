import commandLineArgs from "command-line-args";

export type Opts = { targetPath: string; runs: number; type: string };
export function getOpts(): Opts {
  const config = [
    { name: "targetPath", alias: "p", type: String },
    { name: "runs", alias: "r", type: Number, defaultValue: 3 },
    { name: "type", alias: "t", type: String, defaultValue: "jpg" },
  ];
  const opts = commandLineArgs(config);
  const parsedOpts: Opts = {
    targetPath: opts.targetPath,
    runs: opts.runs,
    type: `.${opts.type}`,
  };
  return parsedOpts;
}
