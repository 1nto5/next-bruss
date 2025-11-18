/**
 * Formats minutes to "X godz. Y min." format when > 60 minutes
 * @param minutes - Duration in minutes
 * @param labels - Object with minutesShort and hoursShort labels (should include dots)
 * @returns Formatted string
 */
export function formatDuration(
  minutes: number,
  labels: { minutesShort: string; hoursShort: string },
): string {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);

    if (remainingMinutes === 0) {
      return `${hours} ${labels.hoursShort}`;
    }

    return `${hours} ${labels.hoursShort} ${remainingMinutes} ${labels.minutesShort}`;
  }

  return `${Math.round(minutes)} ${labels.minutesShort}`;
}
