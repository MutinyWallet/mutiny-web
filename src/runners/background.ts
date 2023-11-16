import { CapacitorNotifications } from "@capacitor/background-runner";

addEventListener("checkPaymentsInFlight", async (resolve, reject, _args) => {
    try {
        await checkPaymentsInFlight();
        resolve();
    } catch (e) {
        reject(e);
    }
});

interface OutboundPayment {
    status: string;
}

async function checkPaymentsInFlight() {
    console.log("checkPaymentsInFlight");
    const db = await openDatabase();

    const transaction = db.transaction("wallet_store", "readonly");
    const store = transaction.objectStore("wallet_store");

    // Get keys prefixed with "payment_outbound"
    const keys = await getAllKeysWithPrefix(store, "payment_outbound");

    for (const key of keys) {
        const payment = await get(store, key);
        console.log(payment.status);
        // fixme change back to InFlight
        if (payment && payment.status === "Succeeded") {
            showNotification();
            break;
        }
    }
    transaction.commit();
}

function openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("wallet");
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function getAllKeysWithPrefix(
    store: IDBObjectStore,
    prefix: string
): Promise<string[]> {
    return new Promise((resolve, reject) => {
        const keys: string[] = [];
        const cursorRequest = store.openKeyCursor();

        cursorRequest.onsuccess = function (event) {
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

        cursorRequest.onerror = function () {
            reject(cursorRequest.error);
        };
    });
}

function get(store: IDBObjectStore, key: string): Promise<OutboundPayment> {
    return new Promise((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function showNotification() {
    // generate random id
    const id = Math.random() * 100_000_000;

    // send notification in 5 seconds
    const scheduleDate = new Date();
    scheduleDate.setSeconds(scheduleDate.getSeconds() + 5);

    // todo make pretty
    CapacitorNotifications.schedule([
        {
            id,
            title: "You have a payment in flight",
            body: "Open Mutiny to make sure it completes.",
            scheduleAt: scheduleDate
        }
    ]);
}

export default checkPaymentsInFlight;
