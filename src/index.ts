import { getOpts } from "./opts";
import { moveFilesToRoot, getAllFiles, getComments } from "./fileHelpers";

main();

async function main() {
  const { targetPath, runs, type } = getOpts();
  moveFilesToRoot(targetPath, type);

  const files = getAllFiles(targetPath, type);
  const comments = await getComments(files);
  console.log(comments);
}
