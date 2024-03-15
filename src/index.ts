import path from "path";
import fs from "fs";
import { getOpts } from "./opts";

main();

function main() {
  const { targetPath, runs, type } = getOpts();
  if (!targetPath || !fs.statSync(targetPath).isDirectory()) {
    console.error("\nInvalid path\n");
    return;
  }

  const files: string[] = [];
  fs.readdirSync(targetPath, { withFileTypes: true, recursive: true }).forEach(
    (item) => {
      if (!item.isFile()) return;
      if (path.extname(item.name) !== type) return;
      files.push(path.join(targetPath, item.name));
    },
  );

  console.log(files);
  files.forEach((item) => {
    fs.renameSync(item, path.join(targetPath, path.basename(item)));
  });
}
