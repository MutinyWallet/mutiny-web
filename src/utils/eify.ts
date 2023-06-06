/// Sometimes we catch an error as `unknown` so this turns it into an Error.
export default function eify(e: unknown): Error {
    if (e instanceof Error) {
        return e;
    } else if (typeof e === "string") {
        return new Error(e);
    } else {
        return new Error("Unknown error");
    }
}
