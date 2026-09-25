import { CAPS, capNote } from "@/lib/scoring";

/** Every cap with its maximum and the app's "Capped at" wording. */
export function CapsTable() {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[520px] text-left text-[15px]">
        <caption className="sr-only">Score caps, strictest first</caption>
        <thead>
          <tr className="text-[13px] text-secondary">
            <th scope="col" className="px-5 py-3 font-medium">
              When
            </th>
            <th scope="col" className="px-3 py-3 font-medium">
              Max
            </th>
            <th scope="col" className="px-5 py-3 font-medium">
              What the app says
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-separator border-t border-separator">
          {CAPS.map((cap) => (
            <tr key={cap.reason}>
              <th scope="row" className="px-5 py-3.5 font-medium text-ink">
                {cap.condition}
              </th>
              <td className="px-3 py-3.5 text-[17px] font-semibold tabular-nums text-ink">{cap.max}</td>
              <td className="px-5 py-3.5 text-secondary">{capNote(cap.max, cap.capReason)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
