import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Factory,
  HeartPulse,
  LayoutDashboard,
  Monitor,
  Play,
  RadioTower,
  ServerCog,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  UploadCloud,
  UsersRound,
  Wifi,
  X,
} from "lucide-react";

const heroVideoUrl = "https://cdn.coverr.co/videos/coverr-teamwork-in-the-office-7943/1080p.mp4";

const navItems = [
  { label: "Product", href: "#product" },
  { label: "Solutions", href: "#solutions" },
  { label: "Resources", href: "#resources" },
  { label: "Pricing", href: "#pricing" },
];

const highlights = [
  { label: "Pantallas conectadas", value: "Multi-site" },
  { label: "Player telemetry", value: "Live" },
  { label: "Templates", value: "Premium" },
];

const workflow = [
  { icon: UploadCloud, title: "Sube contenido", description: "Imagenes, videos y piezas listas para preview." },
  { icon: Monitor, title: "Crea pantallas", description: "Vincula TVs por sede, zona o equipo en minutos." },
  { icon: LayoutDashboard, title: "Elige template", description: "Layouts por industria con editor guiado." },
  { icon: RadioTower, title: "Publica y monitorea", description: "Estado real, errores y contenido actual." },
];

const industries = [
  { icon: Factory, title: "Manufactura", text: "KPIs, seguridad, turnos y avisos operativos." },
  { icon: Building2, title: "Oficinas", text: "Comunicacion interna, lobby y salas compartidas." },
  { icon: ShoppingBag, title: "Retail", text: "Promociones, QR, campañas y contenido de tienda." },
  { icon: HeartPulse, title: "Salud", text: "Orientacion, informacion publica y alertas visibles." },
  { icon: CalendarDays, title: "Eventos", text: "Agendas, salas, sponsors y mensajes en vivo." },
  { icon: UsersRound, title: "Publico", text: "Pantallas informativas para sedes y servicios." },
];

const operations = [
  { icon: Activity, label: "Estado real", text: "playing_idle, schedule, empty, error y offline." },
  { icon: Wifi, label: "Player estable", text: "Cache refresh sin desvincular la TV." },
  { icon: ServerCog, label: "Multi-sede", text: "Organiza pantallas, equipos y ubicaciones sin perder contexto." },
  { icon: ShieldCheck, label: "Control privado", text: "Accesos, contenido y pantallas bajo una operacion centralizada." },
];

