import {
  Building2,
  Factory,
  CalendarDays,
  Code,
  DoorOpen,
  FileImage,
  FileVideo,
  Gauge,
  Globe,
  HeartPulse,
  Info,
  Monitor,
  Presentation,
  Rss,
  ShoppingBag,
  UtensilsCrossed,
} from "lucide-react";
import { TemplateZone } from "./types";

export const CONTENT_ICONS: Record<string, any> = {
  video: FileVideo,
  image: FileImage,
  webpage: Globe,
  dashboard: Globe,
  rss: Rss,
  html: Code,
};

export const CONTENT_LABELS: Record<string, string> = {
  video: "Video",
  image: "Imagen",
  webpage: "Página Web",
  dashboard: "Dashboard",
  rss: "Feed RSS",
  html: "HTML",
};

export const PURPOSE_ICONS: Record<string, any> = {
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

export const PURPOSE_LABELS: Record<string, string> = {
  manufacturing_logistics: "Manufactura y Logística",
  office_communications: "Comunicaciones de Oficina",
  cafeteria_restaurant: "Cafetería y Restaurante",
  retail_promotions: "Promociones Retail",
  healthcare: "Salud",
  events: "Eventos",
  public_information: "Información Pública",
  other: "Personalizado",
  office: "Oficina",
  public_info: "Información Pública",
  menu_board: "Menú Digital",
  lobby: "Lobby / Recepción",
  meeting_room: "Sala de Reuniones",
  production: "Producción / KPIs",
};

export const LEGACY_PURPOSE_MAP: Record<string, string> = {
  office: "office_communications",
  public_info: "public_information",
  menu_board: "cafeteria_restaurant",
  lobby: "office_communications",
  meeting_room: "office_communications",
  production: "manufacturing_logistics",
};

export const PURPOSE_OPTIONS = [
  { key: "manufacturing_logistics", description: "KPIs, seguridad, despacho y operaciones." },
  { key: "office_communications", description: "Anuncios, cultura y comunicación interna." },
  { key: "cafeteria_restaurant", description: "Menús, especiales y disponibilidad." },
  { key: "retail_promotions", description: "Ofertas, lanzamientos y promos visuales." },
  { key: "healthcare", description: "Salas de espera, rutas y avisos de seguridad." },
  { key: "events", description: "Agendas, bienvenida y actualizaciones en vivo." },
  { key: "public_information", description: "Direcciones, alertas e información pública." },
  { key: "other", description: "Diseño libre con texto, colores, QR, ticker y CSS." },
];

export const VIDEO_TEMPLATES = [
  { key: "full_bleed", label: "Canvas", description: "Media limpio a pantalla completa.", accent: "#111827" },
  { key: "media_left", label: "Command", description: "Media, mensaje principal y widgets operativos.", accent: "#2563eb" },
  { key: "media_right", label: "Spotlight", description: "Mensaje editorial con media destacada.", accent: "#0d9488" },
  { key: "hero_overlay", label: "Market", description: "Promoción visual con banda de acción.", accent: "#db2777" },
  { key: "center_stage", label: "Pulse", description: "Dashboard compacto para estado, agenda y alertas.", accent: "#7c3aed" },
];

export const TEMPLATE_ZONES: Array<{ key: TemplateZone; label: string; description: string }> = [
  { key: "media", label: "Media", description: "Video, imagen, web o dashboard asignado." },
  { key: "badge", label: "Badge", description: "Etiqueta superior corta." },
  { key: "headline", label: "Título", description: "Mensaje principal de lectura rápida." },
  { key: "subtitle", label: "Subtítulo", description: "Contexto o descripción secundaria." },
  { key: "qr", label: "QR", description: "Texto o URL para llamada a acción." },
  { key: "weather", label: "Clima", description: "Widget compacto de clima o estado." },
  { key: "ticker", label: "Ticker", description: "Mensaje inferior en movimiento." },
  { key: "logo", label: "Logo", description: "Marca o símbolo del ticker." },
  { key: "kpiStrip", label: "KPIs", description: "Tres datos rápidos para operaciones o agenda." },
];

export const FONT_FAMILIES: Record<string, string> = {
  system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  sans: 'Inter, "Helvetica Neue", Arial, sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
  mono: '"SF Mono", "Fira Code", "Cascadia Code", monospace',
  display: '"Poppins", "SF Pro Display", system-ui, sans-serif',
};

export const CORNER_RADIUS: Record<string, string> = {
  none: "0px",
  subtle: "4px",
  rounded: "8px",
  pill: "16px",
};

export function normalizePurpose(purpose?: string): string {
  if (!purpose) return "other";
  return LEGACY_PURPOSE_MAP[purpose] || purpose;
}
