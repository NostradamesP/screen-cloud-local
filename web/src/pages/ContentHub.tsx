import { useMemo, useState } from "react";
import {
  CalendarDays,
  FolderKanban,
  Hash,
  Layers,
  LayoutTemplate,
  ListVideo,
  Puzzle,
} from "lucide-react";
import clsx from "clsx";
import Content from "@/pages/Content";
import Playlists from "@/pages/Playlists";
import Schedules from "@/pages/Schedules";
import ScreenGroups from "@/pages/ScreenGroups";
import Layouts from "@/pages/Layouts";
import Widgets from "@/pages/Widgets";
import Tags from "@/pages/Tags";

const sections = [
  {
    id: "library",
    label: "Biblioteca",
    description: "Archivos, URLs y contenido base",
    icon: FolderKanban,
    component: Content,
  },
  {
    id: "playlists",
    label: "Playlists",
    description: "Orden y duración de contenido",
    icon: ListVideo,
    component: Playlists,
  },
  {
    id: "schedules",
    label: "Programación",
    description: "Cuándo y dónde se reproduce",
    icon: CalendarDays,
    component: Schedules,
  },
  {
    id: "groups",
    label: "Grupos TV",
    description: "Agrupa pantallas por zona",
    icon: Layers,
    component: ScreenGroups,
  },
  {
    id: "layouts",
    label: "Layouts",
    description: "Zonas y composiciones",
    icon: LayoutTemplate,
    component: Layouts,
  },
  {
    id: "widgets",
    label: "Widgets",
    description: "Bloques dinámicos",
    icon: Puzzle,
    component: Widgets,
  },
  {
    id: "tags",
    label: "Etiquetas",
    description: "Organización visual",
    icon: Hash,
    component: Tags,
  },
];

export default function ContentHub() {
  const [activeSectionId, setActiveSectionId] = useState(sections[0].id);
  const activeSection = useMemo(
    () => sections.find((section) => section.id === activeSectionId) ?? sections[0],
    [activeSectionId]
  );
  const ActiveComponent = activeSection.component;

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col gap-2">
        <p className="text-sm font-medium text-brand-700">Gestión de contenido</p>
        <h1 className="text-2xl font-bold text-gray-900">Contenido</h1>
        <p className="max-w-3xl text-sm text-gray-500">
          Administra biblioteca, playlists, programación y grupos desde una sola pestaña.
        </p>
      </div>

      <div className="mb-6 rounded-xl border border-white/60 bg-white/55 p-2 shadow-sm backdrop-blur-xl">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-7">
          {sections.map(({ id, label, description, icon: Icon }) => {
            const isActive = activeSectionId === id;
            return (
              <button
                key={id}
                onClick={() => setActiveSectionId(id)}
                className={clsx(
                  "flex min-h-20 flex-col items-start justify-center rounded-lg border px-3 py-3 text-left transition-all",
                  isActive
                    ? "border-brand-200 bg-white text-brand-700 shadow-sm"
                    : "border-white/60 bg-white/30 text-gray-600 hover:bg-white/80 hover:text-gray-900"
                )}
              >
                <span className="mb-2 inline-flex items-center gap-2 text-sm font-semibold">
                  <Icon className="h-4 w-4" />
                  {label}
                </span>
                <span className="text-xs leading-snug text-gray-500">{description}</span>
              </button>
            );
          })}
        </div>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm lg:p-6">
        <ActiveComponent />
      </section>
    </div>
  );
}
