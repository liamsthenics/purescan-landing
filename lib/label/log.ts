// Operational logging for label photo-fill. Only fixed event names and error
// class names are ever logged: never photos, readings, barcodes, key ids or IPs.
import { createConsoleLogger } from "../chat/log.ts";

export type LabelLogEvent =
  | "setup_failed"
  | "unexpected_error"
  | "global_cap_reached"
  | "reader_failed"
  | "reading_not_saved"
  | "contribution_failed";

export type LabelLogger = (event: LabelLogEvent, error?: unknown) => void;

export const consoleLabelLogger: LabelLogger = createConsoleLogger<LabelLogEvent>("label");
