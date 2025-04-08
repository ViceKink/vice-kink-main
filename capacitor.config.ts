
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.qgdacrkeafssldlxmajm',
  appName: 'Lovable Dating App',
  webDir: 'dist',
  server: {
    url: 'https://qgdacrkeafssldlxmajm.lovable.app?forceHideBadge=true',
    cleartext: true
  },
  android: {
    backgroundColor: "#121212"
  }
};

export default config;
