const API_BASE = "/api";

function getToken(): string | null {
  return localStorage.getItem("token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (options.body && !headers["Content-Type"]) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  if (res.status === 204) return undefined as T;
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error ?? "Request failed");
  }
  return res.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ token: string; user: { id: string; email: string; name: string; role: string } }>(
        "/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }
      ),
    register: (email: string, name: string, password: string) =>
      request<{ token: string; user: { id: string; email: string; name: string; role: string } }>(
        "/auth/register", { method: "POST", body: JSON.stringify({ email, name, password }) }
      ),
    me: () => request<{ id: string; email: string; name: string; role: string; avatarUrl?: string }>("/auth/me"),
  },
  content: {
    list: () => request<any[]>("/content"),
    get: (id: string) => request<any>(`/content/${id}`),
    create: (data: any) => request<any>("/content", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/content/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/content/${id}`, { method: "DELETE" }),
  },
  playlists: {
    list: () => request<any[]>("/playlists"),
    get: (id: string) => request<any>(`/playlists/${id}`),
    create: (data: any) => request<any>("/playlists", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/playlists/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/playlists/${id}`, { method: "DELETE" }),
    addItem: (playlistId: string, data: any) =>
      request<any>(`/playlists/${playlistId}/items`, { method: "POST", body: JSON.stringify(data) }),
    removeItem: (playlistId: string, itemId: string) =>
      request<void>(`/playlists/${playlistId}/items/${itemId}`, { method: "DELETE" }),
    reorderItems: (playlistId: string, items: { id: string; position: number }[]) =>
      request<any>(`/playlists/${playlistId}/items/reorder`, { method: "PUT", body: JSON.stringify({ items }) }),
  },
  schedules: {
    list: () => request<any[]>("/schedules"),
    get: (id: string) => request<any>(`/schedules/${id}`),
    create: (data: any) => request<any>("/schedules", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/schedules/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/schedules/${id}`, { method: "DELETE" }),
  },
  media: {
    list: () => request<any[]>("/media"),
    delete: (id: string) => request<void>(`/media/${id}`, { method: "DELETE" }),
    upload: (file: File) => {
      const token = getToken();
      const formData = new FormData();
      formData.append("file", file);
      return fetch(`${API_BASE}/media/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      }).then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Upload failed" }));
          throw new Error(err.error ?? "Upload failed");
        }
        return res.json();
      });
    },
  },
  screens: {
    list: () => request<any[]>("/screens"),
    get: (id: string) => request<any>(`/screens/${id}`),
    create: (data: any) => request<any>("/screens", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/screens/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/screens/${id}`, { method: "DELETE" }),
    pair: (code: string, name?: string) =>
      request<any>("/screens/pair", { method: "POST", body: JSON.stringify({ code, name }) }),
    getPairCode: () => request<{ screenId: string; pairCode: string }>("/screens/pair-code"),
  },
  screenGroups: {
    list: () => request<any[]>("/screen-groups"),
    get: (id: string) => request<any>(`/screen-groups/${id}`),
    create: (data: any) => request<any>("/screen-groups", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/screen-groups/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/screen-groups/${id}`, { method: "DELETE" }),
  },
  player: {
    sync: () => request<{ ok: boolean; message: string }>("/player/sync", { method: "POST", body: "{}" }),
    clearCache: () => request<{ ok: boolean; message: string }>("/player/clear-cache", { method: "POST", body: "{}" }),
  },
  scheduler: {
    now: () => request<{ screenId: string; screenName: string; location: string; purpose: string; status: string; activeSchedule: any; idleContent: { id: string; title: string; type: string } | null }[]>("/scheduler/now"),
  },
  layouts: {
    list: () => request<any[]>("/layouts"),
    get: (id: string) => request<any>(`/layouts/${id}`),
    create: (data: any) => request<any>("/layouts", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/layouts/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/layouts/${id}`, { method: "DELETE" }),
    createZone: (layoutId: string, data: any) =>
      request<any>(`/layouts/${layoutId}/zones`, { method: "POST", body: JSON.stringify(data) }),
    updateZone: (layoutId: string, zoneId: string, data: any) =>
      request<any>(`/layouts/${layoutId}/zones/${zoneId}`, { method: "PUT", body: JSON.stringify(data) }),
    deleteZone: (layoutId: string, zoneId: string) =>
      request<void>(`/layouts/${layoutId}/zones/${zoneId}`, { method: "DELETE" }),
  },
  widgets: {
    list: () => request<any[]>("/widgets"),
    get: (id: string) => request<any>(`/widgets/${id}`),
    create: (data: any) => request<any>("/widgets", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/widgets/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/widgets/${id}`, { method: "DELETE" }),
    definitions: () => request<any[]>("/widget-definitions"),
  },
  auditLogs: {
    list: (params?: Record<string, string>) => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<{ items: any[]; total: number; page: number; limit: number; totalPages: number }>(`/audit-logs${qs}`);
    },
  },
  tags: {
    list: () => request<any[]>("/tags"),
    create: (data: any) => request<any>("/tags", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/tags/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/tags/${id}`, { method: "DELETE" }),
    setContentTags: (contentId: string, tagIds: string[]) =>
      request<any>(`/content/${contentId}/tags`, { method: "POST", body: JSON.stringify({ tagIds }) }),
    getContentTags: (contentId: string) => request<string[]>(`/content/${contentId}/tags`),
  },
  org: {
    members: () => request<any[]>("/org/members"),
    updateMemberRole: (id: string, role: string) =>
      request<any>(`/org/members/${id}/role`, { method: "PUT", body: JSON.stringify({ role }) }),
    setContentStatus: (id: string, status: string) =>
      request<any>(`/content/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
    exportContent: () => {
      const token = getToken();
      return fetch(`/api/content/export`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
        .then(r => r.json());
    },
    importContent: (data: any[]) =>
      request<any>("/content/import", { method: "POST", body: JSON.stringify(data) }),
  },
  notifications: {
    list: (unread?: boolean) => request<any[]>(`/notifications${unread ? "?unread=true" : ""}`),
    markRead: (id: string) => request<any>(`/notifications/${id}/read`, { method: "PUT" }),
    markAllRead: () => request<any>("/notifications/read-all", { method: "PUT" }),
  },
  proofOfPlay: {
    log: (data: any) => request<any>("/proof-of-play/log", { method: "POST", body: JSON.stringify(data) }),
    list: (params?: Record<string, string>) => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<any[]>(`/proof-of-play${qs}`);
    },
    stats: (params?: Record<string, string>) => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<any>(`/proof-of-play/stats${qs}`);
    },
  },
};
