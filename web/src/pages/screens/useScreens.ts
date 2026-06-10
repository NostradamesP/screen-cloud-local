import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import QRCode from "qrcode";
import {
  AlertTriangle,
  Monitor,
  Pause,
  Play,
  WifiOff,
} from "lucide-react";
import { ScreenForm, Toast, emptyForm, PURPOSE_TEMPLATE_PRESETS } from "./types";
import { normalizePurpose } from "./constants";

export function useScreens() {
  const [screens, setScreens] = useState<any[]>([]);
  const [contentItems, setContentItems] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [selectedScreenId, setSelectedScreenId] = useState<string | null>(null);
  const [form, setForm] = useState<ScreenForm>(emptyForm);
  const [pairCode, setPairCode] = useState<{ screenId: string; pairCode: string } | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [pickingContent, setPickingContent] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  const load = async () => {
    const [data, content] = await Promise.all([
      api.screens.list().catch(() => []),
      api.content.list().catch(() => []),
    ]);
    setScreens(data);
    setContentItems(content);
  };

  useEffect(() => {
    load();
    const interval = window.setInterval(load, 30000);
    return () => window.clearInterval(interval);
  }, []);

  const selectedScreen = useMemo(
    () => screens.find((screen) => screen.id === selectedScreenId) ?? null,
    [screens, selectedScreenId]
  );

  const updateFormField = <K extends keyof ScreenForm>(field: K, value: ScreenForm[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const screenStats = useMemo(() => {
    const online = screens.filter((screen) => isOnline(screen)).length;
    return {
      total: screens.length,
      online,
      offline: screens.length - online,
      assigned: screens.filter((screen) => screen.idleContentId).length,
    };
  }, [screens]);

  const showToast = (nextToast: Toast) => {
    setToast(nextToast);
    window.setTimeout(() => setToast(null), 3500);
  };

  function isOnline(screen: any) {
    if (!screen.lastHeartbeat) return false;
    const diff = Date.now() - new Date(screen.lastHeartbeat).getTime();
    return diff < 60000;
  }

  function getPlaybackInfo(screen: any) {
    if (!isOnline(screen)) {
      return {
        label: "Offline",
        detail: "Sin conexión reciente",
        className: "border-gray-200 bg-gray-50 text-gray-600",
        icon: WifiOff,
      };
    }
    switch (screen.playbackState) {
      case "playing_schedule":
        return {
          label: "Reproduciendo programación",
          detail: screen.currentContentTitle || "Contenido programado activo",
          className: "border-brand-200 bg-brand-50 text-brand-700",
          icon: Play,
        };
      case "playing_idle":
        return {
          label: "Reproduciendo contenido idle",
          detail: screen.currentContentTitle || "Contenido idle activo",
          className: "border-amber-200 bg-amber-50 text-amber-700",
          icon: Pause,
        };
      case "error":
        return {
          label: "Error de reproducción",
          detail: screen.playbackMessage || "El player reportó un problema",
          className: "border-red-200 bg-red-50 text-red-700",
          icon: AlertTriangle,
        };
      case "empty":
        return {
          label: "Sin contenido asignado",
          detail: screen.playbackMessage || "No hay nada reproduciéndose",
          className: "border-gray-200 bg-gray-50 text-gray-600",
          icon: Monitor,
        };
      default:
        return {
          label: "Esperando estado",
          detail: screen.playbackMessage || "El player todavía no reporta reproducción",
          className: "border-gray-200 bg-gray-50 text-gray-600",
          icon: Monitor,
        };
    }
  }

  const getAssignedContent = (screen: any) =>
    contentItems.find((content: any) => content.id === screen.idleContentId) ?? null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const {
      template,
      templateHeadline,
      templateSubtitle,
      templateBadge,
      templateQrText,
      templateWeatherLocation,
      templateTemperature,
      templateTicker,
      templateLogoText,
      templatePrimaryColor,
      templateBgColor,
      templateTextColor,
      templateTickerBg,
      templateTickerText,
      templateWidgetBg,
      templateAccentColor,
      templateFontFamily,
      templateFontSizeScale,
      templateCornerRadius,
      templateTickerSpeed,
      templateTransition,
      templateMediaFit,
      templateShowWeather,
      templateShowTicker,
      templateCustomCSS,
      templateQrUrl,
      templateLogoUrl,
      templateGradientColor1,
      templateGradientColor2,
      templateGradientDirection,
      templateShowKpis,
      templateKpi1Label,
      templateKpi1Value,
      templateKpi2Label,
      templateKpi2Value,
      templateKpi3Label,
      templateKpi3Value,
      ...screenForm
    } = form;
    const payload: any = {
      ...screenForm,
      settings: {
        ...(editing?.settings ?? {}),
        template,
        templateHeadline,
        templateSubtitle,
        templateBadge,
        templateQrText,
        templateWeatherLocation,
        templateTemperature,
        templateTicker,
        templateLogoText,
        templatePrimaryColor,
        templateBgColor,
        templateTextColor,
        templateTickerBg,
        templateTickerText,
        templateWidgetBg,
        templateAccentColor,
        templateFontFamily,
        templateFontSizeScale,
        templateCornerRadius,
        templateTickerSpeed,
        templateTransition,
        templateMediaFit,
        templateShowWeather,
        templateShowTicker,
        templateCustomCSS,
        templateQrUrl,
        templateLogoUrl,
        templateGradientColor1,
        templateGradientColor2,
        templateGradientDirection,
        templateShowKpis,
        templateKpi1Label,
        templateKpi1Value,
        templateKpi2Label,
        templateKpi2Value,
        templateKpi3Label,
        templateKpi3Value,
      },
    };
    try {
      if (editing) {
        const updated = await api.screens.update(editing.id, payload);
        setSelectedScreenId(updated.id);
        showToast({ type: "success", message: "Pantalla actualizada." });
      } else {
        const created = await api.screens.create(payload);
        setSelectedScreenId(created.id);
        showToast({ type: "success", message: "Pantalla creada." });
      }
      setShowForm(false);
      setShowTemplateEditor(false);
      setEditing(null);
      setForm(emptyForm);
      load();
    } catch (err: any) {
      showToast({ type: "error", message: err.message || "No se pudo guardar la pantalla." });
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowTemplateEditor(false);
    setShowForm(true);
  };

  const handleEdit = (screen: any) => {
    setForm({
      name: screen.name,
      location: screen.location ?? "",
      resolution: screen.resolution,
      orientation: screen.orientation,
      purpose: normalizePurpose(screen.purpose),
      template: screen.settings?.template ?? "full_bleed",
      templateHeadline: screen.settings?.templateHeadline ?? "",
      templateSubtitle: screen.settings?.templateSubtitle ?? "",
      templateBadge: screen.settings?.templateBadge ?? "",
      templateQrText: screen.settings?.templateQrText ?? "",
      templateWeatherLocation: screen.settings?.templateWeatherLocation ?? "United Kingdom",
      templateTemperature: screen.settings?.templateTemperature ?? "16°C",
      templateTicker: screen.settings?.templateTicker ?? "",
      templateLogoText: screen.settings?.templateLogoText ?? "",
      templatePrimaryColor: screen.settings?.templatePrimaryColor ?? "",
      templateBgColor: screen.settings?.templateBgColor ?? "",
      templateTextColor: screen.settings?.templateTextColor ?? "",
      templateTickerBg: screen.settings?.templateTickerBg ?? "",
      templateTickerText: screen.settings?.templateTickerText ?? "",
      templateWidgetBg: screen.settings?.templateWidgetBg ?? "",
      templateAccentColor: screen.settings?.templateAccentColor ?? "",
      templateFontFamily: screen.settings?.templateFontFamily ?? "system",
      templateFontSizeScale: screen.settings?.templateFontSizeScale ?? "1.0",
      templateCornerRadius: screen.settings?.templateCornerRadius ?? "subtle",
      templateTickerSpeed: screen.settings?.templateTickerSpeed ?? "normal",
      templateTransition: screen.settings?.templateTransition ?? "none",
      templateMediaFit: screen.settings?.templateMediaFit ?? "cover",
      templateShowWeather: screen.settings?.templateShowWeather ?? "yes",
      templateShowTicker: screen.settings?.templateShowTicker ?? "yes",
      templateCustomCSS: screen.settings?.templateCustomCSS ?? "",
      templateQrUrl: screen.settings?.templateQrUrl ?? "",
      templateLogoUrl: screen.settings?.templateLogoUrl ?? "",
      templateGradientColor1: screen.settings?.templateGradientColor1 ?? "",
      templateGradientColor2: screen.settings?.templateGradientColor2 ?? "",
      templateGradientDirection: screen.settings?.templateGradientDirection ?? "to_bottom",
      templateShowKpis: screen.settings?.templateShowKpis ?? "yes",
      templateKpi1Label: screen.settings?.templateKpi1Label ?? "Status",
      templateKpi1Value: screen.settings?.templateKpi1Value ?? "On track",
      templateKpi2Label: screen.settings?.templateKpi2Label ?? "Today",
      templateKpi2Value: screen.settings?.templateKpi2Value ?? "24",
      templateKpi3Label: screen.settings?.templateKpi3Label ?? "Next",
      templateKpi3Value: screen.settings?.templateKpi3Value ?? "14:00",
    });
    setEditing(screen);
    setShowForm(true);
    setSelectedScreenId(screen.id);
  };

  const requestDelete = (screen: any) => {
    setDeleteError(null);
    setDeleteTarget(screen);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await api.screens.delete(deleteTarget.id);
      if (selectedScreenId === deleteTarget.id) setSelectedScreenId(null);
      setDeleteTarget(null);
      showToast({ type: "success", message: `Pantalla "${deleteTarget.name}" eliminada.` });
      await load();
    } catch (err: any) {
      const message = err.message || "No se pudo eliminar la pantalla.";
      setDeleteError(message);
      showToast({ type: "error", message });
    } finally {
      setDeleting(false);
    }
  };

  const assignContent = async (screenId: string, contentId: string | null) => {
    try {
      await api.screens.update(screenId, { idleContentId: contentId || undefined });
      setPickingContent(null);
      showToast({ type: "success", message: contentId ? "Contenido asignado." : "Contenido quitado." });
      load();
    } catch (err: any) {
      showToast({ type: "error", message: err.message || "No se pudo asignar el contenido." });
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await api.player.sync();
      showToast({ type: "success", message: "Pantallas sincronizadas." });
    } catch (err: any) {
      showToast({ type: "error", message: err.message || "No se pudo sincronizar." });
    } finally {
      setSyncing(false);
    }
  };

  const handleClearCache = async () => {
    setClearing(true);
    try {
      await api.player.clearCache();
      showToast({ type: "success", message: "Caché del player limpiado." });
    } catch (err: any) {
      showToast({ type: "error", message: err.message || "No se pudo limpiar la caché." });
    } finally {
      setClearing(false);
    }
  };

  const generatePairCode = async () => {
    try {
      const res = await api.screens.getPairCode();
      setPairCode(res);
      setSelectedScreenId(res.screenId);
      const pairingUrl = `${window.location.origin}/player?pair=${res.pairCode}`;
      const dataUrl = await QRCode.toDataURL(pairingUrl, { width: 200, margin: 2 });
      setQrDataUrl(dataUrl);
      showToast({ type: "success", message: "Código de vinculación generado." });
      load();
    } catch (err: any) {
      setQrDataUrl(null);
      showToast({ type: "error", message: err.message || "No se pudo generar el código." });
    }
  };

  return {
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
    showToast,
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
    load,
  };
}
