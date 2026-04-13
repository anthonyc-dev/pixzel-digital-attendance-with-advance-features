/** Date-only overlap (UTC calendar days), same semantics as legacy payroll processor. */
export function overlapDays(
  startDate: string,
  endDate: string,
  leaveStart: string,
  leaveEnd: string,
): string[] {
  const from = new Date(`${startDate}T00:00:00Z`);
  const to = new Date(`${endDate}T00:00:00Z`);
  const lFrom = new Date(`${leaveStart}T00:00:00Z`);
  const lTo = new Date(`${leaveEnd}T00:00:00Z`);

  const start = from > lFrom ? from : lFrom;
  const end = to < lTo ? to : lTo;
  if (end < start) return [];

  const out: string[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    out.push(cur.toISOString().slice(0, 10));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return out;
}

export function enumerateWorkingDays(startDate: string, endDate: string): string[] {
  const out: string[] = [];
  const cur = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  while (cur <= end) {
    const dow = cur.getUTCDay();
    if (dow !== 0 && dow !== 6) {
      out.push(cur.toISOString().slice(0, 10));
    }
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return out;
}

/** Working days in [startDate,endDate] that fall inside a leave range. */
export function overlapWorkingDays(
  rangeStart: string,
  rangeEnd: string,
  leaveStart: string,
  leaveEnd: string,
): string[] {
  const days = overlapDays(rangeStart, rangeEnd, leaveStart, leaveEnd);
  return days.filter((d) => {
    const dt = new Date(`${d}T00:00:00Z`);
    const dow = dt.getUTCDay();
    return dow !== 0 && dow !== 6;
  });
}

export function countOverlapWorkingDays(
  rangeStart: string,
  rangeEnd: string,
  leaveStart: string,
  leaveEnd: string,
): number {
  return overlapWorkingDays(rangeStart, rangeEnd, leaveStart, leaveEnd).length;
}

export function parsePayrollPeriod(period: string): { start: string; end: string } | null {
  const m = period.trim().match(/^(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2})$/i);
  if (!m) return null;
  return { start: m[1], end: m[2] };
}
