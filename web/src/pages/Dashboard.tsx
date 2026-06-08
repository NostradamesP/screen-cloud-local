import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Monitor, Image, ListVideo, Calendar, Wifi, WifiOff, Play } from "lucide-react";

export default function Dashboard() {
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

  useEffect(() => {
    api.scheduler.now()
      .then(setNowPlaying)
      .catch(console.error)
      .finally(() => setLoadingNow(false));
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
          <div key={label} className="card flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${color}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          </div>
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
            <div key={s.screenId} className="card">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.status === "online" ? "bg-green-50" : "bg-gray-100"}`}>
                    <Monitor className={`h-5 w-5 ${s.status === "online" ? "text-green-600" : "text-gray-400"}`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{s.screenName}</h3>
                    {s.location && <p className="text-xs text-gray-500">{s.location}</p>}
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
              ) : (
                <p className="text-sm text-gray-400 italic">Sin contenido activo</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}