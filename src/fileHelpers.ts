import fs from "fs";
import path from "path";

export function moveFilesToRoot(targetPath: string, type: string): void {
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
