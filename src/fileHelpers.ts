import fs from "fs";
import path from "path";
import { ExifImage } from "exif";

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

  files.forEach((item) => {
    fs.renameSync(item, path.join(targetPath, path.basename(item)));
  });
}

export function getAllFiles(targetPath: string, type: string): string[] {
  const files: string[] = [];
  fs.readdirSync(targetPath, { withFileTypes: true }).forEach((item) => {
    if (item.isDirectory()) return;
    if (path.extname(item.name) !== type) return;

    files.push(path.join(targetPath, item.name));
  });

  return files;
}

export async function getComments(files: string[]): Promise<string[]> {
  const comments: string[] = [];
  for (let i = 0; i < files.length; i++) {
    comments.push(await getComment(files[i]));
  }

  return comments;

  async function getComment(file: string): Promise<string> {
    return new Promise((resolve, reject) => {
      files.forEach((item) => {
        new ExifImage({ image: item }, (err, data) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            const buffer = data.exif.UserComment;
            if (!buffer) resolve("");
            const comment = buffer!
              .toString()
              .slice(8)
              .replaceAll(/[\n,]|<lora:|:-*\d\.\d>\.|BREAK/g, "")
              .trim()
              .replace(/Negative.*/g, "");
            resolve(comment);
          }
        });
      });
    });
  }
}
