
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.qgdacrkeafssldlxmajm',
  appName: 'Vice Kink',
  webDir: 'dist',
  server: {
    url: 'https://app.vicekink.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    backgroundColor: "#121212"
  }
};

export default config;
