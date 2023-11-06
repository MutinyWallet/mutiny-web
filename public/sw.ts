self.addEventListener("periodicsync", (event) => {
    if (event.tag === "check-inflight-payments") {
        event.waitUntil(checkPaymentsInFlight());
    }
});

async function checkPaymentsInFlight() {
    console.log('checkPaymentsInFlight');
    const db = await openDatabase();

    const transaction = db.transaction('wallet_store', 'readonly');
    const store = transaction.objectStore('wallet_store');

    // Get keys prefixed with "payment_outbound"
    const keys = await getAllKeysWithPrefix(store, 'payment_outbound');

    for (let key of keys) {
        const payment = await get(store, key);
        console.log(payment.status);
        if (payment && payment.status === "InFlight") {
            showNotification();
            break;
        }
    }
    transaction.commit();
}

function openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('wallet');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function getAllKeysWithPrefix(store: IDBObjectStore, prefix: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
        const keys: string[] = [];
        const cursorRequest = store.openKeyCursor();

        cursorRequest.onsuccess = function(event) {
            const cursor = (event.target as IDBRequest).result as IDBCursor;
            if (cursor) {
                if (cursor.key.toString().startsWith(prefix)) {
                    keys.push(cursor.key.toString());
                }
                cursor.continue();
            } else {
                resolve(keys);
            }
        };

        cursorRequest.onerror = function() {
            reject(cursorRequest.error);
        };
    });
}

function get(store: IDBObjectStore, key: string): Promise<any> {
    return new Promise((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function showNotification() {
    // todo make pretty
    self.registration.showNotification('Payment Alert', {
        body: 'There are payments with status InFlight.',
        // icon: '/path/to/icon.png',  // You can specify an icon if you have one
        // badge: '/path/to/badge.png' // You can specify a badge if you have one
    });
}
