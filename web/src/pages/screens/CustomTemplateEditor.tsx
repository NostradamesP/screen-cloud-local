import React, { useMemo, useState } from "react";
import { Check, ChevronRight, Layers3, Palette, Settings2, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { ScreenForm, TemplateZone } from "./types";
import {
  CORNER_RADIUS,
  FONT_FAMILIES,
  PURPOSE_LABELS,
  TEMPLATE_ZONES,
  VIDEO_TEMPLATES,
  normalizePurpose,
} from "./constants";
import { TemplatePreview } from "./TemplatePreview";

interface CustomTemplateEditorProps {
  form: ScreenForm;
  updateFormField: <K extends keyof ScreenForm>(field: K, value: ScreenForm[K]) => void;
  onClose: () => void;
}

type StudioTab = "content" | "style" | "widgets" | "advanced";

const tabs: Array<{ key: StudioTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { key: "content", label: "Contenido", icon: Layers3 },
  { key: "style", label: "Estilo", icon: Palette },
  { key: "widgets", label: "Widgets", icon: SlidersHorizontal },
  { key: "advanced", label: "Avanzado", icon: Settings2 },
];

const colorFields: Array<{ field: keyof ScreenForm; label: string; fallback: string }> = [
  { field: "templatePrimaryColor", label: "Principal", fallback: "#2563eb" },
  { field: "templateBgColor", label: "Fondo", fallback: "#f8fafc" },
  { field: "templateTextColor", label: "Texto", fallback: "#14302b" },
  { field: "templateAccentColor", label: "Acento", fallback: "#244244" },
  { field: "templateWidgetBg", label: "Widget", fallback: "#0d9488" },
  { field: "templateTickerBg", label: "Ticker fondo", fallback: "#ffffff" },
  { field: "templateTickerText", label: "Ticker texto", fallback: "#0f172a" },
];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">{children}</label>;
}

