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
  { key: "full_bleed", label: "Canvas", description: "Media limpio a pantalla completa." },
  { key: "media_left", label: "Command", description: "Media, mensaje principal y widgets operativos." },
  { key: "media_right", label: "Spotlight", description: "Mensaje editorial con media destacada." },
  { key: "hero_overlay", label: "Market", description: "Promoción visual con banda de acción." },
  { key: "center_stage", label: "Pulse", description: "Dashboard compacto con media y estado." },
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