export default function Login() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (isRegister) {
        await register(email, name, password);
      } else {
        await login(email, password);
      }
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7f8f3] text-slate-950">
      <section className="relative isolate overflow-hidden bg-slate-950">
        <video
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-55"
          autoPlay
          muted
          loop
          playsInline
          poster="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1800&q=80"
        >
          <source src={heroVideoUrl} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(250,204,21,0.22),transparent_26%),radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.18),transparent_30%),linear-gradient(115deg,rgba(76,29,149,0.94),rgba(91,33,182,0.76)_32%,rgba(15,23,42,0.52)_68%,rgba(248,250,252,0.88))]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#f7f8f3] to-transparent" />

        <header className="relative z-30 mx-auto w-full max-w-[96rem] px-4 py-5 sm:px-8">
          <nav className="flex min-h-[4.75rem] items-center justify-between gap-4 rounded-full border border-white/45 bg-white/82 px-4 py-3 shadow-[0_24px_80px_rgba(15,23,42,0.22)] backdrop-blur-2xl sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative flex h-10 w-12 shrink-0 items-center justify-center">
                <span className="absolute bottom-1 left-2 h-5 w-8 rounded-md bg-yellow-300" />
                <span className="relative grid h-8 w-8 place-items-center rounded-lg bg-slate-950 text-white shadow-sm">
                  <Monitor className="h-4 w-4" />
                </span>
              </div>
              <span className="truncate text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
                Signage Studio
              </span>
            </div>

            <div className="hidden items-center gap-8 text-base font-semibold text-slate-800 lg:flex">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="transition hover:text-slate-950"
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setLoginOpen((open) => !open)}
                className="hidden h-12 items-center gap-2 rounded-full px-4 text-base font-semibold text-slate-900 transition hover:bg-slate-100 sm:inline-flex"
              >
                Login
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => document.getElementById("solutions")?.scrollIntoView({ behavior: "smooth" })}
                className="hidden h-12 items-center justify-center rounded-full border-2 border-slate-800/75 bg-white/50 px-5 text-base font-semibold text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-white xl:inline-flex"
              >
                Contact Sales
              </button>
              <button
                type="button"
                onClick={() => setLoginOpen(true)}
                aria-label="Get Started desde el navbar"
                className="inline-flex h-12 items-center justify-center rounded-full bg-yellow-300 px-5 text-base font-semibold text-slate-950 shadow-lg shadow-yellow-500/20 transition hover:-translate-y-0.5 hover:bg-yellow-200 sm:px-7"
              >
                Get Started
              </button>
            </div>
          </nav>
        </header>

        <div className="relative z-40 mx-auto max-w-[96rem] px-4 sm:px-8">
          {loginOpen && (
            <section className="ml-auto mt-2 w-[min(21rem,calc(100vw-2rem))] animate-soft-pop rounded-2xl border border-white/80 bg-white/92 p-3 shadow-2xl shadow-slate-950/20 backdrop-blur-xl sm:mr-4 lg:mr-8">
              <div className="mb-3 flex items-center justify-between gap-3 px-1">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {isRegister ? "Nuevo admin" : "Login"}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-950">
                    {isRegister ? "Crear acceso" : "Acceso privado"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setIsRegister(!isRegister);
                    }}
                    className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    {isRegister ? "Login" : "Crear"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginOpen(false)}
                    aria-label="Cerrar login"
                    className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-950"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-2">
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </div>
                )}
                {isRegister && (
                  <input
                    type="text"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-200/60"
                    placeholder="Nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                )}
                <input
                  type="email"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-200/60"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <input
                  type="password"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-200/60"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  {isRegister ? "Crear" : "Entrar"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </section>
          )}
        </div>

        <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-5 pb-24 pt-14 sm:px-8 lg:grid-cols-[0.84fr_1.16fr] lg:items-center lg:pb-32 lg:pt-20">
          <div className="max-w-2xl text-white">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/14 px-3 py-1.5 text-xs font-semibold text-white shadow-sm backdrop-blur">
              <RadioTower className="h-3.5 w-3.5" />
              SaaS-ready digital signage para operar pantallas a escala
            </div>
            <h1 className="mt-7 max-w-3xl text-5xl font-semibold leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
              Controla pantallas, contenido y templates desde una plataforma simple.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/78">
              Gestiona TVs por sede, publica campañas, programa contenido y monitorea el player en tiempo real desde una experiencia diseñada para equipos.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => document.getElementById("platform-preview")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-slate-950 shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5"
              >
                Ver plataforma
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setLoginOpen(true)}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/25 bg-white/12 px-5 text-sm font-semibold text-white shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/18"
              >
                Acceder
              </button>
            </div>
          </div>

          <div id="platform-preview" className="relative z-10 scroll-mt-8">
            <div className="absolute inset-x-0 -inset-y-6 rounded-[2.4rem] bg-white/14 blur-xl" />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/18 bg-slate-950/82 p-3 shadow-[0_34px_100px_rgba(15,23,42,0.4)] backdrop-blur">
              <div className="mb-3 flex items-center justify-between px-2 text-white">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/75">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  Live control room
                </div>
              </div>

              <div className="aspect-[16/10] overflow-hidden rounded-[1.1rem] bg-[#0f172a] p-3 sm:aspect-video">
                <div className="grid h-full grid-cols-12 grid-rows-[1fr_54px] gap-3">
                  <div className="relative col-span-7 overflow-hidden rounded-2xl bg-slate-900">
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(34,197,94,0.26),transparent_42%),linear-gradient(315deg,rgba(14,165,233,0.26),transparent_38%),linear-gradient(180deg,#111827,#020617)]" />
                    <div className="absolute inset-x-5 top-5 flex items-center justify-between gap-2">
                      <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80 backdrop-blur">
                        Retail network
                      </div>
                      <div className="rounded-full bg-emerald-400/95 px-3 py-1 text-xs font-bold text-emerald-950">
                        Playing idle
                      </div>
                    </div>
                    <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/15 bg-white/12 p-5 text-white shadow-2xl backdrop-blur-md">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">Now on screen</p>
                      <p className="mt-2 text-2xl font-semibold leading-none tracking-tight sm:text-3xl">Summer campaign</p>
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        {["North lobby", "16:9", "Synced"].map((item) => (
                          <span key={item} className="truncate rounded-lg bg-white/10 px-2.5 py-2 text-xs font-semibold text-white/80">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-5 grid min-w-0 grid-rows-[1fr_auto] gap-3">
                    <div className="rounded-2xl bg-white p-4 text-slate-950 sm:p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Today</p>
                      <p className="mt-2 text-2xl font-semibold leading-none tracking-tight sm:text-3xl">Security Talk</p>
                      <p className="mt-3 line-clamp-2 text-sm leading-5 text-slate-500">
                        Agenda, QR, clima y avisos internos listos para publicar.
                      </p>
                      <div className="mt-4 flex items-end justify-between gap-4">
                        <div className="grid h-14 w-14 place-items-center rounded-xl bg-slate-950 text-xs font-black text-white shadow-sm sm:h-16 sm:w-16">
                          QR
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-semibold sm:text-3xl">16°</p>
                          <p className="text-xs font-semibold text-slate-500">Partly sunny</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {[
                        ["18", "Screens"],
                        ["4", "Alerts"],
                        ["99%", "Uptime"],
                      ].map(([value, label]) => (
                        <div key={label} className="rounded-xl border border-white/10 bg-white/10 p-3 text-white">
                          <p className="text-lg font-semibold leading-none">{value}</p>
                          <p className="mt-1 truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="col-span-12 flex items-center gap-3 rounded-2xl bg-white px-5 py-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <p className="truncate text-sm font-semibold text-slate-800">
                      Sync complete. Player telemetry: playing_idle, heartbeat live.
                    </p>
                    <span className="ml-auto hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 sm:inline">
                      v1.12
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-5 pb-14 sm:px-8">
          <div className="grid max-w-2xl grid-cols-3 gap-3">
              {highlights.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/18 bg-white/16 p-4 text-white shadow-sm backdrop-blur">
                  <p className="text-xl font-semibold tracking-tight sm:text-2xl">{item.value}</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-white/60">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
      </section>

      <main>

        <section id="product" className="border-y border-slate-200 bg-white/55">
          <div className="mx-auto grid max-w-7xl gap-4 px-5 py-8 sm:px-8 md:grid-cols-4">
            {workflow.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-950 text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <step.icon className="h-5 w-5 text-emerald-700" />
                </div>
                <p className="mt-5 text-sm font-semibold text-slate-950">{step.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="solutions" className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Para cada industria</p>
              <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Templates y flujos para pantallas que comunican algo distinto en cada negocio.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-slate-600">
              Inspirado en la estructura por industria, pero adaptado a tu producto: operación visual, rápida y editable.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {industries.map((industry) => (
              <article key={industry.title} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 transition group-hover:bg-emerald-600 group-hover:text-white">
                  <industry.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-base font-semibold text-slate-950">{industry.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{industry.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="resources" className="mx-auto max-w-7xl px-5 pb-16 sm:px-8">
          <div className="grid gap-4 lg:grid-cols-[1fr_1.25fr]">
            <div className="rounded-3xl border border-slate-200 bg-slate-950 p-7 text-white shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
                <Sparkles className="h-4 w-4" />
                Operacion centralizada
              </div>
              <p className="mt-5 text-3xl font-semibold tracking-tight">
                Todo lo que pasa en tus pantallas, claro para el equipo que tiene que operarlas.
              </p>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                Estados en vivo, contenido actual, grupos, programacion y acciones rapidas para publicar cambios sin perseguir cada TV una por una.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {operations.map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <item.icon className="h-5 w-5 text-emerald-700" />
                  <p className="mt-4 text-sm font-semibold text-slate-950">{item.label}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="grid gap-0 lg:grid-cols-[1fr_1.05fr]">
              <div className="bg-slate-950 p-7 text-white sm:p-9">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-200">
                  <Sparkles className="h-3.5 w-3.5" />
                  Pricing simple
                </div>
                <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Empieza con un precio claro por pantalla.
                </h2>
                <p className="mt-4 text-sm leading-6 text-slate-300">
                  Un modelo directo para negocios que quieren crecer pantalla por pantalla, sin paquetes confusos.
                </p>
              </div>

              <div className="grid gap-4 bg-slate-50 p-5 sm:p-7 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Starter</p>
                  <div className="mt-5 flex items-end gap-2">
                    <span className="text-5xl font-semibold tracking-tight text-slate-950">$10</span>
                    <span className="pb-2 text-sm font-semibold text-slate-500">/ screen / mes</span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    Para operar pantallas, publicar contenido y monitorear estado real.
                  </p>
                  <button
                    type="button"
                    onClick={() => setLoginOpen(true)}
                    aria-label="Get Started desde pricing"
                    className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-yellow-300 px-5 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-yellow-200"
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-semibold text-slate-950">Incluye lo esencial</p>
                  <div className="mt-5 space-y-3">
                    {[
                      "Pantallas y grupos por ubicacion",
                      "Templates editables por industria",
                      "Contenido idle y programaciones",
                      "Estado live del player y alertas",
                      "Acciones rapidas: sync y cache refresh",
                    ].map((item) => (
                      <div key={item} className="flex gap-3 text-sm leading-6 text-slate-600">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="p-7 sm:p-9">
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  <BarChart3 className="h-3.5 w-3.5" />
                  Operacion visible
                </div>
                <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950">
                  Dashboard, Screens y Contenido como un sistema compacto.
                </h2>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  El valor principal se entiende desde la primera pantalla: que se reproduce, donde esta online y que accion tomar.
                </p>
              </div>
              <div className="grid gap-3 bg-slate-50 p-5 sm:grid-cols-3 sm:p-7">
                {[
                  ["Dashboard", "Resumen ejecutivo y alertas."],
                  ["Screens", "Control operativo de TVs."],
                  ["Contenido", "Biblioteca, grupos y programacion."],
                ].map(([title, text]) => (
                  <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-semibold text-slate-950">{title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
