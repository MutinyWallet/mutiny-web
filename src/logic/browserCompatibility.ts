export async function checkBrowserCompatibility(): Promise<boolean> {
    // Check if we can write to localstorage
    console.debug("Checking localstorage");
    try {
        localStorage.setItem("test", "test");
        localStorage.removeItem("test");
    } catch (e) {
        console.error(e);
        throw new Error("Browser error: LocalStorage is not supported.");
    }

    // Check if the browser supports WebAssembly
    console.debug("Checking WebAssembly");
    if (
        typeof WebAssembly !== "object" ||
        !WebAssembly.validate(
            Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00)
        )
    ) {
        throw new Error("Browser error: WebAssembly is not supported.");
    }

    console.debug("Checking indexedDB");
    // Check if we can write to IndexedDB
    try {
        await openDatabase();
    } catch (e) {
        console.error(e);
        throw new Error("Browser error: IndexedDB is not supported.");
    }

    return true;
}

function openDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
        console.debug("Checking IndexedDB is on the window object");
        if (!("indexedDB" in window)) {
            reject("IndexedDB not supported.");
            return;
        }

        console.debug("Opening IndexedDB");
        const dbName = "compatibility-test-db";
        const request = indexedDB.open(dbName, 1);

        request.onsuccess = (_event) => {
            indexedDB.deleteDatabase(dbName);
            resolve();
        };

        request.onerror = (_event) => {
            reject("Error opening database.");
        };
    });
}
