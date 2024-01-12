import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
    appId: "com.mutinywallet.mutinywallet",
    backgroundColor: "171717",
    appName: "Mutiny Wallet",
    webDir: "dist/public",
    server: {
        androidScheme: "https"
    }
};

export default config;
