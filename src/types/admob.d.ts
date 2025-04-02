
interface AdMobInitOptions {
  testingDevices?: string[];
  initializeForTesting?: boolean;
}

interface AdMobRewardedAdOptions {
  adId: string;
}

interface AdMobRewardedAdResult {
  clicked: boolean;
  dismissed: boolean;
  rewarded: boolean;
}

interface AdMob {
  initialize(options?: AdMobInitOptions): Promise<void>;
  prepareRewardedAd(options: AdMobRewardedAdOptions): Promise<void>;
  showRewardedAd(): Promise<AdMobRewardedAdResult>;
}

declare global {
  interface Window {
    AdMob?: AdMob;
  }
}

export {};
