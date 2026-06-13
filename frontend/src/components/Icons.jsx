import React from "react";

export const Icon = ({ d, size = 18, className = "", style = {} }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <path d={d} />
  </svg>
);

export const ICONS = {
  dashboard:   "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  patients:    "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 100 8 4 4 0 000-8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
  assessment:  "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2 M9 5a2 2 0 002 2h2a2 2 0 002-2 M9 5a2 2 0 012-2h2a2 2 0 012 2 M12 12h.01 M12 16h.01",
  ai:          "M12 2a10 10 0 100 20A10 10 0 0012 2z M12 8v8 M8 12h8",
  history:     "M12 8v4l3 3 M3.05 11a9 9 0 109.9-8.95",
  alert:       "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01",
  heart:       "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z",
  plus:        "M12 5v14 M5 12h14",
  check:       "M20 6L9 17l-5-5",
  xmark:       "M18 6L6 18 M6 6l12 12",
  search:      "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  refresh:     "M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0114.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0020.49 15",
  brain:       "M9.5 2A2.5 2.5 0 017 4.5v0A2.5 2.5 0 014.5 7v0A2.5 2.5 0 017 9.5v0A2.5 2.5 0 019.5 12 M14.5 2A2.5 2.5 0 0117 4.5v0A2.5 2.5 0 0119.5 7v0A2.5 2.5 0 0117 9.5v0A2.5 2.5 0 0114.5 12 M12 12v10",
  stethoscope: "M4.8 2.3A.3.3 0 105 2H4 M5 2v5.5 M5 7.5a6 6 0 006 6 M12 13.5V17 M12 17a4 4 0 108 0 M20 17v-1.5 M20 15.5A2.5 2.5 0 0017.5 13",
  activity:    "M22 12h-4l-3 9L9 3l-3 9H2",
  menu:        "M3 12h18 M3 6h18 M3 18h18",
};
