import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, GripVertical } from "lucide-react";

export default function Playlists() {
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [formName, setFormName] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [dragItem, setDragItem] = useState<{ playlistId: string; index: number } | null>(null);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [addItemForm, setAddItemForm] = useState<{ contentItemId: string; position: number; durationOverride: string } | null>(null);
  const [contentItems, setContentItems] = useState<any[]>([]);

  const load = async () => {
    const data = await api.playlists.list();
    setPlaylists(data);
  };

  const loadContent = useCallback(async () => {
    const items = await api.content.list().catch(() => []);
    setContentItems(items);
  }, []);

  useEffect(() => { load(); loadContent(); }, [loadContent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await api.playlists.update(editing.id, { name: formName });
    } else {
      await api.playlists.create({ name: formName });
    }
    setShowForm(false);
    setEditing(null);
    setFormName("");
    load();
  };

  const handleEdit = (p: any) => {
    setFormName(p.name);
    setEditing(p);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta playlist?")) return;
    await api.playlists.delete(id);
    load();
  };

  const toggleExpand = async (id: string) => {
    if (!expanded[id]) {
      const data = await api.playlists.get(id);
      setPlaylists((prev) => prev.map((p) => (p.id === id ? data : p)));
    }
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDragStart = (playlistId: string, index: number) => {
    setDragItem({ playlistId, index });
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (!dragItem || dragItem.playlistId !== selectedPlaylistId) return;
  };

  const handleDrop = async (playlistId: string, targetIndex: number) => {
    if (!dragItem || dragItem.playlistId !== playlistId) return;
    const playlist = playlists.find((p) => p.id === playlistId);
    if (!playlist || !playlist.items) return;
    const items = [...playlist.items].sort((a: any, b: any) => a.position - b.position);
    const [moved] = items.splice(dragItem.index, 1);
    items.splice(targetIndex, 0, moved);
    const reordered = items.map((item: any, i: number) => ({ id: item.id, position: i }));
    await api.playlists.reorderItems(playlistId, reordered);
    setDragItem(null);
    toggleExpand(playlistId);
  };

  const openAddItem = (playlistId: string, nextPosition: number) => {
    setSelectedPlaylistId(playlistId);
    setAddItemForm({ contentItemId: "", position: nextPosition, durationOverride: "" });
  };

  const addItem = async () => {
    if (!addItemForm || !selectedPlaylistId) return;
    await api.playlists.addItem(selectedPlaylistId, {
      contentItemId: addItemForm.contentItemId,
      position: addItemForm.position,
      durationOverride: addItemForm.durationOverride ? parseInt(addItemForm.durationOverride) : undefined,
    });
    setAddItemForm(null);
    setSelectedPlaylistId(null);
    toggleExpand(selectedPlaylistId);
  };

  const deleteItem = async (playlistId: string, itemId: string) => {
    if (!confirm("¿Eliminar este item?")) return;
    await api.playlists.removeItem(playlistId, itemId);
    toggleExpand(playlistId);
  };

  const sortedItems = (items: any[]) => [...items].sort((a: any, b: any) => a.position - b.position);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Playlists</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); setFormName(""); }} className="btn-primary">
          <Plus className="h-4 w-4 mr-2" /> Nueva
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Nombre</label>
              <input className="input" value={formName} onChange={(e) => setFormName(e.target.value)} required />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">{editing ? "Guardar" : "Crear"}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="btn-secondary">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {playlists.map((p) => {
          const isSelected = selectedPlaylistId === p.id;
          return (
            <div key={p.id} className="card">
              <div className="flex items-center justify-between">
                <button onClick={() => toggleExpand(p.id)} className="flex items-center gap-2 flex-1 text-left">
                  {expanded[p.id] ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
                  <span className="font-medium text-gray-900">{p.name}</span>
                  {p.items && <span className="text-xs text-gray-400">({p.items.length} items)</span>}
                </button>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(p)} className="p-1 text-gray-400 hover:text-gray-600"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              {expanded[p.id] && (
                <div className="mt-3 ml-6">
                  {p.items && p.items.length > 0 && (
                    <div className="space-y-1 mb-2">
                      {sortedItems(p.items).map((item: any, i: number) => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={() => handleDragStart(p.id, i)}
                          onDragOver={(e) => handleDragOver(e, i)}
                          onDrop={() => handleDrop(p.id, i)}
                          className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-gray-50 cursor-grab active:cursor-grabbing group"
                        >
                          <GripVertical className="h-4 w-4 text-gray-300 cursor-grab" />
                          <span className="text-xs text-gray-400 w-5">{i + 1}.</span>
                          <span className="text-sm text-gray-700 flex-1 truncate">
                            {item.contentItem?.title ?? `Item ${item.id.substring(0, 8)}`}
                          </span>
                          <span className="text-xs text-gray-400">{item.durationOverride ?? item.contentItem?.duration ?? 10}s</span>
                          <button onClick={() => deleteItem(p.id, item.id)} className="p-0.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {(!p.items || p.items.length === 0) && (
                    <p className="text-sm text-gray-400 mb-2">Playlist vacía</p>
                  )}
                  <button onClick={() => openAddItem(p.id, p.items ? p.items.length : 0)} className="btn-secondary text-xs">
                    <Plus className="h-3 w-3 mr-1" /> Añadir contenido
                  </button>
                  {addItemForm && isSelected && (
                    <div className="flex gap-2 items-end mt-2">
                      <div className="flex-1">
                        <select className="input text-xs" value={addItemForm.contentItemId} onChange={(e) => setAddItemForm({ ...addItemForm, contentItemId: e.target.value })}>
                          <option value="">Seleccionar...</option>
                          {contentItems.map((c: any) => <option key={c.id} value={c.id}>{c.title} ({c.type})</option>)}
                        </select>
                      </div>
                      <div className="w-20">
                        <input className="input text-xs" type="number" placeholder="Dur." value={addItemForm.durationOverride} onChange={(e) => setAddItemForm({ ...addItemForm, durationOverride: e.target.value })} />
                      </div>
                      <button onClick={addItem} className="btn-primary text-xs" disabled={!addItemForm.contentItemId}>Añadir</button>
                      <button onClick={() => { setAddItemForm(null); setSelectedPlaylistId(null); }} className="btn-secondary text-xs">X</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {playlists.length === 0 && (
          <p className="text-gray-500 text-center py-8">No hay playlists aún.</p>
        )}
      </div>
    </div>
  );
}
