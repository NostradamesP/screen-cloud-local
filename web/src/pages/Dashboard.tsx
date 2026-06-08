import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Monitor, Image, ListVideo, Calendar, Wifi, WifiOff, Play, Pause, Building2, CalendarDays, Info, UtensilsCrossed, DoorOpen, Presentation, Gauge, Factory, ShoppingBag, HeartPulse } from "lucide-react";

const PURPOSE_ICONS: Record<string, any> = {
  manufacturing_logistics: Factory,
  office_communications: Building2,
  cafeteria_restaurant: UtensilsCrossed,
  retail_promotions: ShoppingBag,
  healthcare: HeartPulse,
  public_information: Info,
  office: Building2,
  events: CalendarDays,
  public_info: Info,
  menu_board: UtensilsCrossed,
  lobby: DoorOpen,
  meeting_room: Presentation,
  production: Gauge,
  other: Monitor,
};

const PURPOSE_LABELS: Record<string, string> = {
  manufacturing_logistics: "Manufacturing & Logistics",
  office_communications: "Office Communications",
  cafeteria_restaurant: "Cafeteria & Restaurant",
  retail_promotions: "Retail Promotions",
  healthcare: "Healthcare",
  public_information: "Public Information",
  office: "Oficina",
  events: "Eventos",
  public_info: "Información Pública",
  menu_board: "Menú Digital",
  lobby: "Lobby / Recepción",
  meeting_room: "Sala de Reuniones",
  production: "Producción / KPIs",
  other: "Otro",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ screens: 0, content: 0, playlists: 0, schedules: 0 });
  const [nowPlaying, setNowPlaying] = useState<any[]>([]);
  const [loadingNow, setLoadingNow] = useState(true);

  useEffect(() => {
    Promise.all([
      api.screens.list(),
      api.content.list(),
      api.playlists.list(),
      api.schedules.list(),
    ]).then(([screens, content, playlists, schedules]) => {
      setStats({
        screens: screens.length,
        content: content.length,
        playlists: playlists.length,
        schedules: schedules.length,
      });
    }).catch(console.error);
  }, []);

  const loadNowPlaying = () => {
    api.scheduler.now()
      .then(setNowPlaying)
      .catch(console.error)
      .finally(() => setLoadingNow(false));
  };

  useEffect(() => {
    loadNowPlaying();
    const interval = setInterval(loadNowPlaying, 30000);
    return () => clearInterval(interval);
  }, []);

  const cards = [
    { label: "Pantallas", value: stats.screens, icon: Monitor, color: "text-blue-600 bg-blue-50" },
    { label: "Contenidos", value: stats.content, icon: Image, color: "text-green-600 bg-green-50" },
    { label: "Playlists", value: stats.playlists, icon: ListVideo, color: "text-purple-600 bg-purple-50" },
    { label: "Programaciones", value: stats.schedules, icon: Calendar, color: "text-orange-600 bg-orange-50" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <button key={label} onClick={() => navigate("/screens")} className="card flex items-center gap-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${color}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          </button>
        ))}
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-4">Reproduciendo ahora</h2>
      {loadingNow ? (
        <p className="text-gray-400">Cargando...</p>
      ) : nowPlaying.length === 0 ? (
        <p className="text-gray-500">No hay pantallas registradas.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {nowPlaying.map((s: any) => (
            <button key={s.screenId} onClick={() => navigate("/screens")} className="card w-full text-left transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.status === "online" ? "bg-green-50" : "bg-gray-100"}`}>
                    <Monitor className={`h-5 w-5 ${s.status === "online" ? "text-green-600" : "text-gray-400"}`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{s.screenName}</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      {s.location && <span>{s.location} · </span>}
                      {React.createElement(PURPOSE_ICONS[s.purpose] || Monitor, { className: "h-3 w-3 inline" })}
                      <span>{PURPOSE_LABELS[s.purpose] || s.purpose}</span>
                    </div>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-xs">
                  {s.status === "online" ? (
                    <span className="flex items-center gap-1 text-green-600"><Wifi className="h-3 w-3" /> Online</span>
                  ) : (
                    <span className="flex items-center gap-1 text-gray-400"><WifiOff className="h-3 w-3" /> Offline</span>
                  )}
                </span>
              </div>
              {s.activeSchedule ? (
                <div className="flex items-center gap-2 text-sm text-brand-600 bg-brand-50 rounded-lg px-3 py-2">
                  <Play className="h-4 w-4" />
                  <span>{s.activeSchedule.name}</span>
                </div>
              ) : s.idleContent ? (
                <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                  <Pause className="h-4 w-4" />
                  <span>Idle: {s.idleContent.title}</span>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">Sin contenido activo</p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
