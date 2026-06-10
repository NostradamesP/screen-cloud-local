import React from "react";
import {
  AlertTriangle,
  Monitor,
  Plus,
  RefreshCw,
  Trash2,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import { useScreens } from "./screens/useScreens";
import { ScreenCard } from "./screens/ScreenCard";
import { ScreenDetailPanel } from "./screens/ScreenDetailPanel";
import { ContentPickerModal } from "./screens/ContentPickerModal";
import { ScreenFormPanel } from "./screens/ScreenFormPanel";
import { CustomTemplateEditor } from "./screens/CustomTemplateEditor";
import { normalizePurpose, PURPOSE_ICONS, PURPOSE_LABELS, CONTENT_ICONS, CONTENT_LABELS } from "./screens/constants";

export default function Screens() {
  const {
    screens,
    contentItems,
    showForm,
    setShowForm,
    editing,
    setEditing,
    selectedScreenId,
    setSelectedScreenId,
    selectedScreen,
    form,
    setForm,
    updateFormField,
    pairCode,
    setPairCode,
    qrDataUrl,
    setQrDataUrl,
    syncing,
    clearing,
    pickingContent,
    setPickingContent,
    deleteTarget,
    setDeleteTarget,
    deleting,
    deleteError,
    showTemplateEditor,
    setShowTemplateEditor,
    toast,
    setToast,
    screenStats,
    isOnline,
    getPlaybackInfo,
    getAssignedContent,
    handleSubmit,
    openCreate,
    handleEdit,
    requestDelete,
    confirmDelete,
    assignContent,
    handleSync,
    handleClearCache,
    generatePairCode,
  } = useScreens();

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-brand-700">Centro de control</p>
          <h1 className="text-2xl font-bold text-gray-900">Pantallas</h1>
          <p className="mt-1 text-sm text-gray-500">
            Administra cada pantalla, su contenido idle, conexión y acciones del player desde un solo lugar.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={generatePairCode} className="btn-secondary">
            <Monitor className="mr-2 h-4 w-4" />
            Vincular pantalla
          </button>
          <button onClick={handleSync} disabled={syncing} className="btn-secondary">
            <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            Sincronizar
          </button>
          <button onClick={handleClearCache} disabled={clearing} className="btn-secondary text-red-600 hover:border-red-200 hover:bg-red-50">
            <Trash2 className="mr-2 h-4 w-4" />
            Limpiar caché
          </button>
          <button onClick={openCreate} className="btn-primary">
            <Plus className="mr-2 h-4 w-4" />
            Nueva pantalla
          </button>
        </div>
      </div>

      {toast && (
        <div className={`mb-4 flex items-center justify-between rounded-lg border px-4 py-3 text-sm ${
          toast.type === "success"
            ? "border-green-200 bg-green-50 text-green-800"
            : "border-red-200 bg-red-50 text-red-800"
        }`}>
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="rounded p-1 opacity-70 hover:opacity-100">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Total</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{screenStats.total}</p>
        </div>
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-green-700">Online</p>
          <p className="mt-1 text-2xl font-bold text-green-700">{screenStats.online}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Offline</p>
          <p className="mt-1 text-2xl font-bold text-gray-700">{screenStats.offline}</p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-amber-700">Con contenido</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">{screenStats.assigned}</p>
        </div>
      </div>

      {pairCode && (
        <div className="mb-6 rounded-lg border border-brand-200 bg-brand-50 p-4 animate-slide-down">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-brand-900">Código de vinculación</h2>
              <p className="mt-1 text-sm text-brand-700">Abre el player en la TV y escribe este código.</p>
              <p className="mt-3 text-4xl font-bold tracking-widest text-brand-700">{pairCode.pairCode}</p>
            </div>
            <div className="flex items-center gap-3">
              {qrDataUrl && <img src={qrDataUrl} alt="QR de vinculación" className="h-28 w-28 rounded bg-white p-1" />}
              <button onClick={() => { setPairCode(null); setQrDataUrl(null); }} className="btn-secondary">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <ScreenFormPanel
          form={form}
          setForm={setForm}
          updateFormField={updateFormField}
          editing={editing}
          showTemplateEditor={showTemplateEditor}
          setShowTemplateEditor={setShowTemplateEditor}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setShowTemplateEditor(false); setEditing(null); }}
        />
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {screens.map((screen) => (
            <ScreenCard
              key={screen.id}
              screen={screen}
              selected={selectedScreenId === screen.id}
              isOnline={isOnline}
              getPlaybackInfo={getPlaybackInfo}
              getAssignedContent={getAssignedContent}
              onSelect={(s) => setSelectedScreenId(s.id)}
              onEdit={handleEdit}
              onDelete={requestDelete}
              onAssignContent={(s) => { setPickingContent(s); setSelectedScreenId(s.id); }}
            />
          ))}
          {screens.length === 0 && (
            <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center md:col-span-2">
              <Monitor className="mx-auto h-10 w-10 text-gray-300" />
              <h2 className="mt-3 font-semibold text-gray-900">No hay pantallas registradas</h2>
              <p className="mt-1 text-sm text-gray-500">Crea una pantalla o genera un código para vincular una TV.</p>
              <button onClick={generatePairCode} className="btn-primary mt-4">
                <Monitor className="mr-2 h-4 w-4" />
                Vincular primera pantalla
              </button>
            </div>
          )}
        </div>

        <aside className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm xl:sticky xl:top-6 xl:self-start">
          {selectedScreen ? (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Detalle de pantalla</p>
                  <h2 className="mt-1 text-xl font-bold text-gray-900">{selectedScreen.name}</h2>
                  <p className="text-sm text-gray-500">{selectedScreen.location || "Sin ubicación"}</p>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                  isOnline(selectedScreen) ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                }`}>
                  {isOnline(selectedScreen) ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                  {isOnline(selectedScreen) ? "Online" : "Offline"}
                </span>
              </div>

              {(() => {
                const playback = getPlaybackInfo(selectedScreen);
                const PlaybackIcon = playback.icon;
                return (
                  <div className={`rounded-lg border p-4 ${playback.className}`}>
                    <div className="flex items-start gap-3">
                      <PlaybackIcon className="mt-0.5 h-5 w-5 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold">{playback.label}</p>
                        <p className="mt-1 text-sm opacity-80">{playback.detail}</p>
                        {selectedScreen.playbackUpdatedAt && (
                          <p className="mt-2 text-xs opacity-70">
                            Actualizado: {new Date(selectedScreen.playbackUpdatedAt).toLocaleString("es")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Resolución</p>
                  <p className="font-medium text-gray-900">{selectedScreen.resolution}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Orientación</p>
                  <p className="font-medium text-gray-900">{selectedScreen.orientation === "portrait" ? "Vertical" : "Horizontal"}</p>
                </div>
                <div className="col-span-2 rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Propósito</p>
                  <p className="mt-1 flex items-center gap-2 font-medium text-gray-900">
                    {React.createElement(PURPOSE_ICONS[normalizePurpose(selectedScreen.purpose)] || Monitor, { className: "h-4 w-4 text-gray-500" })}
                    {PURPOSE_LABELS[normalizePurpose(selectedScreen.purpose)] || normalizePurpose(selectedScreen.purpose)}
                  </p>
                </div>
                <div className="col-span-2 rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Contenido actual</p>
                  <p className="font-medium text-gray-900">
                    {selectedScreen.currentContentTitle || "Sin contenido reproduciéndose"}
                  </p>
                </div>
                <div className="col-span-2 rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Último heartbeat</p>
                  <p className="font-medium text-gray-900">
                    {selectedScreen.lastHeartbeat ? new Date(selectedScreen.lastHeartbeat).toLocaleString("es") : "Sin actividad registrada"}
                  </p>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">Contenido idle</h3>
                  <span className="text-xs text-gray-400">Se reproduce sin programación activa</span>
                </div>
                <button
                  onClick={() => { setPickingContent(selectedScreen); }}
                  className={`w-full rounded-lg border border-dashed p-3 text-left transition-colors ${
                    selectedScreen.idleContentId
                      ? "border-amber-200 bg-amber-50/70 hover:border-amber-300"
                      : "border-gray-300 hover:border-brand-400 hover:bg-brand-50/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {(() => {
                      const assigned = getAssignedContent(selectedScreen);
                      const Icon = assigned ? (CONTENT_ICONS[assigned.type] || Monitor) : Monitor;
                      return (
                        <>
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${assigned ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-400"}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-900">
                              {assigned ? assigned.title : "Sin contenido asignado"}
                            </p>
                            <p className={`text-xs ${assigned ? "text-amber-700" : "text-gray-500"}`}>
                              {assigned ? CONTENT_LABELS[assigned.type] || assigned.type : "Asignar contenido"}
                            </p>
                          </div>
                          <span className="text-xs font-medium text-brand-600">Cambiar</span>
                        </>
                      );
                    })()}
                  </div>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => handleEdit(selectedScreen)} className="btn-secondary">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Editar
                </button>
                <button onClick={() => requestDelete(selectedScreen)} className="btn-secondary text-red-600 hover:border-red-200 hover:bg-red-50">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </button>
              </div>

              {pairCode && pairCode.screenId === selectedScreen.id && (
                <div className="rounded-lg border border-brand-200 bg-brand-50 p-4">
                  <p className="text-sm font-semibold text-brand-900">Código activo</p>
                  <p className="mt-2 text-3xl font-bold tracking-widest text-brand-700">{pairCode.pairCode}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-10 text-center">
              <Monitor className="mx-auto h-10 w-10 text-gray-300" />
              <h2 className="mt-3 font-semibold text-gray-900">Selecciona una pantalla</h2>
              <p className="mt-1 text-sm text-gray-500">Aquí aparecerán sus acciones, contenido y estado.</p>
            </div>
          )}
        </aside>
      </div>

      {showTemplateEditor && normalizePurpose(form.purpose) === "other" && (
        <CustomTemplateEditor
          form={form}
          updateFormField={updateFormField}
          onClose={() => setShowTemplateEditor(false)}
        />
      )}

      {pickingContent && (
        <ContentPickerModal
          screen={pickingContent}
          contentItems={contentItems}
          onAssign={assignContent}
          onClose={() => setPickingContent(null)}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in" onClick={() => setDeleteTarget(null)}>
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Eliminar pantalla</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Vas a eliminar <span className="font-semibold text-gray-900">{deleteTarget.name}</span>. También se quitarán sus vínculos con programaciones y grupos relacionados.
                </p>
              </div>
            </div>
            <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-800">
              Esta acción no se puede deshacer desde la app.
            </div>
            {deleteError && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">
                {deleteError}
              </div>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setDeleteTarget(null)} className="btn-secondary" disabled={deleting}>Cancelar</button>
              <button type="button" onClick={confirmDelete} className="btn-danger" disabled={deleting}>
                <Trash2 className="mr-2 h-4 w-4" />
                {deleting ? "Eliminando..." : "Sí, eliminar pantalla"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
