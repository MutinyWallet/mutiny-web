// Simple storage for fake labels
// For each outpoint string, we can store a boolean whether it's redshifted or not

function setRedshifted(redshifted: boolean, outpoint?: string) {
    if (outpoint === undefined) return;
    localStorage.setItem(outpoint, redshifted.toString());
}

function getRedshifted(outpoint: string): boolean {
    const redshifted = localStorage.getItem(outpoint);
    if (redshifted === null) {
        return false;
    }
    return redshifted === "true";
}

const TEST_UTXO =
    "47651763fbd74488a478aad80e4205c3e34bbadcfc42b5cd9557ef12a15ab00c:1";

export { setRedshifted, getRedshifted, TEST_UTXO };
