import React from "react";
import { Monitor, Pencil, X } from "lucide-react";
import { ScreenForm } from "./types";
import { PURPOSE_ICONS, PURPOSE_LABELS, PURPOSE_OPTIONS, VIDEO_TEMPLATES } from "./constants";
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
  setShowTemplateEditor,
  onSubmit,
  onCancel,
}: ScreenFormPanelProps) {
  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm animate-slide-down">
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{editing ? "Editar pantalla" : "Nueva pantalla"}</h2>
            <p className="text-sm text-gray-500">Datos básicos y diseño visual de la pantalla.</p>
          </div>
          <button type="button" onClick={onCancel} className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="label">Nombre</label>
            <input className="input" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          </div>
          <div>
            <label className="label">Ubicación</label>
            <input className="input" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} />
          </div>
          <div>
            <label className="label">Resolución</label>
            <select className="input" value={form.resolution} onChange={(event) => setForm({ ...form, resolution: event.target.value })}>
              <option value="1920x1080">1920x1080 (Full HD)</option>
              <option value="3840x2160">3840x2160 (4K)</option>
              <option value="1366x768">1366x768</option>
            </select>
          </div>
          <div>
            <label className="label">Orientación</label>
            <select className="input" value={form.orientation} onChange={(event) => setForm({ ...form, orientation: event.target.value as any })}>
              <option value="landscape">Horizontal</option>
              <option value="portrait">Vertical</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label mb-2">Industria</label>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {PURPOSE_OPTIONS.map(({ key, description }) => {
              const Icon = PURPOSE_ICONS[key] || Monitor;
              const active = form.purpose === key;
              return (
                <button
                  key={key}
                  type="button"
                  title={description}
                  onClick={() => setForm({ ...form, ...PURPOSE_TEMPLATE_PRESETS[key], purpose: key })}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
                    active ? "border-brand-500 bg-brand-50 text-brand-700 shadow-sm" : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? "text-brand-600" : "text-gray-400"}`} />
                  <span>{PURPOSE_LABELS[key]}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_560px]">
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label className="label">Plantilla</label>
              <button type="button" onClick={() => setShowTemplateEditor(true)} className="btn-primary py-2 text-sm">
                <Pencil className="mr-2 h-4 w-4" />
                Abrir Template Studio
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {VIDEO_TEMPLATES.map((template) => {
                const active = form.template === template.key;
                return (
                  <button
                    key={template.key}
                    type="button"
                    onClick={() => setForm({ ...form, template: template.key })}
                    className={`rounded-lg border bg-white p-2 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm ${
                      active ? "border-brand-500 ring-2 ring-brand-100" : "border-gray-200"
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
                        <p className="truncate text-sm font-semibold text-gray-900">{template.label}</p>
                        <p className="truncate text-xs text-gray-500">{template.description}</p>
                      </div>
                      <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: template.accent }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="min-w-0">
            <div className="mb-2 flex items-center justify-between gap-2">
              <label className="label">Preview editable</label>
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500">{form.orientation === "portrait" ? "Vertical" : "Horizontal"}</span>
            </div>
            <TemplatePreview
              form={form}
              updateFormField={updateFormField}
              template={form.template}
              purpose={form.purpose}
              size="large"
              showHelp={false}
            />
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
              <input
                className="input"
                value={form.templateHeadline}
                onChange={(event) => setForm({ ...form, templateHeadline: event.target.value })}
                placeholder="Título principal"
              />
              <input
                className="input"
                value={form.templateSubtitle}
                onChange={(event) => setForm({ ...form, templateSubtitle: event.target.value })}
                placeholder="Texto secundario"
              />
              <input
                className="input"
                value={form.templateTicker}
                onChange={(event) => setForm({ ...form, templateTicker: event.target.value })}
                placeholder="Ticker inferior"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="submit" className="btn-primary">{editing ? "Guardar cambios" : "Crear pantalla"}</button>
          <button type="button" onClick={onCancel} className="btn-secondary">Cancelar</button>
        </div>
      </form>
    </div>
  );
}
