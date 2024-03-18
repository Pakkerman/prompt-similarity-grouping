export function pad(
  input: string | number,
  amount: number,
  padChar: string = " ",
): string {
  return input.toString().padStart(amount, padChar);
}
