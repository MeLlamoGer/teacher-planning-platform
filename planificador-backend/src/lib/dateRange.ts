export function parseDateOnly(value: string | Date): Date {
  if (value instanceof Date) {
    const copy = new Date(value);
    copy.setUTCHours(0, 0, 0, 0);
    return copy;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Fecha inválida');
  }
  return date;
}

export function assertDateRange(start: Date, end: Date): void {
  if (end < start) {
    throw new Error('La fecha de fin no puede ser anterior a la fecha de inicio');
  }
}

export function rangesOverlap(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date
): boolean {
  return startA <= endB && endA >= startB;
}

export function todayDateOnlyUtc(now: Date = new Date()): Date {
  return new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  ));
}
