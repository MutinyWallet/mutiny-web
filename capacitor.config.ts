import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mutinywallet.mutinywallet',
  appName: 'Mutiny Wallet',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https'
  }
};

export default config;
