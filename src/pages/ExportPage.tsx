import React, { useEffect, useState } from "react";
import { supabase, Film } from "../lib/supabase";
import { getImageUrl } from "../lib/tmdb";

export const ExportPage: React.FC = () => {
  const [films, setFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  // editable copies of all Film fields
  const [editTmdbId, setEditTmdbId] = useState<string>("");
  const [editTitle, setEditTitle] = useState("");
  const [editPosterPath, setEditPosterPath] = useState("");
  const [editBackdropPath, setEditBackdropPath] = useState("");
  const [editOverview, setEditOverview] = useState("");
  const [editReleaseDate, setEditReleaseDate] = useState("");
  const [editVoteAverage, setEditVoteAverage] = useState<string>("");
  const [editRuntime, setEditRuntime] = useState<string>("");
  const [editGenres, setEditGenres] = useState("");
  const [editOriginCountry, setEditOriginCountry] = useState("");
  const [editTrailerKey, setEditTrailerKey] = useState("");
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
    setEditTmdbId(String(f.tmdb_id ?? ""));
    setEditTitle(f.title ?? "");
    setEditPosterPath(f.poster_path ?? "");
    setEditBackdropPath(f.backdrop_path ?? "");
    setEditOverview(f.overview ?? "");
    setEditReleaseDate(f.release_date ?? "");
    setEditVoteAverage(String(f.vote_average ?? ""));
    setEditRuntime(String(f.runtime ?? ""));
    setEditGenres((f.genres || []).join(", "));
    setEditOriginCountry((f.origin_country || []).join(", "));
    setEditTrailerKey(f.trailer_key ?? "");
    setEditLocations((f.storage_locations || []).join(", "));
  };

  const saveEdit = async () => {
    if (editingId == null) return;
    setSaving(true);
    try {
      const genres = editGenres
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const origin = editOriginCountry
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const locs = editLocations
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload: any = {
        tmdb_id: Number(editTmdbId) || null,
        title: editTitle,
        poster_path: editPosterPath,
        backdrop_path: editBackdropPath,
        overview: editOverview,
        release_date: editReleaseDate,
        vote_average: parseFloat(editVoteAverage) || 0,
        runtime: parseInt(editRuntime) || 0,
        genres,
        origin_country: origin,
        trailer_key: editTrailerKey,
        storage_locations: locs,
      };

      // try update; if storage_locations column doesn't exist, retry without it
      const attemptUpdate = async (p: any) => {
        return await supabase.from("films").update(p).eq("id", editingId);
      };

      let res = await attemptUpdate(payload);
      if (res.error) {
        const msg = (res.error.message || "").toLowerCase();
        if (
          msg.includes("storage_locations") ||
          (msg.includes("column") && msg.includes("storage_locations"))
        ) {
          // retry without storage_locations
          delete payload.storage_locations;
          const res2 = await attemptUpdate(payload);
          if (res2.error) throw res2.error;
          // Partial success: notify user that storage_locations wasn't saved because column missing
          alert(
            "Saved changes but 'storage_locations' column does not exist in the database — storage locations were not saved."
          );
        } else {
          throw res.error;
        }
      }
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
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-1">
                      <label className="text-slate-300 text-xs">Poster</label>
                      <img
                        src={getImageUrl(editPosterPath, "w154")}
                        alt="poster"
                        className="w-full h-auto rounded mt-1"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <div>
                        <label className="text-slate-300 text-xs">
                          TMDB ID
                        </label>
                        <input
                          value={editTmdbId}
                          onChange={(e) => setEditTmdbId(e.target.value)}
                          className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600"
                        />
                      </div>
                      <div>
                        <label className="text-slate-300 text-xs">Title</label>
                        <input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-slate-300 text-xs">
                            Poster path
                          </label>
                          <input
                            value={editPosterPath}
                            onChange={(e) => setEditPosterPath(e.target.value)}
                            className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600"
                            placeholder="/path/to/poster.jpg"
                          />
                        </div>
                        <div>
                          <label className="text-slate-300 text-xs">
                            Backdrop path
                          </label>
                          <input
                            value={editBackdropPath}
                            onChange={(e) =>
                              setEditBackdropPath(e.target.value)
                            }
                            className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600"
                            placeholder="/path/to/backdrop.jpg"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-300 text-xs">Overview</label>
                    <textarea
                      value={editOverview}
                      onChange={(e) => setEditOverview(e.target.value)}
                      className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600 h-24"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-slate-300 text-xs">
                        Release date
                      </label>
                      <input
                        type="date"
                        value={editReleaseDate}
                        onChange={(e) => setEditReleaseDate(e.target.value)}
                        className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 text-xs">
                        Vote average
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={editVoteAverage}
                        onChange={(e) => setEditVoteAverage(e.target.value)}
                        className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 text-xs">
                        Runtime (min)
                      </label>
                      <input
                        type="number"
                        value={editRuntime}
                        onChange={(e) => setEditRuntime(e.target.value)}
                        className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 text-xs">
                        Trailer key
                      </label>
                      <input
                        value={editTrailerKey}
                        onChange={(e) => setEditTrailerKey(e.target.value)}
                        className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600"
                        placeholder="YouTube key"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-300 text-xs">
                        Genres (comma separated)
                      </label>
                      <input
                        value={editGenres}
                        onChange={(e) => setEditGenres(e.target.value)}
                        className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600"
                        placeholder="Animation, Family, Comedy"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 text-xs">
                        Origin countries (comma separated)
                      </label>
                      <input
                        value={editOriginCountry}
                        onChange={(e) => setEditOriginCountry(e.target.value)}
                        className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600"
                        placeholder="US,GB"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-300 text-xs">
                      Storage locations (comma separated)
                    </label>
                    <input
                      value={editLocations}
                      onChange={(e) => setEditLocations(e.target.value)}
                      className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600"
                      placeholder="Comma separated locations"
                    />
                  </div>
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
