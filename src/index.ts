import { getOpts } from "./opts";
import { moveFilesToRoot } from "./fileHelpers";

main();

function main() {
  const { targetPath, runs, type } = getOpts();
  moveFilesToRoot(targetPath, type);
}
