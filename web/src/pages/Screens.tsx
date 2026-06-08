import React, { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import {
  AlertTriangle,
  Building2,
  Factory,
  CalendarDays,
  Check,
  Code,
  DoorOpen,
  FileImage,
  FileVideo,
  Gauge,
  Globe,
  HeartPulse,
  Info,
  Monitor,
  Pencil,
  Plus,
  Presentation,
  RefreshCw,
  Rss,
  ShoppingBag,
  Trash2,
  UtensilsCrossed,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import QRCode from "qrcode";

const CONTENT_ICONS: Record<string, any> = {
  video: FileVideo,
  image: FileImage,
  webpage: Globe,
  dashboard: Globe,
  rss: Rss,
  html: Code,
};

const CONTENT_LABELS: Record<string, string> = {
  video: "Video",
  image: "Imagen",
  webpage: "Página Web",
  dashboard: "Dashboard",
  rss: "Feed RSS",
  html: "HTML",
};

const PURPOSE_ICONS: Record<string, any> = {
  manufacturing_logistics: Factory,
  office_communications: Building2,
  cafeteria_restaurant: UtensilsCrossed,
  retail_promotions: ShoppingBag,
  healthcare: HeartPulse,
  events: CalendarDays,
  public_information: Info,
  other: Monitor,
  office: Building2,
  public_info: Info,
  menu_board: UtensilsCrossed,
  lobby: DoorOpen,
  meeting_room: Presentation,
  production: Gauge,
};

const PURPOSE_LABELS: Record<string, string> = {
  manufacturing_logistics: "Manufacturing & Logistics",
  office_communications: "Office Communications",
  cafeteria_restaurant: "Cafeteria & Restaurant",
  retail_promotions: "Retail Promotions",
  healthcare: "Healthcare",
  events: "Events",
  public_information: "Public Information",
  other: "Other",
  office: "Oficina",
  public_info: "Información Pública",
  menu_board: "Menú Digital",
  lobby: "Lobby / Recepción",
  meeting_room: "Sala de Reuniones",
  production: "Producción / KPIs",
};

const LEGACY_PURPOSE_MAP: Record<string, string> = {
  office: "office_communications",
  public_info: "public_information",
  menu_board: "cafeteria_restaurant",
  lobby: "office_communications",
  meeting_room: "office_communications",
  production: "manufacturing_logistics",
};

const PURPOSE_OPTIONS = [
  { key: "manufacturing_logistics", description: "KPIs, safety, dispatch and operations." },
  { key: "office_communications", description: "Announcements, culture and internal comms." },
  { key: "cafeteria_restaurant", description: "Menus, specials and availability." },
  { key: "retail_promotions", description: "Offers, launches and visual promos." },
  { key: "healthcare", description: "Waiting rooms, wayfinding and safety notices." },
  { key: "events", description: "Schedules, welcome screens and live updates." },
  { key: "public_information", description: "Wayfinding, alerts and public notices." },
  { key: "other", description: "Flexible layout for custom use." },
];

const VIDEO_TEMPLATES = [
  { key: "full_bleed", label: "Video completo", description: "El contenido ocupa toda la pantalla." },
  { key: "media_left", label: "Video izquierda", description: "Video grande a la izquierda con panel informativo." },
  { key: "media_right", label: "Video derecha", description: "Video grande a la derecha con panel informativo." },
  { key: "hero_overlay", label: "Overlay inferior", description: "Video completo con banda inferior para texto." },
  { key: "center_stage", label: "Centro destacado", description: "Video centrado con marco y fondo de plantilla." },
];

function normalizePurpose(purpose?: string) {
  if (!purpose) return "other";
  return LEGACY_PURPOSE_MAP[purpose] || purpose;
}

type ScreenForm = {
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

type Toast = {
  type: "success" | "error";
  message: string;
} | null;

const emptyForm: ScreenForm = {
  name: "",
  location: "",
  resolution: "1920x1080",
  orientation: "landscape",
  purpose: "other",
  template: "full_bleed",
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

export default function Screens() {
  const [screens, setScreens] = useState<any[]>([]);
  const [contentItems, setContentItems] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [selectedScreenId, setSelectedScreenId] = useState<string | null>(null);
  const [form, setForm] = useState<ScreenForm>(emptyForm);
  const [pairCode, setPairCode] = useState<{ screenId: string; pairCode: string } | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [pickingContent, setPickingContent] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast>(null);

  const load = async () => {
    const [data, content] = await Promise.all([
      api.screens.list().catch(() => []),
      api.content.list().catch(() => []),
    ]);
    setScreens(data);
    setContentItems(content);
  };

  useEffect(() => { load(); }, []);

  const selectedScreen = useMemo(
    () => screens.find((screen) => screen.id === selectedScreenId) ?? null,
    [screens, selectedScreenId]
  );

  const screenStats = useMemo(() => {
    const online = screens.filter((screen) => isOnline(screen)).length;
    return {
      total: screens.length,
      online,
      offline: screens.length - online,
      assigned: screens.filter((screen) => screen.idleContentId).length,
    };
  }, [screens]);

  const showToast = (nextToast: Toast) => {
    setToast(nextToast);
    window.setTimeout(() => setToast(null), 3500);
  };

  function isOnline(screen: any) {
    if (!screen.lastHeartbeat) return false;
    const diff = Date.now() - new Date(screen.lastHeartbeat).getTime();
    return diff < 60000;
  }

  const getAssignedContent = (screen: any) =>
    contentItems.find((content: any) => content.id === screen.idleContentId) ?? null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const {
      template,
      templateHeadline,
      templateSubtitle,
      templateBadge,
      templateQrText,
      templateWeatherLocation,
      templateTemperature,
      templateTicker,
      templateLogoText,
      templatePrimaryColor,
      templateBgColor,
      templateTextColor,
      templateTickerBg,
      templateTickerText,
      templateWidgetBg,
      templateAccentColor,
      templateFontFamily,
      templateFontSizeScale,
      templateCornerRadius,
      templateTickerSpeed,
      templateTransition,
      templateMediaFit,
      templateShowWeather,
      templateShowTicker,
      templateCustomCSS,
      templateQrUrl,
      templateLogoUrl,
      templateGradientColor1,
      templateGradientColor2,
      templateGradientDirection,
      ...screenForm
    } = form;
    const payload: any = {
      ...screenForm,
      settings: {
        ...(editing?.settings ?? {}),
        template,
        templateHeadline,
        templateSubtitle,
        templateBadge,
        templateQrText,
        templateWeatherLocation,
        templateTemperature,
        templateTicker,
        templateLogoText,
        templatePrimaryColor,
        templateBgColor,
        templateTextColor,
        templateTickerBg,
        templateTickerText,
        templateWidgetBg,
        templateAccentColor,
        templateFontFamily,
        templateFontSizeScale,
        templateCornerRadius,
        templateTickerSpeed,
        templateTransition,
        templateMediaFit,
        templateShowWeather,
        templateShowTicker,
        templateCustomCSS,
        templateQrUrl,
        templateLogoUrl,
        templateGradientColor1,
        templateGradientColor2,
        templateGradientDirection,
      },
    };
    try {
      if (editing) {
        const updated = await api.screens.update(editing.id, payload);
        setSelectedScreenId(updated.id);
        showToast({ type: "success", message: "Pantalla actualizada." });
      } else {
        const created = await api.screens.create(payload);
        setSelectedScreenId(created.id);
        showToast({ type: "success", message: "Pantalla creada." });
      }
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
      load();
    } catch (err: any) {
      showToast({ type: "error", message: err.message || "No se pudo guardar la pantalla." });
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const handleEdit = (screen: any) => {
    setForm({
      name: screen.name,
      location: screen.location ?? "",
      resolution: screen.resolution,
      orientation: screen.orientation,
      purpose: normalizePurpose(screen.purpose),
      template: screen.settings?.template ?? "full_bleed",
      templateHeadline: screen.settings?.templateHeadline ?? "",
      templateSubtitle: screen.settings?.templateSubtitle ?? "",
      templateBadge: screen.settings?.templateBadge ?? "",
      templateQrText: screen.settings?.templateQrText ?? "",
      templateWeatherLocation: screen.settings?.templateWeatherLocation ?? "United Kingdom",
      templateTemperature: screen.settings?.templateTemperature ?? "16°C",
      templateTicker: screen.settings?.templateTicker ?? "",
      templateLogoText: screen.settings?.templateLogoText ?? "",
      templatePrimaryColor: screen.settings?.templatePrimaryColor ?? "",
      templateBgColor: screen.settings?.templateBgColor ?? "",
      templateTextColor: screen.settings?.templateTextColor ?? "",
      templateTickerBg: screen.settings?.templateTickerBg ?? "",
      templateTickerText: screen.settings?.templateTickerText ?? "",
      templateWidgetBg: screen.settings?.templateWidgetBg ?? "",
      templateAccentColor: screen.settings?.templateAccentColor ?? "",
      templateFontFamily: screen.settings?.templateFontFamily ?? "system",
      templateFontSizeScale: screen.settings?.templateFontSizeScale ?? "1.0",
      templateCornerRadius: screen.settings?.templateCornerRadius ?? "subtle",
      templateTickerSpeed: screen.settings?.templateTickerSpeed ?? "normal",
      templateTransition: screen.settings?.templateTransition ?? "none",
      templateMediaFit: screen.settings?.templateMediaFit ?? "cover",
      templateShowWeather: screen.settings?.templateShowWeather ?? "yes",
      templateShowTicker: screen.settings?.templateShowTicker ?? "yes",
      templateCustomCSS: screen.settings?.templateCustomCSS ?? "",
      templateQrUrl: screen.settings?.templateQrUrl ?? "",
      templateLogoUrl: screen.settings?.templateLogoUrl ?? "",
      templateGradientColor1: screen.settings?.templateGradientColor1 ?? "",
      templateGradientColor2: screen.settings?.templateGradientColor2 ?? "",
      templateGradientDirection: screen.settings?.templateGradientDirection ?? "to_bottom",
    });
    setEditing(screen);
    setShowForm(true);
    setSelectedScreenId(screen.id);
  };

  const requestDelete = (screen: any) => {
    setDeleteError(null);
    setDeleteTarget(screen);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await api.screens.delete(deleteTarget.id);
      if (selectedScreenId === deleteTarget.id) setSelectedScreenId(null);
      setDeleteTarget(null);
      showToast({ type: "success", message: `Pantalla "${deleteTarget.name}" eliminada.` });
      await load();
    } catch (err: any) {
      const message = err.message || "No se pudo eliminar la pantalla.";
      setDeleteError(message);
      showToast({ type: "error", message });
    } finally {
      setDeleting(false);
    }
  };

  const assignContent = async (screenId: string, contentId: string | null) => {
    try {
      await api.screens.update(screenId, { idleContentId: contentId || undefined });
      setPickingContent(null);
      showToast({ type: "success", message: contentId ? "Contenido asignado." : "Contenido quitado." });
      load();
    } catch (err: any) {
      showToast({ type: "error", message: err.message || "No se pudo asignar el contenido." });
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await api.player.sync();
      showToast({ type: "success", message: "Pantallas sincronizadas." });
    } catch (err: any) {
      showToast({ type: "error", message: err.message || "No se pudo sincronizar." });
    } finally {
      setSyncing(false);
    }
  };

  const handleClearCache = async () => {
    setClearing(true);
    try {
      await api.player.clearCache();
      showToast({ type: "success", message: "Caché del player limpiado." });
    } catch (err: any) {
      showToast({ type: "error", message: err.message || "No se pudo limpiar la caché." });
    } finally {
      setClearing(false);
    }
  };

  const generatePairCode = async () => {
    try {
      const res = await api.screens.getPairCode();
      setPairCode(res);
      setSelectedScreenId(res.screenId);
      const pairingUrl = `${window.location.origin}/player?pair=${res.pairCode}`;
      const dataUrl = await QRCode.toDataURL(pairingUrl, { width: 200, margin: 2 });
      setQrDataUrl(dataUrl);
      showToast({ type: "success", message: "Código de vinculación generado." });
      load();
    } catch (err: any) {
      setQrDataUrl(null);
      showToast({ type: "error", message: err.message || "No se pudo generar el código." });
    }
  };

  const renderAssignedContent = (screen: any, compact = false) => {
    const assigned = getAssignedContent(screen);
    const Icon = assigned ? (CONTENT_ICONS[assigned.type] || Monitor) : Monitor;
    return (
      <button
        onClick={(event) => {
          event.stopPropagation();
          setPickingContent(screen);
          setSelectedScreenId(screen.id);
        }}
        className={`w-full text-left rounded-lg border border-dashed p-3 transition-colors ${
          assigned
            ? "border-amber-200 bg-amber-50/70 hover:border-amber-300"
            : "border-gray-300 hover:border-brand-400 hover:bg-brand-50/60"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${assigned ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-400"}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">
              {assigned ? assigned.title : "Sin contenido asignado"}
            </p>
            <p className={`text-xs ${assigned ? "text-amber-700" : "text-gray-500"}`}>
              {assigned ? `${CONTENT_LABELS[assigned.type] || assigned.type} idle` : compact ? "Asignar contenido" : "Asignar contenido idle"}
            </p>
          </div>
          <span className="text-xs font-medium text-brand-600">Cambiar</span>
        </div>
      </button>
    );
  };

  const FONT_MAP: Record<string, string> = {
    system: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    sans: 'Inter, "Helvetica Neue", Arial, sans-serif',
    serif: 'Georgia, "Times New Roman", serif',
    mono: '"SF Mono", "Fira Code", monospace',
    display: '"Poppins", "SF Pro Display", system-ui, sans-serif',
  };
  const RADIUS_MAP: Record<string, string> = {
    none: "0px", subtle: "4px", rounded: "8px", pill: "9999px",
  };

  const renderTemplatePreview = (template: string, purpose: string) => {
    const purposeLabel = PURPOSE_LABELS[normalizePurpose(purpose)] || "Template";
    const badge = form.templateBadge.trim() || purposeLabel;
    const headline = form.templateHeadline.trim() || "Título, avisos o datos";
    const subtitle = form.templateSubtitle.trim() || "Mensaje secundario editable";
    const qrText = form.templateQrText.trim() || "QR";
    const weatherLocation = form.templateWeatherLocation.trim() || "United Kingdom";
    const temperature = form.templateTemperature.trim() || "16°C";
    const ticker = form.templateTicker.trim() || "News ticker message goes here and can be edited for this screen";
    const logoText = form.templateLogoText.trim() || "▲";

    const pc = form.templatePrimaryColor || "#3b82f6";
    const bg = form.templateBgColor || "#ffffff";
    const txt = form.templateTextColor || "#111827";
    const accent = form.templateAccentColor || "#244244";
    const tkBg = form.templateTickerBg || "#ffffff";
    const tkTxt = form.templateTickerText || "#0f172a";
    const wBg = form.templateWidgetBg || pc;
    const ff = FONT_MAP[form.templateFontFamily] || FONT_MAP.system;
    const cr = RADIUS_MAP[form.templateCornerRadius] || "4px";

    const showWeather = form.templateShowWeather !== "no";
    const showTicker = form.templateShowTicker !== "no";
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

    if (template === "full_bleed") {
      return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-slate-950 p-2 shadow-inner">
          <div className="relative aspect-video overflow-hidden rounded-lg" style={{ background: slideBg }}>
            <div className="flex h-full items-center justify-center text-sm font-bold uppercase tracking-wide text-white/85">Video / Imagen</div>
          </div>
        </div>
      );
    }

    if (template === "media_left" || template === "media_right") {
      const mediaFirst = template === "media_left";
      return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-slate-950 p-2 shadow-inner">
          <div className="relative aspect-video overflow-hidden rounded-lg" style={{ background: slideBg }}>
            <div className="absolute inset-x-0 top-0 bottom-[17%] grid grid-cols-[34%_42%_24%]">
              <div className={`${mediaFirst ? "order-1" : "order-2"} bg-gradient-to-br from-slate-300 via-brand-200 to-slate-600`}>
                <div className="flex h-full items-center justify-center text-xs font-bold uppercase tracking-wide text-white/85">Video / Imagen</div>
              </div>
              <div className={`${mediaFirst ? "order-2" : "order-1"} relative p-4`} style={{ background: `linear-gradient(135deg, ${pc}33, ${pc}88)`, color: txt }}>
                <p className="text-[10px] font-bold" style={{ color: txt }}>{badge}</p>
                <p className="relative mt-1 text-lg font-black leading-none">{headline}</p>
                <div className="relative mt-3 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center text-[9px] font-black" style={{ background: bg, color: accent, borderRadius: cr }}>{qrDisplay}</div>
                  <p className="text-[10px] leading-tight" style={{ color: txt }}>{subtitle}</p>
                </div>
              </div>
              {showWeather && (
              <div className="order-3 p-4" style={{ background: wBg, color: "#fff", fontFamily: ff }}>
                <p className="text-sm font-black">{weatherLocation}</p>
                <p className="mt-4 text-4xl">☁</p>
                <p className="mt-2 text-2xl font-black">{temperature}</p>
                <p className="text-[9px] text-white/75">Feels like 16°</p>
              </div>
              )}
            </div>
            {showTicker && (
            <div className="absolute inset-x-0 bottom-0 h-[17%] flex items-center gap-3 px-4" style={tickerStyle}>
              <div className="text-2xl font-black" style={{ color: pc }}>{logoDisplay}</div>
              <div className="truncate text-xs font-bold">{ticker}</div>
            </div>
            )}
          </div>
        </div>
      );
    }

    if (template === "center_stage") {
      return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-slate-950 p-2 shadow-inner">
          <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
            <div className="absolute inset-x-0 top-0 bottom-[20%]" style={{ background: slideBg }}>
              <div className="flex h-full items-center justify-center text-xs font-bold uppercase tracking-wide text-white/85">Video / Imagen</div>
            </div>
            <div className="absolute inset-x-0 bottom-[6%] flex items-center gap-2 px-3 py-2 text-white" style={{ background: `${pc}88` }}>
              <span className="text-[7px] font-bold opacity-90">{badge}</span>
              <span className="text-[10px] font-black">{headline}</span>
              {showWeather && (
              <span className="ml-auto flex items-center gap-1 text-[7px] opacity-75">
                <span>☁</span> {temperature}
              </span>
              )}
            </div>
            {showTicker && (
            <div className="absolute inset-x-0 bottom-0 h-[6%] flex items-center gap-2 px-3" style={tickerStyle}>
              <span className="text-xs font-black" style={{ color: pc }}>{logoDisplay}</span>
              <span className="truncate text-[7px] font-bold">{ticker}</span>
            </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-slate-950 p-2 shadow-inner">
        <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
          <div className="absolute inset-0" style={{ background: slideBg }}>
            <div className="flex h-full items-center justify-center text-xs font-bold uppercase tracking-wide text-white/85">Video / Imagen</div>
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 pb-2 pt-8 text-white">
            <p className="text-[7px] font-bold" style={{ color: pc }}>{badge}</p>
            <p className="text-xs font-black leading-tight">{headline}</p>
            <p className="mt-0.5 text-[7px] text-white/70">{subtitle}</p>
          </div>
          {showWeather && (
          <div className="absolute right-1 top-1 flex flex-col items-center px-1.5 py-0.5 text-white" style={{ background: wBg, borderRadius: cr, fontFamily: ff }}>
            <span className="text-[6px] font-bold">{weatherLocation}</span>
            <span className="text-xs">☁</span>
            <span className="text-[9px] font-black">{temperature}</span>
          </div>
          )}
          {showTicker && (
          <div className="absolute inset-x-0 bottom-0 h-[12%] flex items-center gap-2 px-3" style={tickerStyle}>
            <span className="text-xs font-black" style={{ color: pc }}>{logoDisplay}</span>
            <span className="truncate text-[7px] font-bold">{ticker}</span>
          </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-brand-700">Centro de control</p>
          <h1 className="text-2xl font-bold text-gray-900">Pantallas</h1>
          <p className="mt-1 text-sm text-gray-500">
            Administra cada pantalla, su contenido idle, conexión y acciones del player desde un solo lugar.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={generatePairCode} className="btn-secondary">
            <Monitor className="mr-2 h-4 w-4" />
            Vincular pantalla
          </button>
          <button onClick={handleSync} disabled={syncing} className="btn-secondary">
            <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            Sincronizar
          </button>
          <button onClick={handleClearCache} disabled={clearing} className="btn-secondary text-red-600 hover:border-red-200 hover:bg-red-50">
            <Trash2 className="mr-2 h-4 w-4" />
            Limpiar caché
          </button>
          <button onClick={openCreate} className="btn-primary">
            <Plus className="mr-2 h-4 w-4" />
            Nueva pantalla
          </button>
        </div>
      </div>

      {toast && (
        <div className={`mb-4 flex items-center justify-between rounded-lg border px-4 py-3 text-sm ${
          toast.type === "success"
            ? "border-green-200 bg-green-50 text-green-800"
            : "border-red-200 bg-red-50 text-red-800"
        }`}>
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="rounded p-1 opacity-70 hover:opacity-100">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Total</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{screenStats.total}</p>
        </div>
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-green-700">Online</p>
          <p className="mt-1 text-2xl font-bold text-green-700">{screenStats.online}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Offline</p>
          <p className="mt-1 text-2xl font-bold text-gray-700">{screenStats.offline}</p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-amber-700">Con contenido</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">{screenStats.assigned}</p>
        </div>
      </div>

      {pairCode && (
        <div className="mb-6 rounded-lg border border-brand-200 bg-brand-50 p-4 animate-slide-down">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-brand-900">Código de vinculación</h2>
              <p className="mt-1 text-sm text-brand-700">Abre el player en la TV y escribe este código.</p>
              <p className="mt-3 text-4xl font-bold tracking-widest text-brand-700">{pairCode.pairCode}</p>
            </div>
            <div className="flex items-center gap-3">
              {qrDataUrl && <img src={qrDataUrl} alt="QR de vinculación" className="h-28 w-28 rounded bg-white p-1" />}
              <button onClick={() => { setPairCode(null); setQrDataUrl(null); }} className="btn-secondary">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm animate-slide-down">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{editing ? "Editar pantalla" : "Nueva pantalla"}</h2>
                <p className="text-sm text-gray-500">Define los datos básicos para identificarla en operación.</p>
              </div>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="label">Nombre</label>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="label">Ubicación</label>
                <input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
              <div>
                <label className="label">Resolución</label>
                <select className="input" value={form.resolution} onChange={(e) => setForm({ ...form, resolution: e.target.value })}>
                  <option value="1920x1080">1920x1080 (Full HD)</option>
                  <option value="3840x2160">3840x2160 (4K)</option>
                  <option value="1366x768">1366x768</option>
                </select>
              </div>
              <div>
                <label className="label">Orientación</label>
                <select className="input" value={form.orientation} onChange={(e) => setForm({ ...form, orientation: e.target.value as any })}>
                  <option value="landscape">Horizontal</option>
                  <option value="portrait">Vertical</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="label mb-2">Template por industria</label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
                  {PURPOSE_OPTIONS.map(({ key, description }) => {
                    const Icon = PURPOSE_ICONS[key] || Monitor;
                    return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setForm({ ...form, purpose: key })}
                      className={`flex min-h-24 flex-col items-start justify-center gap-1 rounded-lg border p-3 text-left transition-colors ${
                        form.purpose === key
                          ? "border-brand-500 bg-brand-50 text-brand-700"
                          : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${form.purpose === key ? "text-brand-600" : "text-gray-400"}`} />
                      <span className="text-sm font-semibold leading-tight">{PURPOSE_LABELS[key]}</span>
                      <span className="text-xs leading-snug text-gray-500">{description}</span>
                    </button>
                    );
                  })}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="label mb-2">Dónde poner el video o contenido</label>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {VIDEO_TEMPLATES.map((template) => (
                      <button
                        key={template.key}
                        type="button"
                        onClick={() => setForm({ ...form, template: template.key })}
                        className={`rounded-lg border p-3 text-left transition-colors ${
                          form.template === template.key
                            ? "border-brand-500 bg-brand-50 text-brand-700"
                            : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <span className="text-sm font-semibold">{template.label}</span>
                        <span className="mt-1 block text-xs leading-snug text-gray-500">{template.description}</span>
                      </button>
                    ))}
                  </div>
                  {renderTemplatePreview(form.template, form.purpose)}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="label mb-2">Texto del template</label>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <input
                      className="input"
                      value={form.templateBadge}
                      onChange={(e) => setForm({ ...form, templateBadge: e.target.value })}
                      placeholder="Badge: Oferta de hoy"
                    />
                    <p className="mt-1 text-xs text-gray-400">Etiqueta superior.</p>
                  </div>
                  <div>
                    <input
                      className="input"
                      value={form.templateHeadline}
                      onChange={(e) => setForm({ ...form, templateHeadline: e.target.value })}
                      placeholder="Título: 2x1 en cafés"
                    />
                    <p className="mt-1 text-xs text-gray-400">Texto principal.</p>
                  </div>
                  <div>
                    <input
                      className="input"
                      value={form.templateSubtitle}
                      onChange={(e) => setForm({ ...form, templateSubtitle: e.target.value })}
                      placeholder="Subtítulo: Disponible hasta las 3 PM"
                    />
                    <p className="mt-1 text-xs text-gray-400">Texto secundario.</p>
                  </div>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="label mb-2">Extras del template</label>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                  <div>
                    <input
                      className="input"
                      value={form.templateQrText}
                      onChange={(e) => setForm({ ...form, templateQrText: e.target.value })}
                      placeholder="QR"
                    />
                    <p className="mt-1 text-xs text-gray-400">Texto dentro del QR.</p>
                  </div>
                  <div>
                    <input
                      className="input"
                      value={form.templateWeatherLocation}
                      onChange={(e) => setForm({ ...form, templateWeatherLocation: e.target.value })}
                      placeholder="United Kingdom"
                    />
                    <p className="mt-1 text-xs text-gray-400">Panel clima.</p>
                  </div>
                  <div>
                    <input
                      className="input"
                      value={form.templateTemperature}
                      onChange={(e) => setForm({ ...form, templateTemperature: e.target.value })}
                      placeholder="16°C"
                    />
                    <p className="mt-1 text-xs text-gray-400">Temperatura.</p>
                  </div>
                  <div>
                    <input
                      className="input"
                      value={form.templateLogoText}
                      onChange={(e) => setForm({ ...form, templateLogoText: e.target.value })}
                      placeholder="▲"
                    />
                    <p className="mt-1 text-xs text-gray-400">Marca inferior.</p>
                  </div>
                  <div>
                    <input
                      className="input"
                      value={form.templateTicker}
                      onChange={(e) => setForm({ ...form, templateTicker: e.target.value })}
                      placeholder="Ticker inferior..."
                    />
                    <p className="mt-1 text-xs text-gray-400">Mensaje inferior.</p>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="label mb-2">Personalización visual</label>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-7">
                    <div>
                      <label className="text-xs font-medium text-gray-500">Color principal</label>
                      <div className="mt-1 flex items-center gap-2">
                        <input type="color" className="h-9 w-9 cursor-pointer rounded border border-gray-300"
                          value={form.templatePrimaryColor || "#3b82f6"}
                          onChange={(e) => setForm({ ...form, templatePrimaryColor: e.target.value })} />
                        <input className="input flex-1" placeholder="#3b82f6"
                          value={form.templatePrimaryColor}
                          onChange={(e) => setForm({ ...form, templatePrimaryColor: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Fondo</label>
                      <div className="mt-1 flex items-center gap-2">
                        <input type="color" className="h-9 w-9 cursor-pointer rounded border border-gray-300"
                          value={form.templateBgColor || "#ffffff"}
                          onChange={(e) => setForm({ ...form, templateBgColor: e.target.value })} />
                        <input className="input flex-1" placeholder="#ffffff"
                          value={form.templateBgColor}
                          onChange={(e) => setForm({ ...form, templateBgColor: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Texto</label>
                      <div className="mt-1 flex items-center gap-2">
                        <input type="color" className="h-9 w-9 cursor-pointer rounded border border-gray-300"
                          value={form.templateTextColor || "#111827"}
                          onChange={(e) => setForm({ ...form, templateTextColor: e.target.value })} />
                        <input className="input flex-1" placeholder="#111827"
                          value={form.templateTextColor}
                          onChange={(e) => setForm({ ...form, templateTextColor: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Acento</label>
                      <div className="mt-1 flex items-center gap-2">
                        <input type="color" className="h-9 w-9 cursor-pointer rounded border border-gray-300"
                          value={form.templateAccentColor || "#244244"}
                          onChange={(e) => setForm({ ...form, templateAccentColor: e.target.value })} />
                        <input className="input flex-1" placeholder="#244244"
                          value={form.templateAccentColor}
                          onChange={(e) => setForm({ ...form, templateAccentColor: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Widget</label>
                      <div className="mt-1 flex items-center gap-2">
                        <input type="color" className="h-9 w-9 cursor-pointer rounded border border-gray-300"
                          value={form.templateWidgetBg || "#e0f2fe"}
                          onChange={(e) => setForm({ ...form, templateWidgetBg: e.target.value })} />
                        <input className="input flex-1" placeholder="Auto"
                          value={form.templateWidgetBg}
                          onChange={(e) => setForm({ ...form, templateWidgetBg: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Ticker fondo</label>
                      <div className="mt-1 flex items-center gap-2">
                        <input type="color" className="h-9 w-9 cursor-pointer rounded border border-gray-300"
                          value={form.templateTickerBg || "#ffffff"}
                          onChange={(e) => setForm({ ...form, templateTickerBg: e.target.value })} />
                        <input className="input flex-1" placeholder="#ffffff"
                          value={form.templateTickerBg}
                          onChange={(e) => setForm({ ...form, templateTickerBg: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Ticker texto</label>
                      <div className="mt-1 flex items-center gap-2">
                        <input type="color" className="h-9 w-9 cursor-pointer rounded border border-gray-300"
                          value={form.templateTickerText || "#0f172a"}
                          onChange={(e) => setForm({ ...form, templateTickerText: e.target.value })} />
                        <input className="input flex-1" placeholder="#0f172a"
                          value={form.templateTickerText}
                          onChange={(e) => setForm({ ...form, templateTickerText: e.target.value })} />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500">Tipografía</label>
                      <select className="input mt-1" value={form.templateFontFamily}
                        onChange={(e) => setForm({ ...form, templateFontFamily: e.target.value })}>
                        <option value="system">Sistema (predeterminado)</option>
                        <option value="sans">Sans-serif moderna</option>
                        <option value="serif">Serif</option>
                        <option value="mono">Monoespaciada</option>
                        <option value="display">Display decorativa</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Escala de texto</label>
                      <div className="mt-1 flex gap-1">
                        {["0.8", "0.9", "1.0", "1.1", "1.2"].map((s) => (
                          <button key={s} type="button"
                            onClick={() => setForm({ ...form, templateFontSizeScale: s })}
                            className={`flex-1 rounded border px-2 py-1.5 text-xs font-medium transition-colors ${
                              form.templateFontSizeScale === s
                                ? "border-brand-500 bg-brand-50 text-brand-700"
                                : "border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}>
                            {s}x
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Esquinas</label>
                      <div className="mt-1 flex gap-1">
                        {[
                          { key: "none", label: "Ninguna" },
                          { key: "subtle", label: "Sutiles" },
                          { key: "rounded", label: "Redondeadas" },
                          { key: "pill", label: "Píldora" },
                        ].map((opt) => (
                          <button key={opt.key} type="button"
                            onClick={() => setForm({ ...form, templateCornerRadius: opt.key })}
                            className={`flex-1 rounded border px-2 py-1.5 text-xs font-medium transition-colors ${
                              form.templateCornerRadius === opt.key
                                ? "border-brand-500 bg-brand-50 text-brand-700"
                                : "border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="label mb-2">Extras — URLs</label>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <input className="input" value={form.templateQrUrl}
                      onChange={(e) => setForm({ ...form, templateQrUrl: e.target.value })}
                      placeholder="https://ejemplo.com" />
                    <p className="mt-1 text-xs text-gray-400">URL para código QR (reemplaza el texto QR).</p>
                  </div>
                  <div>
                    <input className="input" value={form.templateLogoUrl}
                      onChange={(e) => setForm({ ...form, templateLogoUrl: e.target.value })}
                      placeholder="https://ejemplo.com/logo.png" />
                    <p className="mt-1 text-xs text-gray-400">URL de imagen para el logo (reemplaza el texto).</p>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="label mb-2">Comportamiento</label>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500">Velocidad del ticker</label>
                      <select className="input mt-1" value={form.templateTickerSpeed}
                        onChange={(e) => setForm({ ...form, templateTickerSpeed: e.target.value })}>
                        <option value="slow">Lenta</option>
                        <option value="normal">Normal</option>
                        <option value="fast">Rápida</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Transición</label>
                      <select className="input mt-1" value={form.templateTransition}
                        onChange={(e) => setForm({ ...form, templateTransition: e.target.value })}>
                        <option value="none">Ninguna</option>
                        <option value="fade">Fundido</option>
                        <option value="slide">Deslizar</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Ajuste de imagen</label>
                      <select className="input mt-1" value={form.templateMediaFit}
                        onChange={(e) => setForm({ ...form, templateMediaFit: e.target.value })}>
                        <option value="cover">Cubrir (recortar)</option>
                        <option value="contain">Contener (ajustar)</option>
                        <option value="fill">Rellenar (estirar)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Escala (ancho)</label>
                      <input className="input mt-1" value={form.templateFontSizeScale}
                        onChange={(e) => setForm({ ...form, templateFontSizeScale: e.target.value })}
                        placeholder="1.0" />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input type="checkbox" className="rounded border-gray-300 text-brand-600"
                        checked={form.templateShowWeather !== "no"}
                        onChange={(e) => setForm({ ...form, templateShowWeather: e.target.checked ? "yes" : "no" })} />
                      Mostrar clima
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input type="checkbox" className="rounded border-gray-300 text-brand-600"
                        checked={form.templateShowTicker !== "no"}
                        onChange={(e) => setForm({ ...form, templateShowTicker: e.target.checked ? "yes" : "no" })} />
                      Mostrar ticker inferior
                    </label>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="label mb-2">Fondo degradado</label>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500">Color inicial</label>
                      <div className="mt-1 flex items-center gap-2">
                        <input type="color" className="h-9 w-9 cursor-pointer rounded border border-gray-300"
                          value={form.templateGradientColor1 || "#ffffff"}
                          onChange={(e) => setForm({ ...form, templateGradientColor1: e.target.value })} />
                        <input className="input flex-1" placeholder="#ffffff"
                          value={form.templateGradientColor1}
                          onChange={(e) => setForm({ ...form, templateGradientColor1: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Color final</label>
                      <div className="mt-1 flex items-center gap-2">
                        <input type="color" className="h-9 w-9 cursor-pointer rounded border border-gray-300"
                          value={form.templateGradientColor2 || "#e5e7eb"}
                          onChange={(e) => setForm({ ...form, templateGradientColor2: e.target.value })} />
                        <input className="input flex-1" placeholder="#e5e7eb"
                          value={form.templateGradientColor2}
                          onChange={(e) => setForm({ ...form, templateGradientColor2: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Dirección</label>
                      <select className="input mt-1" value={form.templateGradientDirection}
                        onChange={(e) => setForm({ ...form, templateGradientDirection: e.target.value })}>
                        <option value="to_bottom">⬇ Hacia abajo</option>
                        <option value="to_right">➡ Hacia la derecha</option>
                        <option value="to_bottom_right">↘ Diagonal</option>
                        <option value="to_left">⬅ Hacia la izquierda</option>
                        <option value="to_top">⬆ Hacia arriba</option>
                      </select>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-400">Si ambos colores están vacíos se usa el color de fondo sólido.</p>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="label mb-2">CSS personalizado</label>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <textarea className="input font-mono text-xs" rows={4}
                    value={form.templateCustomCSS}
                    onChange={(e) => setForm({ ...form, templateCustomCSS: e.target.value })}
                    placeholder=".tpl-headline { text-shadow: 2px 2px 4px rgba(0,0,0,0.5); }" />
                  <p className="mt-1 text-xs text-gray-400">Se inyecta dentro del slide en el player. Solo para usuarios avanzados.</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">{editing ? "Guardar cambios" : "Crear pantalla"}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="btn-secondary">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {screens.map((screen) => {
            const online = isOnline(screen);
            const normalizedPurpose = normalizePurpose(screen.purpose);
            const PurposeIcon = PURPOSE_ICONS[normalizedPurpose] || Monitor;
            const selected = selectedScreenId === screen.id;
            return (
              <div
                key={screen.id}
                className={`rounded-lg border bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                  selected ? "border-brand-500 ring-2 ring-brand-100" : "border-gray-200"
                }`}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${online ? "bg-green-50" : "bg-gray-100"}`}>
                      <Monitor className={`h-5 w-5 ${online ? "text-green-600" : "text-gray-400"}`} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-gray-900">{screen.name}</h3>
                      <p className="truncate text-xs text-gray-500">{screen.location || "Sin ubicación"}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                      online ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                      {online ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>

                <div className="mb-4 grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <span className="rounded-md bg-gray-50 px-2 py-1">{screen.resolution}</span>
                  <span className="rounded-md bg-gray-50 px-2 py-1">{screen.orientation === "portrait" ? "Vertical" : "Horizontal"}</span>
                  <span className="col-span-2 flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1">
                    <PurposeIcon className="h-3.5 w-3.5" />
                    {PURPOSE_LABELS[normalizedPurpose] || normalizedPurpose}
                  </span>
                </div>

                {renderAssignedContent(screen, true)}

                <div className="mt-4 border-t border-gray-100 pt-3">
                  <span className="text-xs text-gray-400">
                    {screen.lastHeartbeat ? `Último: ${new Date(screen.lastHeartbeat).toLocaleString("es")}` : "Sin heartbeat"}
                  </span>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedScreenId(screen.id)}
                      className="rounded-md border border-gray-200 px-2 py-2 text-xs font-medium text-gray-700 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
                    >
                      Ver detalle
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEdit(screen)}
                      className="inline-flex items-center justify-center rounded-md border border-gray-200 px-2 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
                      aria-label={`Editar ${screen.name}`}
                    >
                      <Pencil className="mr-1 h-3.5 w-3.5" />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => requestDelete(screen)}
                      className="inline-flex items-center justify-center rounded-md border border-red-100 px-2 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                      aria-label={`Eliminar ${screen.name}`}
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {screens.length === 0 && (
            <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center md:col-span-2">
              <Monitor className="mx-auto h-10 w-10 text-gray-300" />
              <h2 className="mt-3 font-semibold text-gray-900">No hay pantallas registradas</h2>
              <p className="mt-1 text-sm text-gray-500">Crea una pantalla o genera un código para vincular una TV.</p>
              <button onClick={generatePairCode} className="btn-primary mt-4">
                <Monitor className="mr-2 h-4 w-4" />
                Vincular primera pantalla
              </button>
            </div>
          )}
        </div>

        <aside className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm xl:sticky xl:top-6 xl:self-start">
          {selectedScreen ? (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Detalle de pantalla</p>
                  <h2 className="mt-1 text-xl font-bold text-gray-900">{selectedScreen.name}</h2>
                  <p className="text-sm text-gray-500">{selectedScreen.location || "Sin ubicación"}</p>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                  isOnline(selectedScreen) ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                }`}>
                  {isOnline(selectedScreen) ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                  {isOnline(selectedScreen) ? "Online" : "Offline"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Resolución</p>
                  <p className="font-medium text-gray-900">{selectedScreen.resolution}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Orientación</p>
                  <p className="font-medium text-gray-900">{selectedScreen.orientation === "portrait" ? "Vertical" : "Horizontal"}</p>
                </div>
                <div className="col-span-2 rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Propósito</p>
                  <p className="mt-1 flex items-center gap-2 font-medium text-gray-900">
                    {React.createElement(PURPOSE_ICONS[normalizePurpose(selectedScreen.purpose)] || Monitor, { className: "h-4 w-4 text-gray-500" })}
                    {PURPOSE_LABELS[normalizePurpose(selectedScreen.purpose)] || normalizePurpose(selectedScreen.purpose)}
                  </p>
                </div>
                <div className="col-span-2 rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Ubicación de video</p>
                  <p className="font-medium text-gray-900">
                    {VIDEO_TEMPLATES.find((template) => template.key === selectedScreen.settings?.template)?.label ?? "Video completo"}
                  </p>
                </div>
                <div className="col-span-2 rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Texto del template</p>
                  <p className="font-medium text-gray-900">
                    {selectedScreen.settings?.templateHeadline || selectedScreen.settings?.templateBadge || "Automático"}
                  </p>
                  {selectedScreen.settings?.templateSubtitle && (
                    <p className="mt-1 text-xs text-gray-500">{selectedScreen.settings.templateSubtitle}</p>
                  )}
                </div>
                <div className="col-span-2 rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Último heartbeat</p>
                  <p className="font-medium text-gray-900">
                    {selectedScreen.lastHeartbeat ? new Date(selectedScreen.lastHeartbeat).toLocaleString("es") : "Sin actividad registrada"}
                  </p>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">Contenido idle</h3>
                  <span className="text-xs text-gray-400">Se muestra sin programación activa</span>
                </div>
                {renderAssignedContent(selectedScreen)}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => handleEdit(selectedScreen)} className="btn-secondary">
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </button>
                <button onClick={() => requestDelete(selectedScreen)} className="btn-secondary text-red-600 hover:border-red-200 hover:bg-red-50">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </button>
                <button onClick={handleSync} disabled={syncing} className="btn-secondary col-span-2">
                  <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
                  Sincronizar pantallas
                </button>
                <button onClick={handleClearCache} disabled={clearing} className="btn-secondary col-span-2 text-red-600 hover:border-red-200 hover:bg-red-50">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Limpiar caché del player
                </button>
              </div>

              {pairCode && pairCode.screenId === selectedScreen.id && (
                <div className="rounded-lg border border-brand-200 bg-brand-50 p-4">
                  <p className="text-sm font-semibold text-brand-900">Código activo</p>
                  <p className="mt-2 text-3xl font-bold tracking-widest text-brand-700">{pairCode.pairCode}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-10 text-center">
              <Monitor className="mx-auto h-10 w-10 text-gray-300" />
              <h2 className="mt-3 font-semibold text-gray-900">Selecciona una pantalla</h2>
              <p className="mt-1 text-sm text-gray-500">Aquí aparecerán sus acciones, contenido y estado.</p>
            </div>
          )}
        </aside>
      </div>

      {pickingContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in" onClick={() => setPickingContent(null)}>
          <div className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-lg bg-white p-5 shadow-xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Contenido para {pickingContent.name}</h2>
                <p className="text-sm text-gray-500">Elige qué se mostrará cuando no haya programación activa.</p>
              </div>
              <button onClick={() => setPickingContent(null)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
              <button
                onClick={() => assignContent(pickingContent.id, null)}
                className="w-full rounded-lg border border-dashed border-gray-300 p-3 text-left transition-colors hover:border-gray-400 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gray-100 text-gray-400">
                    <Monitor className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Ninguno</p>
                    <p className="text-xs text-gray-500">La pantalla queda sin contenido idle.</p>
                  </div>
                </div>
              </button>
              {contentItems.map((content: any) => {
                const Icon = CONTENT_ICONS[content.type] || Monitor;
                const isSelected = content.id === pickingContent.idleContentId;
                return (
                  <button
                    key={content.id}
                    onClick={() => assignContent(pickingContent.id, content.id)}
                    className={`w-full rounded-lg border p-3 text-left transition-colors hover:border-brand-400 hover:bg-brand-50/60 ${
                      isSelected ? "border-brand-500 bg-brand-50" : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-md ${isSelected ? "bg-brand-100 text-brand-600" : "bg-gray-100 text-gray-500"}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">{content.title}</p>
                        <p className="text-xs text-gray-500">{CONTENT_LABELS[content.type] || content.type}</p>
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-brand-600" />}
                    </div>
                  </button>
                );
              })}
              {contentItems.length === 0 && (
                <p className="py-8 text-center text-sm text-gray-400">No hay contenido disponible todavía.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in" onClick={() => setDeleteTarget(null)}>
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Eliminar pantalla</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Vas a eliminar <span className="font-semibold text-gray-900">{deleteTarget.name}</span>. También se quitarán sus vínculos con programaciones y grupos relacionados.
                </p>
              </div>
            </div>
            <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-800">
              Esta acción no se puede deshacer desde la app.
            </div>
            {deleteError && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">
                {deleteError}
              </div>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setDeleteTarget(null)} className="btn-secondary" disabled={deleting}>Cancelar</button>
              <button type="button" onClick={confirmDelete} className="btn-danger" disabled={deleting}>
                <Trash2 className="mr-2 h-4 w-4" />
                {deleting ? "Eliminando..." : "Sí, eliminar pantalla"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
