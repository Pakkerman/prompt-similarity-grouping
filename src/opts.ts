import commandLineArgs from "command-line-args";
import type { Opts } from "./types";

export function getOpts(): Opts {
  const config = [
    { name: "targetPath", alias: "p", type: String },
    { name: "clusters", alias: "c", type: Number, defaultValue: 3 },
    { name: "type", alias: "t", type: String, defaultValue: "jpg" },
    { name: "verbose", alias: "v", type: Boolean, defaultValue: false },
  ];
  const opts = commandLineArgs(config);
  const parsedOpts: Opts = {
    targetPath: opts.targetPath,
    clusters: opts.clusters,
    type: `.${opts.type}`,
    verbose: opts.verbose,
  };
  return parsedOpts;
}
