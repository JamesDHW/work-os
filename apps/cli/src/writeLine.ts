import process from "process";

export const writeLine = (text: string): void => {
  process.stdout.write(`${text}\n`);
};
