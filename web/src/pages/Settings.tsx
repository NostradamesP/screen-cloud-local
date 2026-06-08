import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { useI18n } from "@/i18n/useI18n";

export default function Settings() {
  const { user } = useAuth();
  const { t, locale, setLocale } = useI18n();
  const [pairCode, setPairCode] = useState("");
  const [pairName, setPairName] = useState("");
  const [pairResult, setPairResult] = useState<string | null>(null);

  const handlePair = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.screens.pair(pairCode, pairName || undefined);
      setPairResult(`Pantalla "${res.name}" vinculada exitosamente`);
      setPairCode("");
      setPairName("");
    } catch (err) {
      setPairResult(err instanceof Error ? err.message : "Error al vincular");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Configuración</h1>

      <div className="space-y-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("settings.profile", "Perfil")}</h2>
          <div className="space-y-2 text-sm">
            <p><span className="text-gray-500">{t("settings.name", "Nombre")}:</span> {user?.name}</p>
            <p><span className="text-gray-500">{t("settings.email", "Email")}:</span> {user?.email}</p>
            <p><span className="text-gray-500">{t("settings.role", "Rol")}:</span> {user?.role}</p>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("settings.language", "Idioma")}</h2>
          <select className="input max-w-xs" value={locale} onChange={(e) => setLocale(e.target.value)}>
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("settings.pairScreen", "Vincular Pantalla")}</h2>
          <form onSubmit={handlePair} className="space-y-4 max-w-md">
            <div>
              <label className="label">Código de vinculación</label>
              <input
                className="input uppercase tracking-widest"
                value={pairCode}
                onChange={(e) => setPairCode(e.target.value.toUpperCase())}
                placeholder="XXXXXX"
                maxLength={6}
                required
              />
            </div>
            <div>
              <label className="label">Nombre (opcional)</label>
              <input className="input" value={pairName} onChange={(e) => setPairName(e.target.value)} placeholder="Ej: Hall Principal" />
            </div>
            <button type="submit" className="btn-primary">Vincular</button>
            {pairResult && (
              <p className={`text-sm ${pairResult.includes("exitosa") ? "text-green-600" : "text-red-600"}`}>
                {pairResult}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
