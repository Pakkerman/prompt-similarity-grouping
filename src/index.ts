import path from "path";
import os from "os";
import fs from "fs";
import commandLineArgs from "command-line-args";

const config = [
  { name: "runs", alias: "r", type: String },
  { name: "path", alias: "p", type: String },
];
const opts = commandLineArgs(config);

console.log(opts.path);
console.log(path.dirname(opts.path));
console.log(path.basename(opts.path));

