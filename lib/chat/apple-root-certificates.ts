// Apple's public root certificates, bundled in certs/apple and downloaded from
// https://www.apple.com/certificateauthority/. next.config.ts traces them into
// the /api/chat function.
import { readFileSync } from "node:fs";
import { join } from "node:path";

const CERTIFICATE_DIRECTORY = join(process.cwd(), "certs", "apple");
const CERTIFICATE_FILES = ["AppleRootCA-G3.cer", "AppleRootCA-G2.cer", "AppleIncRootCertificate.cer"] as const;

export function loadAppleRootCertificates(): Buffer[] {
  return CERTIFICATE_FILES.map((file) => readFileSync(join(CERTIFICATE_DIRECTORY, file)));
}
