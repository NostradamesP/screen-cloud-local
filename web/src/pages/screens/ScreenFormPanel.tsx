import React from "react";
import { Monitor, Pencil, X } from "lucide-react";
import { ScreenForm } from "./types";
import { PURPOSE_ICONS, PURPOSE_LABELS, PURPOSE_OPTIONS, VIDEO_TEMPLATES, normalizePurpose } from "./constants";
import { TemplatePreview } from "./TemplatePreview";
import { PURPOSE_TEMPLATE_PRESETS } from "./types";

interface ScreenFormPanelProps {
  form: ScreenForm;
  setForm: React.Dispatch<React.SetStateAction<ScreenForm>>;
  updateFormField: <K extends keyof ScreenForm>(field: K, value: ScreenForm[K]) => void;
  editing: any;
  showTemplateEditor: boolean;
  setShowTemplateEditor: (show: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function ScreenFormPanel({
  form,
  setForm,
  updateFormField,
  editing,
  showTemplateEditor,
  setShowTemplateEditor,
  onSubmit,
  onCancel,
}: ScreenFormPanelProps) {
  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm animate-slide-down">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{editing ? "Editar pantalla" : "Nueva pantalla"}</h2>
            <p className="text-sm text-gray-500">Define los datos básicos para identificarla en operación.</p>
          </div>
          <button type="button" onClick={onCancel} className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-700">
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
            <div className="flex flex-wrap gap-2">
              {PURPOSE_OPTIONS.map(({ key }) => {
                const Icon = PURPOSE_ICONS[key] || Monitor;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setForm({
                      ...form,
                      ...PURPOSE_TEMPLATE_PRESETS[key],
                      purpose: key,
                    })}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
                      form.purpose === key
                        ? "border-brand-500 bg-brand-50 text-brand-700 shadow-sm"
                        : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${form.purpose === key ? "text-brand-600" : "text-gray-400"}`} />
                    <span>{PURPOSE_LABELS[key]}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <label className="label">Dónde poner el video o contenido</label>
              {normalizePurpose(form.purpose) === "other" && (
                <button type="button" onClick={() => setShowTemplateEditor(true)} className="btn-primary py-2 text-sm">
                  <Pencil className="mr-2 h-4 w-4" />
                  Abrir editor custom
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_520px]">
              <div className="flex flex-wrap content-start gap-2">
                {VIDEO_TEMPLATES.map((template) => (
                  <button
                    key={template.key}
                    type="button"
                    onClick={() => setForm({ ...form, template: template.key })}
                    className={`rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
                      form.template === template.key
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {template.label}
                  </button>
                ))}
              </div>
              <TemplatePreview
                form={form}
                updateFormField={updateFormField}
                template={form.template}
                purpose={form.purpose}
              />
            </div>
          </div>
          {normalizePurpose(form.purpose) !== "other" && (
            <>
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
            </>
          )}
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary">{editing ? "Guardar cambios" : "Crear pantalla"}</button>
          <button type="button" onClick={onCancel} className="btn-secondary">Cancelar</button>
        </div>
      </form>
    </div>
  );
}
