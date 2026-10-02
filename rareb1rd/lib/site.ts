// Business info for RAREB1RD. Sourced from rareb1rd.com and its public listings.
// Update here and every page picks it up.

export const site = {
  name: "RAREB1RD",
  tagline: "Commercial printing & retail displays",
  description:
    "RAREB1RD is an industry leader in commercial printing and retail displays — roll labels, packaging, wide-format graphics, custom displays and event signage, printed in-house across the U.S.",
  phone: "(310) 622-3464",
  phoneHref: "tel:+13106223464",
  // TODO: add the shop inbox (not listed publicly). Shown in the footer/contact page when set.
  email: "",
  hours: [
    { days: "Mon – Fri", time: "8:00 AM – 7:00 PM" },
    { days: "Saturday", time: "9:00 AM – 5:00 PM" },
    { days: "Sunday", time: "Closed" },
  ],
  social: {
    facebook: "https://www.facebook.com/RareB1rd/",
    pinterest: "https://www.pinterest.com/Rareb1rdLLC/",
  },
  locations: [
    {
      city: "Los Angeles",
      state: "CA",
      address: "3500 S Main St",
      zip: "90007",
      specialty: "Roll label printing & wide-format printing",
      hq: true,
    },
    {
      city: "Tempe",
      state: "AZ",
      address: "114 S River Dr #1",
      zip: "85288",
      specialty: "Custom retail displays & wide-format printing",
    },
    {
      city: "Miami Gardens",
      state: "FL",
      address: "1400 NW 159th St #104",
      zip: "33169",
      specialty: "Wide-format printing",
    },
    {
      city: "Brooklyn",
      state: "NY",
      address: "",
      zip: "",
      specialty: "Wide-format printing",
    },
  ],
  equipment: [
    { name: "HP Indigo 6K Digital Web Press", detail: "Short & production label runs" },
    { name: "GM DC350Flex Label Finisher", detail: "Inline lamination & die-cutting" },
    { name: "JetFx Solo Digital Print Bar", detail: "Spot embellishments & raised effects" },
    { name: "12 wide-format printers & plotters", detail: "ATMs, walls, entire buildings" },
  ],
  stats: [
    { value: "10+", label: "Years building displays" },
    { value: "12", label: "Wide-format printers & plotters" },
    { value: "4", label: "U.S. production hubs" },
  ],
} as const;
