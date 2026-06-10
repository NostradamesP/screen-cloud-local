import React from "react";
import { ScreenForm, TemplateZone } from "./types";
import { PURPOSE_LABELS, normalizePurpose, FONT_FAMILIES, CORNER_RADIUS } from "./constants";

type TemplateTextField =
  | "templateBadge"
  | "templateHeadline"
  | "templateSubtitle"
  | "templateQrText"
  | "templateWeatherLocation"
  | "templateTemperature"
  | "templateTicker"
  | "templateLogoText";

interface TemplatePreviewProps {
  form: ScreenForm;
  updateFormField: <K extends keyof ScreenForm>(field: K, value: ScreenForm[K]) => void;
  template: string;
  purpose: string;
  size?: "compact" | "large";
  selectedZone?: TemplateZone;
  onSelectZone?: (zone: TemplateZone) => void;
  showHelp?: boolean;
}

export function TemplatePreview({ form, updateFormField, template, purpose, size = "compact", selectedZone, onSelectZone, showHelp = true }: TemplatePreviewProps) {
  const purposeLabel = PURPOSE_LABELS[normalizePurpose(purpose)] || "Template";
  const badge = form.templateBadge.trim() || purposeLabel;
  const headline = form.templateHeadline.trim() || "Título, avisos o datos";
  const subtitle = form.templateSubtitle.trim() || "Mensaje secundario editable";
  const qrText = form.templateQrText.trim() || "QR";
  const weatherLocation = form.templateWeatherLocation.trim() || "United Kingdom";
  const temperature = form.templateTemperature.trim() || "16°C";
  const ticker = form.templateTicker.trim() || "News ticker message goes here and can be edited for this screen";
  const logoText = form.templateLogoText.trim() || "▲";

  const pc = form.templatePrimaryColor || "#2f9f6f";
  const bg = form.templateBgColor || "#f8fafc";
  const txt = form.templateTextColor || "#14302b";
  const accent = form.templateAccentColor || "#244244";
  const tkBg = form.templateTickerBg || "#ffffff";
  const tkTxt = form.templateTickerText || "#0f172a";
  const wBg = form.templateWidgetBg || pc;
  const ff = FONT_FAMILIES[form.templateFontFamily] || FONT_FAMILIES.system;
  const cr = CORNER_RADIUS[form.templateCornerRadius] || "4px";

  const showWeather = form.templateShowWeather !== "no";
  const showTicker = form.templateShowTicker !== "no";
  const showKpis = form.templateShowKpis !== "no";
  const kpis = [
    { label: form.templateKpi1Label || "Status", value: form.templateKpi1Value || "On track" },
    { label: form.templateKpi2Label || "Today", value: form.templateKpi2Value || "24" },
    { label: form.templateKpi3Label || "Next", value: form.templateKpi3Value || "14:00" },
  ];
  const hasGradient = form.templateGradientColor1 && form.templateGradientColor2;
  const gDir: Record<string, string> = {
    to_bottom: "to bottom", to_right: "to right",
    to_bottom_right: "to bottom right", to_left: "to left", to_top: "to top",
  };
  const g1 = form.templateGradientColor1 || bg;
  const g2 = form.templateGradientColor2 || bg;
  const slideBg = hasGradient ? `linear-gradient(${gDir[form.templateGradientDirection] || "to bottom"}, ${g1}, ${g2})` : bg;
  const qrDisplay = form.templateQrUrl ? "🔗" : qrText;
  const logoDisplay = form.templateLogoUrl ? "🖼" : logoText;
  const tickerStyle: React.CSSProperties = { background: tkBg, color: tkTxt, fontFamily: ff };
  const previewFrame = size === "large"
    ? "overflow-hidden rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
    : "overflow-hidden rounded-lg border border-gray-200 bg-white p-2 shadow-sm";
  const previewCanvas = "relative aspect-video overflow-hidden rounded-md border border-white/70";
  const mediaClass = "relative overflow-hidden bg-[radial-gradient(circle_at_25%_18%,#ffffff,transparent_30%),linear-gradient(135deg,#dbeafe,#e2e8f0_48%,#94a3b8)]";

  const inputBase = "w-full resize-none border-0 bg-transparent p-0 outline-none ring-0 placeholder:text-inherit placeholder:opacity-70 focus:ring-0";
  const updatePreviewText = (field: TemplateTextField, value: string) => updateFormField(field, value);
  const stopEnterSubmit = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") event.preventDefault();
  };
  const previewInput = (
    field: TemplateTextField,
    fallback: string,
    className: string,
    style?: React.CSSProperties,
    ariaLabel?: string,
  ) => (
    <input
      aria-label={ariaLabel || fallback}
      className={`${inputBase} ${className}`}
      value={form[field]}
      placeholder={fallback}
      onChange={(event) => updatePreviewText(field, event.target.value)}
      onKeyDown={stopEnterSubmit}
      style={style}
    />
  );
  const previewTextArea = (
    field: TemplateTextField,
    fallback: string,
    className: string,
    style?: React.CSSProperties,
    ariaLabel?: string,
  ) => (
    <textarea
      aria-label={ariaLabel || fallback}
      className={`${inputBase} ${className}`}
      value={form[field]}
      placeholder={fallback}
      onChange={(event) => updatePreviewText(field, event.target.value)}
      rows={2}
      style={style}
    />
  );
  const zoneClass = (zone: TemplateZone, className = "") =>
    `${className} ${onSelectZone ? "cursor-pointer rounded-sm transition-shadow hover:ring-2 hover:ring-brand-300/80" : ""} ${
      selectedZone === zone ? "ring-2 ring-brand-500 ring-offset-1 ring-offset-white" : ""
    }`;
  const zoneProps = (zone: TemplateZone) => ({
    onClick: (event: React.MouseEvent) => {
      if (!onSelectZone) return;
      event.stopPropagation();
      onSelectZone(zone);
    },
  });
  const previewShell = (children: React.ReactNode) => (
    <div>
      {children}
      {showHelp && <p className="mt-2 text-xs text-gray-500">Canvas guiado</p>}
    </div>
  );
  const mediaMark = (label = "Media") => (
    <div className={zoneClass("media", "absolute inset-0 flex items-center justify-center")} {...zoneProps("media")}>
      <div className="absolute inset-4 rounded-xl border border-white/45 bg-white/10 shadow-inner" />
      <div className="relative rounded-full border border-white/60 bg-white/70 px-3 py-1 text-[10px] font-bold text-slate-600 shadow-sm backdrop-blur">
        {label}
      </div>
    </div>
  );
  const kpiStrip = (variant: "light" | "dark" = "light") => {
    if (!showKpis) return null;
    return (
      <div className={zoneClass("kpiStrip", "grid grid-cols-3 gap-1")} {...zoneProps("kpiStrip")}>
        {kpis.map((kpi) => (
          <div key={`${kpi.label}-${kpi.value}`} className={`${variant === "dark" ? "bg-white/12 text-white" : "bg-white/70 text-slate-700"} rounded px-2 py-1`}>
            <p className="truncate text-[6px] font-bold uppercase tracking-wide opacity-65">{kpi.label}</p>
            <p className="truncate text-[8px] font-black">{kpi.value}</p>
          </div>
        ))}
      </div>
    );
  };

  if (template === "full_bleed") {
    return previewShell(
      <div className={previewFrame}>
          <div className={`${previewCanvas} ${mediaClass}`} style={{ background: slideBg }} onClick={() => onSelectZone?.("media")}>
            {mediaMark("Canvas media")}
          <div className="absolute bottom-3 left-3 rounded-full bg-black/55 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur">
            Canvas
          </div>
        </div>
      </div>
    );
  }

  if (template === "media_left" || template === "media_right") {
    const mediaFirst = template === "media_left";
    return previewShell(
      <div className={previewFrame}>
        <div className={previewCanvas} style={{ background: slideBg }}>
          <div className="absolute inset-x-0 top-0 bottom-[15%] grid grid-cols-[36%_40%_24%] gap-[1px] bg-slate-900/10 p-[1px]">
            <div className={`${mediaFirst ? "order-1" : "order-2"} ${mediaClass}`}>
              {mediaMark()}
            </div>
            <div className={`${mediaFirst ? "order-2" : "order-1"} relative overflow-hidden p-4`} style={{ background: `linear-gradient(135deg, ${pc}16, #ffffff 46%, ${pc}26)`, color: txt }}>
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-20" style={{ background: pc }} />
              <div className={zoneClass("badge")} {...zoneProps("badge")}>
                {previewInput("templateBadge", badge, "relative text-[8px] font-black uppercase tracking-wide", { color: pc }, "Etiqueta del template")}
              </div>
              <div className={zoneClass("headline")} {...zoneProps("headline")}>
                {previewTextArea("templateHeadline", headline, "relative mt-2 h-14 text-xl font-black leading-[0.92]", { color: txt }, "Título del template")}
              </div>
              <div className="relative mt-3 flex items-center gap-3">
                <div className={zoneClass("qr", "flex h-12 w-12 shrink-0 items-center justify-center border border-black/5 shadow-sm")} style={{ background: "#fff", color: accent, borderRadius: cr }} {...zoneProps("qr")}>
                  {previewInput("templateQrText", qrDisplay, "px-1 text-center text-[9px] font-bold", { color: accent }, "Texto del QR")}
                </div>
                <div className={zoneClass("subtitle", "min-w-0 flex-1")} {...zoneProps("subtitle")}>
                  {previewTextArea("templateSubtitle", subtitle, "h-12 text-[10px] leading-tight", { color: txt }, "Subtítulo del template")}
                </div>
              </div>
              <div className="absolute bottom-3 left-4 right-4">
                {kpiStrip()}
              </div>
            </div>
            {showWeather && (
            <div className={zoneClass("weather", "order-3 flex flex-col justify-between p-4")} style={{ background: `linear-gradient(180deg, ${wBg}, ${accent})`, color: "#fff", fontFamily: ff }} {...zoneProps("weather")}>
              <div>
                {previewInput("templateWeatherLocation", weatherLocation, "text-sm font-black text-white", undefined, "Ubicación del clima")}
                <p className="mt-1 inline-flex rounded-full bg-white/20 px-2 py-0.5 text-[7px] font-bold uppercase">Today</p>
              </div>
              <div>
                <p className="text-4xl leading-none">☁</p>
                {previewInput("templateTemperature", temperature, "mt-2 text-3xl font-black text-white", undefined, "Temperatura")}
                <p className="text-[8px] font-semibold text-white/75">Feels like 16°</p>
              </div>
              <div className="grid grid-cols-2 gap-1">
                {[1, 2, 3, 4].map((n) => <div key={n} className="rounded bg-white/15 px-1 py-1 text-[6px] font-bold">Tue · 17°</div>)}
              </div>
            </div>
            )}
          </div>
          {showTicker && (
          <div className="absolute inset-x-0 bottom-0 h-[15%] flex items-center gap-3 px-4" style={tickerStyle}>
            <div className={zoneClass("logo", "w-8 text-2xl font-black")} style={{ color: pc }} {...zoneProps("logo")}>
              {previewInput("templateLogoText", logoDisplay, "text-2xl font-extrabold", { color: pc }, "Marca inferior")}
            </div>
            <div className={zoneClass("ticker", "min-w-0 flex-1")} {...zoneProps("ticker")}>
              {previewInput("templateTicker", ticker, "truncate text-xs font-bold", undefined, "Ticker inferior")}
            </div>
          </div>
          )}
        </div>
      </div>
    );
  }

  if (template === "center_stage") {
    return previewShell(
      <div className={previewFrame}>
        <div className={`${previewCanvas} bg-slate-950`}>
          <div className="absolute inset-3 bottom-[28%] overflow-hidden rounded-lg border border-white/10">
            <div className={`${mediaClass} h-full`} style={{ background: slideBg }}>
              {mediaMark("Content")}
            </div>
          </div>
          <div className="absolute inset-x-3 bottom-[8%] grid grid-cols-[1fr_72px] gap-2">
            <div className="rounded-lg border border-white/10 bg-white/10 p-3 text-white backdrop-blur">
              <div className={zoneClass("badge")} {...zoneProps("badge")}>{previewInput("templateBadge", badge, "text-[7px] font-bold uppercase text-white/70", undefined, "Etiqueta del template")}</div>
              <div className={zoneClass("headline")} {...zoneProps("headline")}>{previewInput("templateHeadline", headline, "mt-1 truncate text-sm font-black text-white", undefined, "Título del template")}</div>
              <div className={zoneClass("subtitle")} {...zoneProps("subtitle")}>{previewInput("templateSubtitle", subtitle, "mt-1 truncate text-[8px] text-white/65", undefined, "Subtítulo del template")}</div>
              <div className="mt-2">{kpiStrip("dark")}</div>
            </div>
            {showWeather && (
            <div className={zoneClass("weather", "rounded-lg p-2 text-white")} style={{ background: wBg }} {...zoneProps("weather")}>
              <div className="text-lg leading-none">☁</div>
              {previewInput("templateTemperature", temperature, "mt-1 text-sm font-black text-white", undefined, "Temperatura")}
              {previewInput("templateWeatherLocation", weatherLocation, "truncate text-[6px] font-bold text-white/80", undefined, "Ubicación del clima")}
            </div>
            )}
          </div>
          {showTicker && (
          <div className="absolute inset-x-0 bottom-0 h-[7%] flex items-center gap-2 px-3" style={tickerStyle}>
            <span className={zoneClass("logo", "w-5 text-xs font-extrabold")} style={{ color: pc }} {...zoneProps("logo")}>{previewInput("templateLogoText", logoDisplay, "text-xs font-extrabold", { color: pc }, "Marca inferior")}</span>
            <div className={zoneClass("ticker", "min-w-0 flex-1")} {...zoneProps("ticker")}>{previewInput("templateTicker", ticker, "truncate text-[7px] font-semibold", undefined, "Ticker inferior")}</div>
          </div>
          )}
        </div>
      </div>
    );
  }

  return previewShell(
    <div className={previewFrame}>
      <div className={`${previewCanvas} bg-black`}>
        <div className={`${mediaClass} absolute inset-0`} style={{ background: slideBg }}>
          {mediaMark("Hero media")}
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-4 pb-5 pt-14 text-white">
          <div className={zoneClass("badge")} {...zoneProps("badge")}>{previewInput("templateBadge", badge, "text-[7px] font-black uppercase tracking-wide", { color: pc }, "Etiqueta del template")}</div>
          <div className={zoneClass("headline")} {...zoneProps("headline")}>{previewInput("templateHeadline", headline, "mt-1 text-2xl font-black leading-none text-white", undefined, "Título del template")}</div>
          <div className="mt-2 flex items-center gap-2">
            <div className={zoneClass("qr", "flex h-9 w-9 items-center justify-center rounded bg-white/15 text-[7px] font-bold")} {...zoneProps("qr")}>
              {previewInput("templateQrText", qrDisplay, "text-center text-[7px] text-white", undefined, "Texto del QR")}
            </div>
            <div className={zoneClass("subtitle", "min-w-0 flex-1")} {...zoneProps("subtitle")}>{previewInput("templateSubtitle", subtitle, "text-[9px] text-white/75", undefined, "Subtítulo del template")}</div>
          </div>
          <div className="mt-2 max-w-xs">{kpiStrip("dark")}</div>
        </div>
        {showWeather && (
        <div className={zoneClass("weather", "absolute right-3 top-3 flex flex-col items-center px-2 py-1 text-white shadow-lg backdrop-blur")} style={{ background: `${wBg}dd`, borderRadius: cr, fontFamily: ff }} {...zoneProps("weather")}>
          {previewInput("templateWeatherLocation", weatherLocation, "text-center text-[6px] font-bold text-white", undefined, "Ubicación del clima")}
          <span className="text-xs">☁</span>
          {previewInput("templateTemperature", temperature, "text-center text-[9px] font-extrabold text-white", undefined, "Temperatura")}
        </div>
        )}
        {showTicker && (
        <div className="absolute inset-x-0 bottom-0 h-[12%] flex items-center gap-2 px-3" style={tickerStyle}>
          <span className={zoneClass("logo", "w-5 text-xs font-extrabold")} style={{ color: pc }} {...zoneProps("logo")}>{previewInput("templateLogoText", logoDisplay, "text-xs font-extrabold", { color: pc }, "Marca inferior")}</span>
          <div className={zoneClass("ticker", "min-w-0 flex-1")} {...zoneProps("ticker")}>{previewInput("templateTicker", ticker, "truncate text-[7px] font-semibold", undefined, "Ticker inferior")}</div>
        </div>
        )}
      </div>
    </div>
  );
}
