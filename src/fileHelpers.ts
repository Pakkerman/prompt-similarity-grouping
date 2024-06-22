import fs from "fs";
import path from "path";
import { ExifImage } from "exif";
import type { Occurance } from "./types";

export function moveFilesToRoot(targetPath: string, type: string): void {
  if (!targetPath || !fs.statSync(targetPath).isDirectory()) {
    console.error("\nInvalid path\n");
    return;
  }

  const files: string[] = [];
  fs.readdirSync(targetPath, { withFileTypes: true, recursive: true }).forEach(
    (item) => {
      if (item.isDirectory()) return;
      if (item.name.includes("sorted") || item.name.includes("bak")) return;
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
      new ExifImage({ image: file }, (err, data) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          const buffer = data.exif.UserComment;
          if (!buffer || buffer.toString() === "") {
            resolve("");
          }

          const comment = buffer!
            .toString()
            .trim()
            .replace(/Negative.*/g, "")
            .replaceAll(/[^A-Za-z]+/g, " ")
            .replaceAll(/\b(ems|lora|break|in|by|as)\b/gi, " ")
            .replaceAll(/\s{2,}/g, " ");
          resolve(comment);
        }
      });
    });
  }
}

export function removeDir(targetPath: string): void {
  fs.readdirSync(targetPath, { withFileTypes: true }).forEach((item) => {
    if (!item.isDirectory()) return;

    const r = new RegExp(`${path.basename(targetPath)}-[0-9]{2}`);
    if (!r.test(item.name)) return;

    fs.rmdirSync(path.join(targetPath, item.name), { recursive: true });
  });
}
export function createDir(targetPath: string, amount: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < amount; i++) {
    const dir = `${targetPath}${path.basename(targetPath)}-${(i + 1)
      .toString()
      .padStart(2, "0")}`;
    fs.mkdirSync(dir);
    out.push(dir);
  }

  return out;
}

export function moveFiles(
  targetDirs: string[],
  files: string[],
  occurance: Occurance,
): void {
  occurance.idxes = occurance.idxes.sort((a, b) => b.length - a.length);

  for (let i = 0; i < targetDirs.length; i++) {
    const currDir = targetDirs[i];
    const idxes = occurance.idxes[i];
    for (let k = 0; k < idxes.length; k++) {
      const idx = idxes[k];
      const filename = path.basename(files[idx]);

      fs.renameSync(files[idx], path.join(currDir, filename));
    }
  }
}
