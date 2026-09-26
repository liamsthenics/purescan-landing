// Where "get the app" links go: the public TestFlight beta until the App Store listing is live.
import { APP_STORE_LIVE, APP_STORE_URL, TESTFLIGHT_URL } from "./site.ts";

export interface DownloadLink {
  href: string;
  /** Full call to action, e.g. "Join the public beta". */
  label: string;
  /** For tight spaces such as the header. */
  shortLabel: string;
  /** Where the link leads, shown as a quiet tag inside large buttons; null when the label already says. */
  channelTag: string | null;
  /** Shown beside the button while the App Store listing doesn't exist yet. */
  note: string | null;
}

const TESTFLIGHT_LINK: DownloadLink = {
  href: TESTFLIGHT_URL,
  label: "Join the public beta",
  shortLabel: "Join the beta",
  channelTag: "TestFlight",
  note: "Coming soon to the App Store",
};

const APP_STORE_LINK: DownloadLink = {
  href: APP_STORE_URL,
  label: "Download on the App Store",
  shortLabel: "Get the app",
  channelTag: null,
  note: null,
};

export const DOWNLOAD_LINK: DownloadLink = APP_STORE_LIVE ? APP_STORE_LINK : TESTFLIGHT_LINK;
