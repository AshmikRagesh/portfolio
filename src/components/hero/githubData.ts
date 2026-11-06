// Daily GitHub contributions, Aug–Nov 2026, read from each account's public calendar
// (github.com/users/<name>/contributions) on 6 Nov 2026. Days left out had none.
// Work is the Travelopia account; its private-repo contributions show on the calendar.
export const CONTRIB_FROM = "2026-08-01";
export const CONTRIB_TO = "2026-11-30";
export const CONTRIB_ASOF = "2026-11-06";

export const ACCOUNTS = [
  { key: "personal", label: "Personal", handle: "AshmikRagesh", days: {"2026-08-01": 1, "2026-09-20": 4, "2026-09-24": 1, "2026-10-23": 17, "2026-10-24": 24, "2026-10-25": 11, "2026-10-26": 22, "2026-10-27": 45, "2026-10-28": 35, "2026-10-29": 21, "2026-10-30": 37, "2026-10-31": 1, "2026-11-01": 43, "2026-11-02": 35, "2026-11-03": 53, "2026-11-04": 12, "2026-11-05": 11, "2026-11-06": 22} as Record<string, number> },
  { key: "work", label: "Work", handle: "aashmikragesh", days: {"2026-08-21": 11, "2026-08-24": 15, "2026-08-25": 2, "2026-08-26": 10, "2026-08-27": 13, "2026-08-28": 18, "2026-08-31": 45, "2026-09-01": 15, "2026-09-02": 16, "2026-09-03": 20, "2026-09-04": 8, "2026-09-07": 31, "2026-09-08": 9, "2026-09-09": 1, "2026-09-28": 16, "2026-09-29": 54, "2026-09-30": 19, "2026-10-01": 16, "2026-10-07": 3, "2026-10-14": 20, "2026-10-15": 2} as Record<string, number> },
] as const;
