import React from 'react';
import { X, Star, Clock, MapPin } from 'lucide-react';
import { Film } from '../lib/supabase';
import { getImageUrl } from '../lib/tmdb';

interface FilmDetailsProps {
  film: Film;
  isOpen: boolean;
  onClose: () => void;
}

export const FilmDetails: React.FC<FilmDetailsProps> = ({ film, isOpen, onClose }) => {
  if (!isOpen) return null;

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="relative h-64 md:h-80 overflow-hidden rounded-t-lg">
            <img
              src={getImageUrl(film.backdrop_path, 'w1280')}
              alt={film.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-800 via-transparent to-transparent" />
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <img
                src={getImageUrl(film.poster_path, 'w300')}
                alt={film.title}
                className="w-48 h-72 object-cover rounded-lg mx-auto md:mx-0"
              />
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-4">{film.title}</h1>

              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center space-x-1">
                  <Star className="text-amber-400 w-5 h-5 fill-current" />
                  <span className="text-white font-medium">{film.vote_average.toFixed(1)}</span>
                </div>

                <div className="flex items-center space-x-1">
                  <Clock className="text-slate-400 w-5 h-5" />
                  <span className="text-slate-300">{formatRuntime(film.runtime)}</span>
                </div>

                <div className="flex items-center space-x-1">
                  <MapPin className="text-slate-400 w-5 h-5" />
                  <span className="text-slate-300">{film.origin_country.join(', ')}</span>
                </div>

                <span className="text-slate-300">
                  {new Date(film.release_date).getFullYear()}
                </span>
              </div>

              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {film.genres.map((genre, index) => (
                    <span
                      key={index}
                      className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-sm"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-3">Synopsis</h2>
                <p className="text-slate-300 leading-relaxed">{film.overview}</p>
              </div>

              {film.trailer_key && (
                <div>
                  <h2 className="text-xl font-semibold text-white mb-3">Trailer</h2>
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <iframe
                      src={`https://www.youtube.com/embed/${film.trailer_key}`}
                      title={`${film.title} trailer`}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};