import React, { useState, useEffect } from "react";
import { FilmGrid } from "../components/FilmGrid";
import { FilmDetails } from "../components/FilmDetails";
import { supabase, Film } from "../lib/supabase";

interface HomePageProps {
  onSearch: (handler: ((query: string) => void) | null) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSearch }) => {
  const [films, setFilms] = useState<Film[]>([]);
  const [filteredFilms, setFilteredFilms] = useState<Film[]>([]);
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [genreOptions, setGenreOptions] = useState<string[]>([]);
  const [yearOptions, setYearOptions] = useState<string[]>([]);
  const [countryOptions, setCountryOptions] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>("All");
  const [selectedYear, setSelectedYear] = useState<string>("All");
  const [selectedCountry, setSelectedCountry] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Apply filters and optional search term
  const applyFiltersAndSearch = (term?: string | null) => {
    // guard against null/undefined non-string values
    const raw = term ?? searchQuery ?? "";
    const q = String(raw).trim().toLowerCase();

    const result = films.filter((film) => {
      // Genre filter
      if (selectedGenre && selectedGenre !== "All") {
        const hasGenre = (film.genres || []).some(
          (g) => g && g.toLowerCase() === selectedGenre.toLowerCase()
        );
        if (!hasGenre) return false;
      }

      // Year filter
      if (selectedYear && selectedYear !== "All") {
        if (!film.release_date) return false;
        const yr = new Date(film.release_date).getFullYear().toString();
        if (yr !== selectedYear) return false;
      }

      // Country filter
      if (selectedCountry && selectedCountry !== "All") {
        if (!film.origin_country || !film.origin_country.length) return false;
        const countries = film.origin_country.map((c) => c.toLowerCase());
        if (!countries.includes(selectedCountry.toLowerCase())) return false;
      }

      // Search term
      if (q) {
        const inTitle = film.title && film.title.toLowerCase().includes(q);
        const inGenres = (film.genres || []).some(
          (g) => g && g.toLowerCase().includes(q)
        );
        return inTitle || inGenres;
      }

      return true;
    });

    setFilteredFilms(result);
  };

  useEffect(() => {
    loadFilms();
  }, []);

  useEffect(() => {
    // derive filter options from available films
    const genres = new Set<string>();
    const years = new Set<number>();
    const countries = new Set<string>();

    films.forEach((f) => {
      (f.genres || []).forEach((g) => g && genres.add(g));
      if (f.release_date) years.add(new Date(f.release_date).getFullYear());
      (f.origin_country || []).forEach((c) => c && countries.add(c));
    });

    setGenreOptions([
      "All",
      ...Array.from(genres).sort((a, b) => a.localeCompare(b)),
    ]);
    setYearOptions([
      "All",
      ...Array.from(years)
        .sort((a, b) => b - a)
        .map(String),
    ]);
    setCountryOptions([
      "All",
      ...Array.from(countries).sort((a, b) => a.localeCompare(b)),
    ]);

    // apply filters after options change / films load
    applyFiltersAndSearch();
  }, [films, selectedGenre, selectedYear, selectedCountry]);

  useEffect(() => {
    // expose search handler used by Header -> App
    // register asynchronously to avoid updating parent while rendering
    const handler = (query: string | null) => {
      const qRaw = query ?? "";
      setSearchQuery(String(qRaw));
      applyFiltersAndSearch(qRaw);
    };

    const id = window.setTimeout(() => onSearch(handler), 0);
    // cleanup on unmount - clear and remove handler asynchronously
    return () => {
      clearTimeout(id);
      window.setTimeout(() => onSearch(null), 0);
    };
  }, [films, selectedGenre, selectedYear, selectedCountry, onSearch]);

  const loadFilms = async () => {
    try {
      const { data, error } = await supabase
        .from("films")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFilms(data || []);
    } catch (error) {
      console.error("Error loading films:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (film: Film) => {
    setSelectedFilm(film);
    setIsDetailsOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">
          Loading your film collection...
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Watched Movies</h2>
        <p className="text-slate-400">
          {films.length} film{films.length !== 1 ? "s" : ""} watched
        </p>
      </div>

      {/* Filter bar - responsive and accessible */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-3 sm:space-y-0">
          <div className="flex-1 sm:flex-none">
            <label className="sr-only">Genre</label>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full sm:w-56 bg-slate-700 text-white rounded px-3 py-2 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {genreOptions.map((g) => (
                <option key={g} value={g} className="bg-slate-800 text-white">
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 sm:flex-none">
            <label className="sr-only">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full sm:w-48 bg-slate-700 text-white rounded px-3 py-2 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y} className="bg-slate-800 text-white">
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 sm:flex-none">
            <label className="sr-only">Country</label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full sm:w-56 bg-slate-700 text-white rounded px-3 py-2 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {countryOptions.map((c) => (
                <option key={c} value={c} className="bg-slate-800 text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 sm:flex-auto flex justify-end">
            <button
              onClick={() => {
                setSelectedGenre("All");
                setSelectedYear("All");
                setSelectedCountry("All");
                setSearchQuery("");
                applyFiltersAndSearch("");
              }}
              className="ml-auto bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded border border-slate-600"
            >
              Clear filters
            </button>
          </div>
        </div>
      </div>

      <FilmGrid films={filteredFilms} onViewDetails={handleViewDetails} />

      {selectedFilm && (
        <FilmDetails
          film={selectedFilm}
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
        />
      )}
    </main>
  );
};
