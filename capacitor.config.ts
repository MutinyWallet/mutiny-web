import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mutinywallet.mutinywallet',
  backgroundColor: "171717",
  appName: 'Mutiny Wallet',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    BackgroundRunner: {
      label: 'com.mutinywallet.mutinywallet.background',
      src: 'runners/background.ts',
      event: 'checkPaymentsInFlight',
      repeat: true,
      interval: 60,
      autoStart: true,
    },
  },
};

export default config;
