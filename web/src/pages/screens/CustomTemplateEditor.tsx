import React from "react";
import { X } from "lucide-react";
import { ScreenForm } from "./types";
import { VIDEO_TEMPLATES } from "./constants";
import { TemplatePreview } from "./TemplatePreview";

interface CustomTemplateEditorProps {
  form: ScreenForm;
  updateFormField: <K extends keyof ScreenForm>(field: K, value: ScreenForm[K]) => void;
  onClose: () => void;
}

export function CustomTemplateEditor({ form, updateFormField, onClose }: CustomTemplateEditorProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 animate-fade-in" onClick={onClose}>
      <div className="flex max-h-[92vh] w-full max-w-6xl flex-col rounded-lg bg-white shadow-xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-5">
          <div>
            <p className="text-sm font-medium text-brand-700">Editor custom</p>
            <h2 className="text-xl font-bold text-gray-900">Diseña el template de esta pantalla</h2>
            <p className="mt-1 text-sm text-gray-500">Edita directamente el preview o usa los controles rápidos.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 overflow-y-auto p-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0">
            <TemplatePreview
              form={form}
              updateFormField={updateFormField}
              template={form.template}
              purpose={form.purpose}
              size="large"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {VIDEO_TEMPLATES.map((template) => (
                <button
                  key={template.key}
                  type="button"
                  onClick={() => updateFormField("template", template.key)}
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
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h3 className="text-sm font-semibold text-gray-900">Texto</h3>
              <div className="mt-3 space-y-3">
                <input className="input" value={form.templateBadge} onChange={(e) => updateFormField("templateBadge", e.target.value)} placeholder="Etiqueta superior" />
                <input className="input" value={form.templateHeadline} onChange={(e) => updateFormField("templateHeadline", e.target.value)} placeholder="Título principal" />
                <textarea className="input" rows={2} value={form.templateSubtitle} onChange={(e) => updateFormField("templateSubtitle", e.target.value)} placeholder="Texto secundario" />
                <input className="input" value={form.templateTicker} onChange={(e) => updateFormField("templateTicker", e.target.value)} placeholder="Ticker inferior" />
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h3 className="text-sm font-semibold text-gray-900">Widgets</h3>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <input className="input" value={form.templateQrText} onChange={(e) => updateFormField("templateQrText", e.target.value)} placeholder="QR" />
                <input className="input" value={form.templateLogoText} onChange={(e) => updateFormField("templateLogoText", e.target.value)} placeholder="Logo" />
                <input className="input" value={form.templateWeatherLocation} onChange={(e) => updateFormField("templateWeatherLocation", e.target.value)} placeholder="Ciudad" />
                <input className="input" value={form.templateTemperature} onChange={(e) => updateFormField("templateTemperature", e.target.value)} placeholder="16°C" />
              </div>
              <div className="mt-3 flex flex-wrap gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" className="rounded border-gray-300 text-brand-600" checked={form.templateShowWeather !== "no"} onChange={(e) => updateFormField("templateShowWeather", e.target.checked ? "yes" : "no")} />
                  Clima
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" className="rounded border-gray-300 text-brand-600" checked={form.templateShowTicker !== "no"} onChange={(e) => updateFormField("templateShowTicker", e.target.checked ? "yes" : "no")} />
                  Ticker
                </label>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h3 className="text-sm font-semibold text-gray-900">Color</h3>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {[
                  ["templatePrimaryColor", "Principal", "#2f9f6f"],
                  ["templateBgColor", "Fondo", "#f8faf9"],
                  ["templateTextColor", "Texto", "#14302b"],
                  ["templateWidgetBg", "Widget", "#2f9f6f"],
                  ["templateTickerBg", "Ticker fondo", "#ffffff"],
                  ["templateTickerText", "Ticker texto", "#0f172a"],
                ].map(([field, label, fallback]) => (
                  <label key={field} className="text-xs font-medium text-gray-500">
                    {label}
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="color"
                        className="h-9 w-9 cursor-pointer rounded border border-gray-300"
                        value={(form[field as keyof ScreenForm] as string) || fallback}
                        onChange={(e) => updateFormField(field as keyof ScreenForm, e.target.value as any)}
                      />
                      <input
                        className="input min-w-0 flex-1"
                        value={(form[field as keyof ScreenForm] as string) || ""}
                        onChange={(e) => updateFormField(field as keyof ScreenForm, e.target.value as any)}
                        placeholder={fallback}
                      />
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h3 className="text-sm font-semibold text-gray-900">Ajustes</h3>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <select className="input" value={form.templateMediaFit} onChange={(e) => updateFormField("templateMediaFit", e.target.value)}>
                  <option value="cover">Cubrir media</option>
                  <option value="contain">Contener media</option>
                  <option value="fill">Rellenar media</option>
                </select>
                <select className="input" value={form.templateTickerSpeed} onChange={(e) => updateFormField("templateTickerSpeed", e.target.value)}>
                  <option value="slow">Ticker lento</option>
                  <option value="normal">Ticker normal</option>
                  <option value="fast">Ticker rápido</option>
                </select>
                <select className="input" value={form.templateFontFamily} onChange={(e) => updateFormField("templateFontFamily", e.target.value)}>
                  <option value="system">Fuente sistema</option>
                  <option value="sans">Sans moderna</option>
                  <option value="serif">Serif</option>
                  <option value="mono">Mono</option>
                  <option value="display">Display</option>
                </select>
                <select className="input" value={form.templateCornerRadius} onChange={(e) => updateFormField("templateCornerRadius", e.target.value)}>
                  <option value="none">Sin esquinas</option>
                  <option value="subtle">Sutil</option>
                  <option value="rounded">Redondeado</option>
                  <option value="pill">Píldora</option>
                </select>
                <input className="input" value={form.templateQrUrl} onChange={(e) => updateFormField("templateQrUrl", e.target.value)} placeholder="URL para QR" />
                <input className="input" value={form.templateLogoUrl} onChange={(e) => updateFormField("templateLogoUrl", e.target.value)} placeholder="URL logo" />
              </div>
              <textarea
                className="input mt-3 font-mono text-xs"
                rows={3}
                value={form.templateCustomCSS}
                onChange={(e) => updateFormField("templateCustomCSS", e.target.value)}
                placeholder=".tpl-headline { text-transform: uppercase; }"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={onClose}>Cerrar</button>
              <button type="button" className="btn-primary" onClick={onClose}>Listo</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
