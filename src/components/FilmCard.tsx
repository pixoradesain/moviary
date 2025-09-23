import React, { useEffect, useState } from "react";
import { Star, Calendar } from "lucide-react";
import { Film } from "../lib/supabase";
import { getImageUrl, getLocalizedMovie } from "../lib/tmdb";

interface FilmCardProps {
  film: Film;
  onViewDetails: (film: Film) => void;
}

// simple in-memory cache for localized results per session
const localizedCache = new Map<
  number,
  { title?: string; poster_path?: string }
>();

export const FilmCard: React.FC<FilmCardProps> = ({ film, onViewDetails }) => {
  const [localized, setLocalized] = useState<{
    title?: string;
    poster_path?: string;
  } | null>(null);

  useEffect(() => {
    let mounted = true;
    const shouldLocalize = (film.origin_country || []).some(
      (c) => String(c).toUpperCase() === "ID"
    );
    if (!shouldLocalize) return;

    const cached = localizedCache.get(film.tmdb_id);
    if (cached) {
      setLocalized(cached);
      return;
    }

    getLocalizedMovie(film.tmdb_id, "id")
      .then((res) => {
        if (!mounted || !res) return;
        const obj = { title: res.title, poster_path: res.poster_path };
        localizedCache.set(film.tmdb_id, obj);
        setLocalized(obj);
      })
      .catch(() => {
        /* ignore localization errors */
      });

    return () => {
      mounted = false;
    };
  }, [film.tmdb_id, film.origin_country]);

  const posterPath = localized?.poster_path || film.poster_path;
  const title = localized?.title || film.title;

  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group cursor-pointer">
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={getImageUrl(posterPath)}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={() => onViewDetails(film)}
            className="opacity-0 group-hover:opacity-100 bg-amber-500 text-slate-900 px-6 py-2 rounded-lg font-medium transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
          >
            View Details
          </button>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">
          {title}
        </h3>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1">
            <Star className="text-amber-400 w-4 h-4 fill-current" />
            <span className="text-slate-300 text-sm">
              {film.vote_average.toFixed(1)}
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <Calendar className="text-slate-400 w-4 h-4" />
            <span className="text-slate-300 text-sm">
              {new Date(film.release_date).getFullYear()}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {film.genres.slice(0, 2).map((genre, index) => (
            <span
              key={index}
              className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded-full"
            >
              {genre}
            </span>
          ))}
          {film.genres.length > 2 && (
            <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded-full">
              +{film.genres.length - 2}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
