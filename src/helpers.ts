import readline from "readline";

// Function to prompt user for input
export function promptInput(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer: string) => {
      resolve(answer);
      rl.close();
    });
  });
}

export function pad(
  input: string | number,
  amount: number,
  padChar: string = " ",
): string {
  return input.toString().padStart(amount, padChar);
}
