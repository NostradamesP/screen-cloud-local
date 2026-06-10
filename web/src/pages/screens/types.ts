export type ScreenForm = {
  name: string;
  location: string;
  resolution: string;
  orientation: "landscape" | "portrait";
  purpose: string;
  template: string;
  templateHeadline: string;
  templateSubtitle: string;
  templateBadge: string;
  templateQrText: string;
  templateWeatherLocation: string;
  templateTemperature: string;
  templateTicker: string;
  templateLogoText: string;
  templatePrimaryColor: string;
  templateBgColor: string;
  templateTextColor: string;
  templateTickerBg: string;
  templateTickerText: string;
  templateWidgetBg: string;
  templateAccentColor: string;
  templateFontFamily: string;
  templateFontSizeScale: string;
  templateCornerRadius: string;
  templateTickerSpeed: string;
  templateTransition: string;
  templateMediaFit: string;
  templateShowWeather: string;
  templateShowTicker: string;
  templateCustomCSS: string;
  templateQrUrl: string;
  templateLogoUrl: string;
  templateGradientColor1: string;
  templateGradientColor2: string;
  templateGradientDirection: string;
};

export type Toast = {
  type: "success" | "error";
  message: string;
} | null;

export const emptyForm: ScreenForm = {
  name: "",
  location: "",
  resolution: "1920x1080",
  orientation: "landscape",
  purpose: "other",
  template: "media_left",
  templateHeadline: "",
  templateSubtitle: "",
  templateBadge: "",
  templateQrText: "",
  templateWeatherLocation: "United Kingdom",
  templateTemperature: "16°C",
  templateTicker: "",
  templateLogoText: "",
  templatePrimaryColor: "",
  templateBgColor: "",
  templateTextColor: "",
  templateTickerBg: "",
  templateTickerText: "",
  templateWidgetBg: "",
  templateAccentColor: "",
  templateFontFamily: "system",
  templateFontSizeScale: "1.0",
  templateCornerRadius: "subtle",
  templateTickerSpeed: "normal",
  templateTransition: "none",
  templateMediaFit: "cover",
  templateShowWeather: "yes",
  templateShowTicker: "yes",
  templateCustomCSS: "",
  templateQrUrl: "",
  templateLogoUrl: "",
  templateGradientColor1: "",
  templateGradientColor2: "",
  templateGradientDirection: "to_bottom",
};

export const PURPOSE_TEMPLATE_PRESETS: Record<string, Partial<ScreenForm>> = {
  manufacturing_logistics: {
    template: "center_stage",
    templateBadge: "Operations floor",
    templateHeadline: "Line status 98%",
    templateSubtitle: "Safety, throughput and dispatch updates in real time.",
    templateTicker: "Dock 4 loading | Shift target on pace | Safety briefing at 14:00",
    templatePrimaryColor: "#2563eb",
    templateAccentColor: "#0f172a",
    templateWidgetBg: "#0f766e",
  },
  office_communications: {
    template: "media_right",
    templateBadge: "Team update",
    templateHeadline: "All hands today",
    templateSubtitle: "Company news, people highlights and workplace announcements.",
    templateTicker: "Welcome visitors | Finance QBR at 3 PM | New benefits window open",
    templatePrimaryColor: "#2563eb",
    templateAccentColor: "#1e3a8a",
    templateWidgetBg: "#2563eb",
  },
  cafeteria_restaurant: {
    template: "media_left",
    templateBadge: "Chef special",
    templateHeadline: "Fresh lunch menu",
    templateSubtitle: "Highlight specials, nutrition notes and service hours.",
    templateTicker: "Soup of the day | Mobile pickup open | Ask about vegetarian options",
    templatePrimaryColor: "#f97316",
    templateAccentColor: "#7c2d12",
    templateWidgetBg: "#16a34a",
  },
  retail_promotions: {
    template: "hero_overlay",
    templateBadge: "Limited offer",
    templateHeadline: "New season drop",
    templateSubtitle: "Use the QR for details, inventory and store-only promotions.",
    templateTicker: "Members save more this week | Scan for sizes | New arrivals daily",
    templatePrimaryColor: "#db2777",
    templateAccentColor: "#831843",
    templateWidgetBg: "#db2777",
  },
  healthcare: {
    template: "media_right",
    templateBadge: "Patient information",
    templateHeadline: "Care team updates",
    templateSubtitle: "Wayfinding, wait room messaging and health reminders.",
    templateTicker: "Check-in at reception | Masks available | Pharmacy closes at 6 PM",
    templatePrimaryColor: "#0d9488",
    templateAccentColor: "#134e4a",
    templateWidgetBg: "#0d9488",
  },
  events: {
    template: "hero_overlay",
    templateBadge: "Live event",
    templateHeadline: "Main stage next",
    templateSubtitle: "Agenda highlights, room changes and sponsor callouts.",
    templateTicker: "Doors open | Workshop B moved to Room 204 | Scan for full agenda",
    templatePrimaryColor: "#7c3aed",
    templateAccentColor: "#3b0764",
    templateWidgetBg: "#7c3aed",
  },
  public_information: {
    template: "center_stage",
    templateBadge: "Public notice",
    templateHeadline: "Important update",
    templateSubtitle: "Clear alerts, directions and community information.",
    templateTicker: "Service desk open | Route changes posted | Emergency info at reception",
    templatePrimaryColor: "#059669",
    templateAccentColor: "#064e3b",
    templateWidgetBg: "#0284c7",
  },
  other: {
    template: "media_left",
  },
};
