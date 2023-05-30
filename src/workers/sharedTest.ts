/* eslint-disable no-restricted-globals */

// Keep track of the key-value data
const data = new Map<string, any>();

data.set("test", 42);

// Listen for incoming connections
self.onconnect = (e: MessageEvent) => {
  console.log("SharedWorker: Connection received from main script");
  const port = e.ports[0];

  // Listen for incoming messages on the port
  port.onmessage = (e: MessageEvent) => {
    console.log("SharedWorker: Message received from main script");
    const { type, key, value } = e.data;
    switch (type) {
      case "get":
        // Get the value for the specified key
        port.postMessage({ type: "get", key, value: data.get(key) });
        break;
      case "set":
        // Set the value for the specified key
        data.set(key, value);
        port.postMessage({ type: "set", key, value });
        break;
      case "delete":
        // Delete the value for the specified key
        data.delete(key);
        port.postMessage({ type: "delete", key });
        break;
      default:
        console.error(`SharedWorker: Invalid message type: ${type}`);
        break;
    }
  };
};
