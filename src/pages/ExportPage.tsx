import React, { useEffect, useState } from "react";
import { supabase, Film } from "../lib/supabase";
import { getImageUrl } from "../lib/tmdb";

export const ExportPage: React.FC = () => {
  const [films, setFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editLocations, setEditLocations] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("films")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setFilms((data || []) as Film[]);
    } catch (err) {
      console.error("Failed to load films:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (f: Film) => {
    setEditingId(f.id ?? null);
    setEditTitle(f.title);
    setEditLocations((f.storage_locations || []).join(", "));
  };

  const saveEdit = async () => {
    if (editingId == null) return;
    setSaving(true);
    try {
      const locs = editLocations
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const { error } = await supabase
        .from("films")
        .update({ title: editTitle, storage_locations: locs })
        .eq("id", editingId);
      if (error) throw error;
      await load();
      setEditingId(null);
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const deleteFilm = async (id?: number) => {
    if (!id) return;
    if (!confirm("Delete this film? This action cannot be undone.")) return;
    try {
      const { error } = await supabase.from("films").delete().eq("id", id);
      if (error) throw error;
      setFilms((f) => f.filter((x) => x.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete film.");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        Loading…
      </div>
    );

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white">Export / Manage Films</h2>
        <p className="text-slate-400">
          List of all films you added. Edit storage locations or remove films
          here.
        </p>
      </div>

      <div className="space-y-4">
        {films.map((film) => (
          <div
            key={film.id}
            className="bg-slate-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:space-x-4"
          >
            <img
              src={getImageUrl(film.poster_path, "w92")}
              alt={film.title}
              className="w-20 h-28 object-cover rounded mb-3 md:mb-0"
            />

            <div className="flex-1">
              {editingId === film.id ? (
                <div className="space-y-2">
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600"
                  />
                  <input
                    value={editLocations}
                    onChange={(e) => setEditLocations(e.target.value)}
                    className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600"
                    placeholder="Comma separated locations"
                  />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white text-lg font-semibold">
                        {film.title}
                      </h3>
                      <p className="text-slate-300 text-sm">
                        {film.release_date
                          ? new Date(film.release_date).getFullYear()
                          : ""}
                      </p>
                    </div>
                    <div className="hidden md:block">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => startEdit(film)}
                          className="bg-amber-500 hover:bg-amber-600 text-slate-900 px-3 py-1 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteFilm(film.id)}
                          className="bg-red-700 hover:bg-red-800 text-white px-3 py-1 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="text-slate-300 text-sm">
                      Genres: {(film.genres || []).join(", ")}
                    </p>
                    <p className="text-slate-300 text-sm mt-2">
                      Storage:{" "}
                      {(film.storage_locations || []).length
                        ? (film.storage_locations || []).join(", ")
                        : "—"}
                    </p>
                  </div>
                </>
              )}
            </div>

            {editingId === film.id ? (
              <div className="mt-3 md:mt-0 md:ml-4 flex items-center space-x-2">
                <button
                  onClick={saveEdit}
                  disabled={saving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
                <button
                  onClick={cancelEdit}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="mt-3 md:mt-0 md:ml-4 flex items-center space-x-2 md:hidden">
                <button
                  onClick={() => startEdit(film)}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-900 px-3 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteFilm(film.id)}
                  className="bg-red-700 hover:bg-red-800 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}

        {films.length === 0 && (
          <div className="text-slate-400">No films found.</div>
        )}
      </div>
    </main>
  );
};
