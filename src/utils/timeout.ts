// A promise version of timeout
export const timeout = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
