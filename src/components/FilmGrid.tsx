import React from 'react';
import { Film } from '../lib/supabase';
import { FilmCard } from './FilmCard';

interface FilmGridProps {
  films: Film[];
  onViewDetails: (film: Film) => void;
}

export const FilmGrid: React.FC<FilmGridProps> = ({ films, onViewDetails }) => {
  if (films.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-slate-400 text-xl mb-4">No films added yet</div>
        <div className="text-slate-500">Start by adding your first watched film!</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {films.map((film) => (
        <FilmCard
          key={film.id}
          film={film}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};