export function CustomTemplateEditor({ form, updateFormField, onClose }: CustomTemplateEditorProps) {
  const [activeTab, setActiveTab] = useState<StudioTab>("content");
  const [selectedZone, setSelectedZone] = useState<TemplateZone>("headline");
  const selectedZoneMeta = useMemo(
    () => TEMPLATE_ZONES.find((zone) => zone.key === selectedZone) ?? TEMPLATE_ZONES[0],
    [selectedZone],
  );
  const purposeLabel = PURPOSE_LABELS[normalizePurpose(form.purpose)] || "Personalizado";
  const currentTemplate = VIDEO_TEMPLATES.find((template) => template.key === form.template) ?? VIDEO_TEMPLATES[0];

  const update = <K extends keyof ScreenForm>(field: K, value: ScreenForm[K]) => updateFormField(field, value);
  const colorInput = ({ field, label, fallback }: { field: keyof ScreenForm; label: string; fallback: string }) => (
    <div key={field}>
      <FieldLabel>{label}</FieldLabel>
      <div className="mt-1.5 flex items-center gap-2">
        <input
          type="color"
          className="h-9 w-9 shrink-0 cursor-pointer rounded-md border border-gray-200 bg-white"
          value={(form[field] as string) || fallback}
          onChange={(event) => update(field, event.target.value as any)}
        />
        <input
          className="input min-w-0 flex-1"
          value={(form[field] as string) || ""}
          onChange={(event) => update(field, event.target.value as any)}
          placeholder={fallback}
        />
      </div>
    </div>
  );
  const kpiRows = [
    ["templateKpi1Label", "templateKpi1Value", "KPI 1"],
    ["templateKpi2Label", "templateKpi2Value", "KPI 2"],
    ["templateKpi3Label", "templateKpi3Value", "KPI 3"],
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-3 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="flex max-h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl animate-scale-in"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-base font-bold text-gray-950">Template Studio</h2>
              <p className="truncate text-xs text-gray-500">
                {currentTemplate.label} · {purposeLabel} · {form.orientation === "portrait" ? "Vertical" : "Horizontal"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select className="input h-9 w-40 py-1 text-sm" value={form.template} onChange={(event) => update("template", event.target.value)}>
              {VIDEO_TEMPLATES.map((template) => (
                <option key={template.key} value={template.key}>{template.label}</option>
              ))}
            </select>
            <select className="input h-9 w-32 py-1 text-sm" value={form.orientation} onChange={(event) => update("orientation", event.target.value as any)}>
              <option value="landscape">Horizontal</option>
              <option value="portrait">Vertical</option>
            </select>
            <button type="button" onClick={onClose} className="btn-secondary h-9 py-1 text-sm">
              <Check className="mr-2 h-4 w-4" />
              Listo
            </button>
            <button type="button" onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0 overflow-y-auto bg-slate-50/80 p-4 lg:p-6">
            <TemplatePreview
              form={form}
              updateFormField={updateFormField}
              template={form.template}
              purpose={form.purpose}
              size="large"
              selectedZone={selectedZone}
              onSelectZone={setSelectedZone}
              showHelp={false}
            />

            <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-5">
              {VIDEO_TEMPLATES.map((template) => {
                const active = form.template === template.key;
                return (
                  <button
                    key={template.key}
                    type="button"
                    onClick={() => update("template", template.key)}
                    className={`group overflow-hidden rounded-lg border bg-white p-2 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm ${
                      active ? "border-brand-500 shadow-sm ring-2 ring-brand-100" : "border-gray-200"
                    }`}
                  >
                    <div className="pointer-events-none">
                      <TemplatePreview
                        form={form}
                        updateFormField={updateFormField}
                        template={template.key}
                        purpose={form.purpose}
                        showHelp={false}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-gray-900">{template.label}</p>
                        <p className="truncate text-[11px] text-gray-500">{template.description}</p>
                      </div>
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: template.accent }} />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 rounded-lg border border-gray-200 bg-white p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Zonas del canvas</p>
                  <p className="text-xs text-gray-500">Media, texto y widgets.</p>
                </div>
                <p className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">{selectedZoneMeta.label}</p>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
                {TEMPLATE_ZONES.map((zone) => (
                  <button
                    key={zone.key}
                    type="button"
                    onClick={() => setSelectedZone(zone.key)}
                    className={`rounded-md border px-3 py-2 text-left transition-colors ${
                      selectedZone === zone.key
                        ? "border-brand-500 bg-brand-50 text-brand-800"
                        : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <span className="block text-xs font-bold">{zone.label}</span>
                    <span className="mt-0.5 block truncate text-[11px] opacity-75">{zone.description}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <aside className="flex min-h-0 flex-col border-l border-gray-100 bg-white">
            <div className="grid grid-cols-4 border-b border-gray-100">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex flex-col items-center gap-1 px-2 py-3 text-[11px] font-semibold transition-colors ${
                      activeTab === tab.key ? "bg-brand-50 text-brand-700" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
                <div className="flex items-start gap-2">
                  <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{selectedZoneMeta.label}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{selectedZoneMeta.description}</p>
                  </div>
                </div>
              </div>

              {activeTab === "content" && (
                <div className="space-y-4">
                  <div>
                    <FieldLabel>Badge</FieldLabel>
                    <input className="input mt-1.5" value={form.templateBadge} onChange={(event) => update("templateBadge", event.target.value)} placeholder="Etiqueta superior" />
                  </div>
                  <div>
                    <FieldLabel>Título</FieldLabel>
                    <textarea className="input mt-1.5" rows={2} value={form.templateHeadline} onChange={(event) => update("templateHeadline", event.target.value)} placeholder="Título principal" />
                  </div>
                  <div>
                    <FieldLabel>Subtítulo</FieldLabel>
                    <textarea className="input mt-1.5" rows={3} value={form.templateSubtitle} onChange={(event) => update("templateSubtitle", event.target.value)} placeholder="Mensaje secundario" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <FieldLabel>QR texto</FieldLabel>
                      <input className="input mt-1.5" value={form.templateQrText} onChange={(event) => update("templateQrText", event.target.value)} placeholder="QR" />
                    </div>
                    <div>
                      <FieldLabel>Logo texto</FieldLabel>
                      <input className="input mt-1.5" value={form.templateLogoText} onChange={(event) => update("templateLogoText", event.target.value)} placeholder="▲" />
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Ticker</FieldLabel>
                    <textarea className="input mt-1.5" rows={2} value={form.templateTicker} onChange={(event) => update("templateTicker", event.target.value)} placeholder="Mensaje inferior..." />
                  </div>
                </div>
              )}

              {activeTab === "style" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">{colorFields.map(colorInput)}</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <FieldLabel>Tipografía</FieldLabel>
                      <select className="input mt-1.5" value={form.templateFontFamily} onChange={(event) => update("templateFontFamily", event.target.value)}>
                        {Object.keys(FONT_FAMILIES).map((key) => <option key={key} value={key}>{key}</option>)}
                      </select>
                    </div>
                    <div>
                      <FieldLabel>Esquinas</FieldLabel>
                      <select className="input mt-1.5" value={form.templateCornerRadius} onChange={(event) => update("templateCornerRadius", event.target.value)}>
                        {Object.keys(CORNER_RADIUS).map((key) => <option key={key} value={key}>{key}</option>)}
                      </select>
                    </div>
                    <div>
                      <FieldLabel>Escala texto</FieldLabel>
                      <input className="input mt-1.5" value={form.templateFontSizeScale} onChange={(event) => update("templateFontSizeScale", event.target.value)} placeholder="1.0" />
                    </div>
                    <div>
                      <FieldLabel>Ajuste media</FieldLabel>
                      <select className="input mt-1.5" value={form.templateMediaFit} onChange={(event) => update("templateMediaFit", event.target.value)}>
                        <option value="cover">Cover</option>
                        <option value="contain">Contain</option>
                        <option value="fill">Fill</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "widgets" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      ["templateShowWeather", "Mostrar clima"],
                      ["templateShowTicker", "Mostrar ticker"],
                      ["templateShowKpis", "Mostrar KPIs"],
                    ].map(([field, label]) => (
                      <label key={field} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700">
                        {label}
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-brand-600"
                          checked={form[field as keyof ScreenForm] !== "no"}
                          onChange={(event) => update(field as keyof ScreenForm, (event.target.checked ? "yes" : "no") as any)}
                        />
                      </label>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <FieldLabel>Ubicación</FieldLabel>
                      <input className="input mt-1.5" value={form.templateWeatherLocation} onChange={(event) => update("templateWeatherLocation", event.target.value)} placeholder="Ciudad" />
                    </div>
                    <div>
                      <FieldLabel>Temperatura</FieldLabel>
                      <input className="input mt-1.5" value={form.templateTemperature} onChange={(event) => update("templateTemperature", event.target.value)} placeholder="16°C" />
                    </div>
                  </div>
                  <div>
                    <FieldLabel>URL para QR</FieldLabel>
                    <input className="input mt-1.5" value={form.templateQrUrl} onChange={(event) => update("templateQrUrl", event.target.value)} placeholder="https://..." />
                  </div>
                  <div>
                    <FieldLabel>URL de logo</FieldLabel>
                    <input className="input mt-1.5" value={form.templateLogoUrl} onChange={(event) => update("templateLogoUrl", event.target.value)} placeholder="https://.../logo.png" />
                  </div>
                  <div className="space-y-2">
                    <FieldLabel>KPIs</FieldLabel>
                    {kpiRows.map(([labelField, valueField, label]) => (
                      <div key={labelField} className="grid grid-cols-[1fr_1.2fr] gap-2">
                        <input className="input" value={form[labelField]} onChange={(event) => update(labelField, event.target.value)} placeholder={label} />
                        <input className="input" value={form[valueField]} onChange={(event) => update(valueField, event.target.value)} placeholder="Valor" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "advanced" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <FieldLabel>Degradado inicio</FieldLabel>
                      <input className="input mt-1.5" value={form.templateGradientColor1} onChange={(event) => update("templateGradientColor1", event.target.value)} placeholder="#ffffff" />
                    </div>
                    <div>
                      <FieldLabel>Degradado final</FieldLabel>
                      <input className="input mt-1.5" value={form.templateGradientColor2} onChange={(event) => update("templateGradientColor2", event.target.value)} placeholder="#e5e7eb" />
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Dirección</FieldLabel>
                    <select className="input mt-1.5" value={form.templateGradientDirection} onChange={(event) => update("templateGradientDirection", event.target.value)}>
                      <option value="to_bottom">Hacia abajo</option>
                      <option value="to_right">Hacia la derecha</option>
                      <option value="to_bottom_right">Diagonal</option>
                      <option value="to_left">Hacia la izquierda</option>
                      <option value="to_top">Hacia arriba</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <FieldLabel>Transición</FieldLabel>
                      <select className="input mt-1.5" value={form.templateTransition} onChange={(event) => update("templateTransition", event.target.value)}>
                        <option value="none">Ninguna</option>
                        <option value="fade">Fundido</option>
                        <option value="slide">Slide</option>
                      </select>
                    </div>
                    <div>
                      <FieldLabel>Ticker</FieldLabel>
                      <select className="input mt-1.5" value={form.templateTickerSpeed} onChange={(event) => update("templateTickerSpeed", event.target.value)}>
                        <option value="slow">Lento</option>
                        <option value="normal">Normal</option>
                        <option value="fast">Rápido</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <FieldLabel>CSS personalizado</FieldLabel>
                    <textarea
                      className="input mt-1.5 font-mono text-xs"
                      rows={6}
                      value={form.templateCustomCSS}
                      onChange={(event) => update("templateCustomCSS", event.target.value)}
                      placeholder=".tpl-headline { text-transform: uppercase; }"
                    />
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
